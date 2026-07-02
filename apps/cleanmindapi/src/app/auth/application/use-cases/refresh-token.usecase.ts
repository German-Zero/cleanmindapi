import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { JwtPort } from "../ports/outbound/jwt.port";
import { AuthResponse } from "../../api/response/auth-response";
import { AuthResponseMapper } from "../../api/mapper/auth-response.mapper";
import { RefreshTokenPort } from "../ports/inbound/refresh-token.port";
import { RefreshTokenValidationService } from "../../domain/services/refresh-token-validation.service";
import { RefreshTokenCommand } from "../commands/refresh-token.command";

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenPort {
  constructor(
    private readonly jwtPort: JwtPort,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly refreshTokenHasher: TokenHasherPort,
    private readonly refreshTokenValidationService: RefreshTokenValidationService
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<AuthResponse> {
    const payload = await this.jwtPort.verifyRefreshToken(
      command.refreshToken,
    );

    const user = await this.userRepository.findById(payload.sub);

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

    const generatedTokens =
      await this.jwtPort.generateTokens(user);

    const newHash =
      await this.refreshTokenHasher.hash(
        generatedTokens.refreshToken,
      );

    const rotatedRefreshToken =
      currentRefreshToken.rotate(
        newHash,
        new Date(
          Date.now() +
            generatedTokens.refreshTokenExpiresIn * 1000,
        ),
      );

    await this.refreshTokenRepository.update(
      currentRefreshToken,
    );

    await this.refreshTokenRepository.create(
      rotatedRefreshToken,
    );

    return AuthResponseMapper.toResponse(
      user,
      generatedTokens,
    )
  }
}
