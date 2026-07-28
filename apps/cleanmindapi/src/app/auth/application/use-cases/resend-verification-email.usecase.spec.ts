import { User } from "../../../users/domain/entities/user.entity";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { Email } from "../../../users/domain/value-objects/email.vo";
import { VerificationTokenRepository } from "../../domain/repositories/verification-token.repository";
import { ResendVerificationEmailCommand } from "../commands/resend-verification-email.command";
import { MailPort } from "../ports/outbound/mail.port";
import { TokenGeneratorPort } from "../ports/outbound/token-generator.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { ResendVerificationEmailUseCase } from "./resend-verification-email.usecase";

describe('ResendVerificationEmailUseCase', () => {
  const userRepository = {
    findById: jest.fn(),
  } as unknown as UserRepository;
  const verificationTokenRepository = {
    create: jest.fn(),
  } as unknown as VerificationTokenRepository;
  const tokenGenerator = {
    generate: jest.fn(),
  } as unknown as TokenGeneratorPort;
  const tokenHasher = {
    hash: jest.fn(),
  } as unknown as TokenHasherPort;
  const mail = {
    sendVerificationEmail: jest.fn(),
  } as unknown as MailPort;

  const useCase = new ResendVerificationEmailUseCase(
    userRepository,
    verificationTokenRepository,
    tokenGenerator,
    tokenHasher,
    mail,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and sends a new code for an unverified user', async () => {
    const user = User.createLocal({
      name: 'Clean Mind',
      email: new Email('clean@example.com'),
      passwordHash: 'hash',
    });

    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValue(user);
    jest
      .spyOn(tokenGenerator, 'generate')
      .mockReturnValue('123456');
    jest
      .spyOn(tokenHasher, 'hash')
      .mockResolvedValue('code-hash');

    await useCase.execute(
      new ResendVerificationEmailCommand(user.id),
    );

    expect(verificationTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: 'code-hash',
        userId: user.id,
      }),
    );
    expect(mail.sendVerificationEmail).toHaveBeenCalledWith(
      'clean@example.com',
      '123456',
    );
  });

  it('does not send another code when the email is verified', async () => {
    const user = User.createLocal({
      name: 'Clean Mind',
      email: new Email('clean@example.com'),
      passwordHash: 'hash',
    });
    user.verifyEmail();

    jest
      .spyOn(userRepository, 'findById')
      .mockResolvedValue(user);

    await useCase.execute(
      new ResendVerificationEmailCommand(user.id),
    );

    expect(tokenGenerator.generate).not.toHaveBeenCalled();
    expect(verificationTokenRepository.create).not.toHaveBeenCalled();
    expect(mail.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
