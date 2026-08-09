import { UserSettingsRepository } from '../../../settings/domain/repositories/user-settings.repository';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { LoginGoogleCommand } from '../commands/login-google.command';
import { ClosedBetaRegistrationService } from '../services/closed-beta-registration.service';
import { MfaService } from '../services/mfa.service';
import { SessionIssuerService } from '../services/session-issuer.service';
import { LoginGoogleUseCase } from './login-google.usecase';

describe('LoginGoogleUseCase closed beta', () => {
  const createUseCase = (existingUser: User | null) => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(existingUser),
    } as unknown as UserRepository;
    const settings = {
      create: jest.fn().mockResolvedValue(undefined),
    } as unknown as UserSettingsRepository;
    const mfa = {
      beginLogin: jest.fn().mockResolvedValue(null),
    } as unknown as MfaService;
    const sessions = {
      issue: jest.fn().mockResolvedValue({ mfaRequired: false }),
    } as unknown as SessionIssuerService;
    const betaRegistration = {
      create: jest.fn(),
    } as unknown as ClosedBetaRegistrationService;

    return {
      betaRegistration,
      settings,
      useCase: new LoginGoogleUseCase(
        users,
        settings,
        mfa,
        sessions,
        betaRegistration,
      ),
    };
  };

  it('lets an existing Google user log in without checking registration', async () => {
    const user = User.createGoogle({
      name: 'Tester',
      email: new Email('tester@example.com'),
    });
    const { betaRegistration, settings, useCase } = createUseCase(user);

    await useCase.execute(
      new LoginGoogleCommand('tester@example.com', 'Tester', null),
    );

    expect(betaRegistration.create).not.toHaveBeenCalled();
    expect(settings.create).not.toHaveBeenCalled();
  });

  it('uses the closed beta policy before creating a new Google user', async () => {
    const createdUser = User.createGoogle({
      name: 'Invited tester',
      email: new Email('invited@example.com'),
    });
    const { betaRegistration, settings, useCase } = createUseCase(null);
    jest.spyOn(betaRegistration, 'create').mockResolvedValue(createdUser);

    await useCase.execute(
      new LoginGoogleCommand(
        'invited@example.com',
        'Invited tester',
        null,
      ),
    );

    expect(betaRegistration.create).toHaveBeenCalledTimes(1);
    expect(settings.create).toHaveBeenCalledTimes(1);
  });
});
