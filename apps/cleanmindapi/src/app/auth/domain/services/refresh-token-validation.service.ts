import { Injectable, UnauthorizedException } from "@nestjs/common";
import { RefreshToken } from "../entities/refresh-token.entity";
import { TokenHasherPort } from "../../application/ports/outbound/token-hasher.port";

@Injectable()
export class RefreshTokenValidationService {
  constructor(
    private readonly refreshTokenHasher: TokenHasherPort
  ) {}

  async validate(plainRefreshToken: string, refreshTokens: RefreshToken[]): Promise<RefreshToken> {
    for (const refreshToken of refreshTokens) {
      const matches = await this.refreshTokenHasher.compare(
        plainRefreshToken,
        refreshToken.tokenHash,
      );

      if (matches && refreshToken.isValid()) {
        return refreshToken;
      }
    }

    throw new UnauthorizedException('Tu sesión venció. Inicia sesión nuevamente.')
  }
}
