import { MfaService } from '../services/mfa.service';
import { SessionIssuerService } from '../services/session-issuer.service';
import { PasswordHasherPort } from '../ports/outbound/password-hasher.port';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { AuthProvider } from '../../../users/domain/enums/auth-provider.enum';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { LoginUserCommand } from '../commands/login-user.command';
import { LoginUserUseCase } from './login-user.usecase';

describe('LoginUserUseCase MFA', () => {
  it('does not issue tokens before the second factor', async () => {
    const user = new User(
      'user-id',
      'Mindful User',
      new Email('user@example.com'),
      'password-hash',
      AuthProvider.LOCAL,
      UserRole.USER,
      true,
      null,
      new Date(),
      new Date(),
      null,
    );
    const users = {
      findByEmail: jest.fn().mockResolvedValue(user),
    } as unknown as UserRepository;
    const passwords = {
      compare: jest.fn().mockResolvedValue(true),
    } as unknown as PasswordHasherPort;
    const challenge = {
      mfaRequired: true as const,
      challengeToken: 'challenge-token',
      expiresIn: 300,
    };
    const mfa = {
      beginLogin: jest.fn().mockResolvedValue(challenge),
    } as unknown as MfaService;
    const sessions = {
      issue: jest.fn(),
    } as unknown as SessionIssuerService;
    const useCase = new LoginUserUseCase(users, passwords, mfa, sessions);

    const result = await useCase.execute(
      new LoginUserCommand('user@example.com', 'valid-password'),
    );

    expect(result).toEqual(challenge);
    expect(sessions.issue).not.toHaveBeenCalled();
  });
});
