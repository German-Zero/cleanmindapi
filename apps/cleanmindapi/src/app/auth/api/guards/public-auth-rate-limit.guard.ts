import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_TRACKED_KEYS = 10_000;

interface RequestLimit {
  count: number;
  expiresAt: number;
}

@Injectable()
export class PublicAuthRateLimitGuard implements CanActivate {
  private readonly limits = new Map<string, RequestLimit>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ ip?: string }>();
    const key = `${context.getClass().name}:${context.getHandler().name}:${request.ip ?? 'unknown'}`;
    const now = Date.now();
    const current = this.limits.get(key);

    if (!current || current.expiresAt <= now) {
      this.removeExpired(now);

      if (this.limits.size >= MAX_TRACKED_KEYS) {
        throw new HttpException(
          'Demasiadas solicitudes. Intenta nuevamente más tarde.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.limits.set(key, { count: 1, expiresAt: now + WINDOW_MS });
      return true;
    }

    if (current.count >= MAX_REQUESTS) {
      throw new HttpException(
        'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    return true;
  }

  private removeExpired(now: number): void {
    for (const [key, limit] of this.limits) {
      if (limit.expiresAt <= now) this.limits.delete(key);
    }
  }
}
