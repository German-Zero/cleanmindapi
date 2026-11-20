import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationError } from '../../../shared/application/errors/application-error';

import { User } from '../../../users/domain/entities/user.entity';
import { UserCapacityReachedException } from '../../../users/domain/exceptions/user-capacity-reached.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { RegistrationStatusResponse } from '../common/responses/registration-status.response';
import { RegistrationStatusPort } from '../ports/inbound/registration-status.port';

export type BetaRegistrationBlockReason = 'not-invited' | 'full';

export class BetaRegistrationException extends ApplicationError {
  constructor(public readonly reason: BetaRegistrationBlockReason) {
    super(
      'BETA_REGISTRATION_BLOCKED',
      reason === 'not-invited'
        ? 'Esta beta privada es solo por invitación.'
        : 'El cupo de la beta está completo.',
    );
  }
}

@Injectable()
export class ClosedBetaRegistrationService implements RegistrationStatusPort {
  private readonly allowedEmails: ReadonlySet<string>;
  private readonly maxUsers: number;

  constructor(
    private readonly users: UserRepository,
    config: ConfigService,
  ) {
    this.allowedEmails = new Set(
      config.get<string[]>('auth.beta.allowedEmails') ?? [],
    );
    this.maxUsers = config.get<number>('auth.beta.maxUsers') ?? 20;
  }

  assertEmailAllowed(email: Email): void {
    if (!this.allowedEmails.has(email.getValue().toLowerCase())) {
      throw new BetaRegistrationException('not-invited');
    }
  }

  async create(user: User): Promise<User> {
    this.assertEmailAllowed(user.email);

    try {
      return await this.users.createWithinLimit(user, this.maxUsers);
    } catch (error) {
      if (error instanceof UserCapacityReachedException) {
        throw new BetaRegistrationException('full');
      }

      throw error;
    }
  }

  async getStatus(): Promise<RegistrationStatusResponse> {
    const userCount = await this.users.count();
    const remaining = Math.max(0, this.maxUsers - userCount);

    return {
      privateBeta: true,
      acceptsNewUsers: this.allowedEmails.size > 0 && remaining > 0,
      maxUsers: this.maxUsers,
      remaining,
    };
  }
}
