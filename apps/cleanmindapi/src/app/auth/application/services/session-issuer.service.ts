import { Injectable } from '@nestjs/common';

import { User } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { AuthResponseMapper } from '../../api/mapper/auth-response.mapper';
import { AuthResponse } from '../../api/response/auth-response';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { JwtPort } from '../ports/outbound/jwt.port';
import { TokenHasherPort } from '../ports/outbound/token-hasher.port';
import { AuthenticationMethod } from '../common/authentication-context';

@Injectable()
export class SessionIssuerService {
  constructor(
    private readonly jwt: JwtPort,
    private readonly tokenHasher: TokenHasherPort,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly users: UserRepository,
  ) {}

  async issue(
    user: User,
    methods: AuthenticationMethod[],
    authTime = Math.floor(Date.now() / 1000),
  ): Promise<AuthResponse> {
    const tokens = await this.jwt.generateTokens(user, { authTime, methods });
    const tokenHash = await this.tokenHasher.hash(tokens.refreshToken);

    await this.refreshTokens.create(
      RefreshToken.create({
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + tokens.refreshTokenExpiresIn * 1000,
        ),
      }),
    );

    user.updateLastLogin();
    await this.users.update(user);

    return AuthResponseMapper.toResponse(user, tokens);
  }
}
