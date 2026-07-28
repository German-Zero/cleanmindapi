import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { UserNotFoundException } from "../../../users/domain/exceptions/user-not-found.exception";
import { VerificationToken } from "../../domain/entities/verification-token.entity";
import { VerificationTokenRepository } from "../../domain/repositories/verification-token.repository";
import { ResendVerificationEmailCommand } from "../commands/resend-verification-email.command";
import { ResendVerificationEmailPort } from "../ports/inbound/resend-verification-email.port";
import { MailPort } from "../ports/outbound/mail.port";
import { TokenGeneratorPort } from "../ports/outbound/token-generator.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";

@Injectable()
export class ResendVerificationEmailUseCase
  implements ResendVerificationEmailPort
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly tokenHasher: TokenHasherPort,
    private readonly mail: MailPort,
  ) {}

  async execute(
    command: ResendVerificationEmailCommand,
  ): Promise<void> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.emailVerified) {
      return;
    }

    const code = this.tokenGenerator.generate();
    const tokenHash = await this.tokenHasher.hash(code);
    const verificationToken = VerificationToken.create({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await this.verificationTokenRepository.create(verificationToken);
    await this.mail.sendVerificationEmail(
      user.email.getValue(),
      code,
    );
  }
}
