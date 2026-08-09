import { Injectable } from '@nestjs/common';

import { UserSettings } from '../../../settings/domain/entities/user-settings.entity';
import { UserSettingsRepository } from '../../../settings/domain/repositories/user-settings.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { LoginResponse } from '../../api/response/auth-response';
import { LoginGoogleCommand } from '../commands/login-google.command';
import { LoginGooglePort } from '../ports/inbound/login-google.port';
import { MfaService } from '../services/mfa.service';
import { SessionIssuerService } from '../services/session-issuer.service';
import { ClosedBetaRegistrationService } from '../services/closed-beta-registration.service';

@Injectable()
export class LoginGoogleUseCase implements LoginGooglePort {
  constructor(
    private readonly users: UserRepository,
    private readonly settings: UserSettingsRepository,
    private readonly mfa: MfaService,
    private readonly sessions: SessionIssuerService,
    private readonly betaRegistration: ClosedBetaRegistrationService,
  ) {}

  async execute(command: LoginGoogleCommand): Promise<LoginResponse> {
    const email = new Email(command.email);
    let user = await this.users.findByEmail(email);

    if (!user) {
      user = await this.betaRegistration.create(
        User.createGoogle({
          name: command.name,
          email,
          avatarUrl: command.avatarUrl,
        }),
      );

      await this.settings.create(UserSettings.createDefault(user.id));
    }

    const challenge = await this.mfa.beginLogin(user, 'google');

    return challenge ?? this.sessions.issue(user, ['google']);
  }
}
