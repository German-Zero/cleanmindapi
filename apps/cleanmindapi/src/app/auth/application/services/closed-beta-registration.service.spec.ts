import { ConfigService } from '@nestjs/config';

import { User } from '../../../users/domain/entities/user.entity';
import { UserCapacityReachedException } from '../../../users/domain/exceptions/user-capacity-reached.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import {
  BetaRegistrationException,
  ClosedBetaRegistrationService,
} from './closed-beta-registration.service';

describe('ClosedBetaRegistrationService', () => {
  const createService = (
    users: Partial<UserRepository> = {},
    allowedEmails = ['tester@example.com'],
  ) => {
    const repository = {
      count: jest.fn().mockResolvedValue(12),
      createWithinLimit: jest.fn(),
      ...users,
    } as unknown as UserRepository;
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'auth.beta.allowedEmails') return allowedEmails;
        if (key === 'auth.beta.maxUsers') return 20;
        return undefined;
      }),
    } as unknown as ConfigService;

    return {
      service: new ClosedBetaRegistrationService(repository, config),
    };
  };

  it('rejects an email outside the allowlist', () => {
    const { service } = createService();

    expect(() => service.assertEmailAllowed(new Email('other@example.com')))
      .toThrow(BetaRegistrationException);
  });

  it('reports remaining capacity without exposing the allowlist', async () => {
    const { service } = createService();

    await expect(service.getStatus()).resolves.toEqual({
      privateBeta: true,
      acceptsNewUsers: true,
      maxUsers: 20,
      remaining: 8,
    });
  });

  it('fails closed when no email is configured', async () => {
    const { service } = createService({}, []);

    await expect(service.getStatus()).resolves.toMatchObject({
      acceptsNewUsers: false,
    });
  });

  it('maps a full database to the public beta error', async () => {
    const user = {
      email: new Email('tester@example.com'),
    } as User;
    const { service } = createService({
      createWithinLimit: jest.fn().mockRejectedValue(
        new UserCapacityReachedException(20),
      ),
    });

    await expect(service.create(user)).rejects.toMatchObject({
      reason: 'full',
    });
  });
});
