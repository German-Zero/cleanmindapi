import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordResetToken } from "../../domain/entities/password-reset-token.entity";
import { PasswordResetTokenRepository } from "../../domain/repositories/password-reset-token.repository";
import { ForgotPasswordCommand } from "../commands/forgot-password.command";
import { ForgotPasswordPort } from "../ports/inbound/forgot-password.port";
import { MailPort } from "../ports/outbound/mail.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { TokenGeneratorPort } from "../ports/outbound/token-generator.port";
import { Email } from "../../../users/domain/value-objects/email.vo";

@Injectable()
export class ForgotPasswordUseCase implements ForgotPasswordPort
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetTokenRepository,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenHasher: TokenHasherPort,
    private readonly mail: MailPort,
  ) {}

  async execute(command: ForgotPasswordCommand,): Promise<void> {
    const email = new Email(command.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) return;

    const token = this.tokenGenerator.generate();

    const tokenHash = await this.tokenHasher.hash(token);

    const resetToken =
      PasswordResetToken.create({
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 30,
        ),
      });

    await this.passwordResetRepository.create(resetToken);

    await this.mail.sendResetPasswordEmail(user.email.getValue(), token, );
  }
}
