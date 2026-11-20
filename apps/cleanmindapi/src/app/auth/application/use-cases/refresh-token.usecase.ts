import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { TokenHasherPort } from '../ports/outbound/token-hasher.port';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { JwtPort } from '../ports/outbound/jwt.port';
import { AuthResponse } from '../common/responses/auth-response';
import { AuthResponseMapper } from '../common/mappers/auth-response.mapper';
import { RefreshTokenPort } from '../ports/inbound/refresh-token.port';
import { RefreshTokenValidationService } from '../services/refresh-token-validation.service';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { AuthProvider } from '../../../users/domain/enums/auth-provider.enum';
import { TermsPort } from '../../../legal/application/ports/inbound/terms.port';

@Injectable()
export class RefreshTokenUseCase implements RefreshTokenPort {
  constructor(
    private readonly jwtPort: JwtPort,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly refreshTokenHasher: TokenHasherPort,
    private readonly refreshTokenValidationService: RefreshTokenValidationService,
    private readonly terms: TermsPort,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResponse> {
    const payload = await this.jwtPort.verifyRefreshToken(command.refreshToken);

    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'Tu sesión no es válida. Inicia sesión nuevamente.',
      );
    }

    const refreshTokens = await this.refreshTokenRepository.findByUserId(
      user.id,
    );

    const currentRefreshToken =
      await this.refreshTokenValidationService.validate(
        command.refreshToken,
        refreshTokens,
      );

    const generatedTokens = await this.jwtPort.generateTokens(user, {
      authTime:
        payload.authTime ?? payload.iat ?? Math.floor(Date.now() / 1000),
      methods: payload.amr ?? [
        user.provider === AuthProvider.GOOGLE ? 'google' : 'pwd',
      ],
    });

    const newHash = await this.refreshTokenHasher.hash(
      generatedTokens.refreshToken,
    );

    const rotatedRefreshToken = currentRefreshToken.rotate(
      newHash,
      new Date(Date.now() + generatedTokens.refreshTokenExpiresIn * 1000),
    );

    const rotated = await this.refreshTokenRepository.rotate(
      currentRefreshToken,
      rotatedRefreshToken,
    );

    if (!rotated) {
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'Tu sesión ya fue utilizada o venció. Inicia sesión nuevamente.',
      );
    }

    return AuthResponseMapper.toResponse(
      user,
      generatedTokens,
      await this.terms.requiresAcceptance(user.id),
    );
  }
}
