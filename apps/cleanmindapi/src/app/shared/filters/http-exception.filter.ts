import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { Request, Response } from 'express';

import { ErrorResponse } from './error-response';
import { DomainError } from '../domain/errors/domain-error';
import { ApplicationError, ApplicationErrorCode } from '../application/errors/application-error';

const errorLabels: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Solicitud incorrecta',
  [HttpStatus.UNAUTHORIZED]: 'No autorizado',
  [HttpStatus.FORBIDDEN]: 'Acceso denegado',
  [HttpStatus.NOT_FOUND]: 'No encontrado',
  [HttpStatus.CONFLICT]: 'Conflicto',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Datos no válidos',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Servicio no disponible',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno',
};

const genericMessages: Record<string, string> = {
  'Bad Request': 'Revisa los datos enviados.',
  Unauthorized: 'Debes iniciar sesión para continuar.',
  'Forbidden resource': 'No tienes permiso para realizar esta acción.',
  'Not Found': 'No encontramos el recurso solicitado.',
  'Too Many Requests': 'Realizaste demasiados intentos. Espera un momento.',
};

const domainErrorStatuses: Record<string, HttpStatus> = {
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  INVALID_PASSWORD: HttpStatus.BAD_REQUEST,
  EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  USER_CAPACITY_REACHED: HttpStatus.CONFLICT,
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  TASK_ACCESS_DENIED: HttpStatus.FORBIDDEN,
  TASK_NOT_FOUND: HttpStatus.NOT_FOUND,
  POMODORO_SESSION_ALREADY_PAUSED: HttpStatus.CONFLICT,
  POMODORO_SESSION_NOT_PAUSED: HttpStatus.CONFLICT,
  POMODORO_SESSION_NOT_ACTIVE: HttpStatus.CONFLICT,
};

const applicationErrorStatuses: Record<ApplicationErrorCode, HttpStatus> = {
  [ApplicationErrorCode.AUTH_INVALID_INPUT]: HttpStatus.BAD_REQUEST,
  [ApplicationErrorCode.AUTH_UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ApplicationErrorCode.AUTH_FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ApplicationErrorCode.AUTH_CONFLICT]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.AUTH_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.BETA_REGISTRATION_BLOCKED]: HttpStatus.FORBIDDEN,
  [ApplicationErrorCode.TERMS_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [ApplicationErrorCode.SETTINGS_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.POMODORO_INVALID_PERIOD]: HttpStatus.BAD_REQUEST,
  [ApplicationErrorCode.POMODORO_SESSION_CONFLICT]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.POMODORO_SESSION_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.TASK_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.DISCORD_UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ApplicationErrorCode.DISCORD_CONFLICT]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.DISCORD_NOT_FOUND]: HttpStatus.NOT_FOUND,
};

function localizeMessage(message: string | string[]): string | string[] {
  const translate = (value: string) => genericMessages[value] ?? value;

  return Array.isArray(message) ? message.map(translate) : translate(message);
}

function statusFor(exception: unknown): HttpStatus {
  if (exception instanceof HttpException) return exception.getStatus();

  if (exception instanceof DomainError) {
    return (
      domainErrorStatuses[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  if (exception instanceof ApplicationError) {
    return (
      applicationErrorStatuses[exception.code] ??
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(exception);

    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();

    const response = ctx.getResponse<Response>();

    const domainError = exception instanceof DomainError ? exception : null;
    const applicationError =
      exception instanceof ApplicationError ? exception : null;
    const status = statusFor(exception);

    let message: string | string[] = 'Ocurrió un error inesperado.';

    const error = errorLabels[status] ?? 'Error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = localizeMessage(exceptionResponse);
      } else {
        const body = exceptionResponse as Record<string, unknown>;

        message = localizeMessage(
          (body.message as string | string[]) ?? message,
        );
      }
    } else if (domainError) {
      message = localizeMessage(domainError.message);
    } else if (applicationError) {
      message = localizeMessage(applicationError.message);
    }

    const body: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}
