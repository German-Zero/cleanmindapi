import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Password } from "../../../users/domain/value-objects/password.vo";
import { ResetPasswordCommand } from "../commands/reset-password.command";
import { PasswordHasherPort } from "../ports/outbound/password-hasher.port";
import { PasswordResetTokenRepository } from "../../domain/repositories/password-reset-token.repository";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { ResetPasswordPort } from "../ports/inbound/reset-password.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordPort
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenHasher: TokenHasherPort,
  ) {}

  async execute(command: ResetPasswordCommand,): Promise<void> {
    const tokenHash =
      await this.tokenHasher.hash(command.token);

    const resetToken =
      await this.passwordResetRepository.findByHash(
        tokenHash,
      );

    if (
      !resetToken ||
      resetToken.isExpired ||
      resetToken.isUsed
    ) {
      throw new UnauthorizedException(
        'Invalid reset token',
      );
    }

    const user =
      await this.userRepository.findById(
        resetToken.userId,
      );

    if (!user) {
      throw new UnauthorizedException();
    }

    const password = new Password(
      command.password,
    );

    const passwordHash =
      await this.passwordHasher.hash(password);

    user.changePassword(passwordHash)

    resetToken.use();

    await this.userRepository.update(user);

    await this.passwordResetRepository.update(
      resetToken,
    );
  }
}
