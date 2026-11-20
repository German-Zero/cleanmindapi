import { ExecutionContext, HttpException } from '@nestjs/common';
import { PublicAuthRateLimitGuard } from './public-auth-rate-limit.guard';

describe('PublicAuthRateLimitGuard', () => {
  beforeEach(() =>
    jest.useFakeTimers().setSystemTime(new Date('2026-11-19T12:00:00Z')),
  );
  afterEach(() => jest.useRealTimers());

  function context(ip: string): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ ip }) }),
      getClass: () => ({ name: 'AuthController' }),
      getHandler: () => ({ name: 'login' }),
    } as unknown as ExecutionContext;
  }

  it('blocks requests after the limit and allows them after the window', () => {
    const guard = new PublicAuthRateLimitGuard();
    const request = context('127.0.0.1');

    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(guard.canActivate(request)).toBe(true);
    }

    try {
      guard.canActivate(request);
      fail('Expected the request limit to reject the request.');
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(429);
    }

    jest.advanceTimersByTime(60_000);

    expect(guard.canActivate(request)).toBe(true);
  });
});
