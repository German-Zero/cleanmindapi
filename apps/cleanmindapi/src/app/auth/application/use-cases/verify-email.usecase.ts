import { Injectable, UnauthorizedException } from "@nestjs/common";
import { VerifyEmailCommand } from "../commands/verify-email.command";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { VerificationTokenRepository } from "../../domain/repositories/verification-token.repository";
import { VerifyEmailPort } from "../ports/inbound/verify-email.port";

@Injectable()
export class VerifyEmailUseCase implements VerifyEmailPort
{
  constructor(
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenHasher: TokenHasherPort,
  ) {}

  async execute(
    command: VerifyEmailCommand,
  ): Promise<void> {
    const tokenHash =
      await this.tokenHasher.hash(command.token);

    const verificationToken =
      await this.verificationTokenRepository.findByHash(
        tokenHash,
      );

    if (
      !verificationToken ||
      verificationToken.isExpired ||
      verificationToken.isVerified
    ) {
      throw new UnauthorizedException(
        'Invalid verification token',
      );
    }

    const user =
      await this.userRepository.findById(
        verificationToken.userId,
      );

    if (!user) {
      throw new UnauthorizedException();
    }

    user.verifyEmail();

    verificationToken.verify();

    await this.userRepository.update(user);

    await this.verificationTokenRepository.update(
      verificationToken,
    );
  }
}
