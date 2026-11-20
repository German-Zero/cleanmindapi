import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { TokenHasherPort } from '../ports/outbound/token-hasher.port';

@Injectable()
export class RefreshTokenValidationService {
  constructor(private readonly refreshTokenHasher: TokenHasherPort) {}

  async validate(
    plainRefreshToken: string,
    refreshTokens: RefreshToken[],
  ): Promise<RefreshToken> {
    for (const refreshToken of refreshTokens) {
      const matches = await this.refreshTokenHasher.compare(
        plainRefreshToken,
        refreshToken.tokenHash,
      );

      if (matches && refreshToken.isValid()) {
        return refreshToken;
      }
    }

    throw new ApplicationError(
      'AUTH_UNAUTHORIZED',
      'Tu sesión venció. Inicia sesión nuevamente.',
    );
  }
}
