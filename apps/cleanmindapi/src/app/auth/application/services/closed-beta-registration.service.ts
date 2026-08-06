import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '../../../users/domain/entities/user.entity';
import { UserCapacityReachedException } from '../../../users/domain/exceptions/user-capacity-reached.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { RegistrationStatusResponse } from '../../api/response/registration-status.response';

export type BetaRegistrationBlockReason = 'not-invited' | 'full';

export class BetaRegistrationException extends ForbiddenException {
  constructor(public readonly reason: BetaRegistrationBlockReason) {
    const notInvited = reason === 'not-invited';

    super({
      statusCode: HttpStatus.FORBIDDEN,
      code: notInvited
        ? 'BETA_EMAIL_NOT_ALLOWED'
        : 'BETA_CAPACITY_REACHED',
      message: notInvited
        ? 'Esta beta privada es solo por invitación.'
        : 'El cupo de la beta está completo.',
      error: 'Registro no disponible',
    });
  }
}

@Injectable()
export class ClosedBetaRegistrationService {
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
