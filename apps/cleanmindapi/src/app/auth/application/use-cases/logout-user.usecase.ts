import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LogoutPort } from "../ports/inbound/logout.port";
import { JwtPort } from "../ports/outbound/jwt.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { RefreshTokenValidationService } from "../../domain/services/refresh-token-validation.service";
import { LogoutCommand } from "../commands/logout.command";

@Injectable()
export class LogoutUserUseCase implements LogoutPort {
  constructor(
    private readonly jwtPort: JwtPort,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly refreshTokenValidationService: RefreshTokenValidationService
  ) {}

  async execute(
    command: LogoutCommand,
  ): Promise<void> {
    const payload = await this.jwtPort.verifyRefreshToken(
      command.refreshToken,
    );

    const user = await this.userRepository.findById(
      payload.sub,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const refreshTokens =
      await this.refreshTokenRepository.findByUserId(
        user.id,
      );

    const currentRefreshToken =
      await this.refreshTokenValidationService.validate(
        command.refreshToken,
        refreshTokens,
      );

    currentRefreshToken.revoke();

    await this.refreshTokenRepository.update(
      currentRefreshToken,
    );
  }
}
