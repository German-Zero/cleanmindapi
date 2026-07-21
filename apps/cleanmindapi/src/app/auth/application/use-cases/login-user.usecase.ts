import { Injectable } from '@nestjs/common';

import { Email } from '../../../users/domain/value-objects/email.vo';
import { Password } from '../../../users/domain/value-objects/password.vo';
import { InvalidCredentialsException } from '../../../users/domain/exceptions/invalid-credentials.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { LoginResponse } from '../../api/response/auth-response';
import { LoginUserCommand } from '../commands/login-user.command';
import { LoginUserPort } from '../ports/inbound/login-user.port';
import { PasswordHasherPort } from '../ports/outbound/password-hasher.port';
import { MfaService } from '../services/mfa.service';
import { SessionIssuerService } from '../services/session-issuer.service';

@Injectable()
export class LoginUserUseCase implements LoginUserPort {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly mfa: MfaService,
    private readonly sessions: SessionIssuerService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResponse> {
    const email = new Email(command.email);
    const password = new Password(command.password);
    const user = await this.users.findByEmail(email);

    if (!user?.passwordHash) throw new InvalidCredentialsException();

    const validPassword = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );

    if (!validPassword) throw new InvalidCredentialsException();

    const challenge = await this.mfa.beginLogin(user, 'pwd');

    return challenge ?? this.sessions.issue(user, ['pwd']);
  }
}
