import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

import { Request, Response } from "express";

import { ErrorResponse } from "./error-response";

const errorLabels: Partial<Record<HttpStatus, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Solicitud incorrecta',
  [HttpStatus.UNAUTHORIZED]: 'No autorizado',
  [HttpStatus.FORBIDDEN]: 'Acceso denegado',
  [HttpStatus.NOT_FOUND]: 'No encontrado',
  [HttpStatus.CONFLICT]: 'Conflicto',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Datos no válidos',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno',
};

const genericMessages: Record<string, string> = {
  'Bad Request': 'Revisa los datos enviados.',
  Unauthorized: 'Debes iniciar sesión para continuar.',
  'Forbidden resource': 'No tienes permiso para realizar esta acción.',
  'Not Found': 'No encontramos el recurso solicitado.',
  'Too Many Requests': 'Realizaste demasiados intentos. Espera un momento.',
};

function localizeMessage(message: string | string[]): string | string[] {
  const translate = (value: string) => genericMessages[value] ?? value;

  return Array.isArray(message)
    ? message.map(translate)
    : translate(message);
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.error(exception);

    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();

    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Ocurrió un error inesperado.';

    const error = errorLabels[status] ?? 'Error';

    if (exception instanceof HttpException) {
      const exceptionResponse =
        exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = localizeMessage(exceptionResponse);
      } else {
        const body = exceptionResponse as Record<string, unknown>

        message = localizeMessage(
          (body.message as string | string[]) ?? message,
        );
      }
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
