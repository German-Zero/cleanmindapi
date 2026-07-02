import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPort } from "../../application/ports/outbound/jwt.port";
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from "../../application/common/jwt-payload";
import { User } from "../../../users/domain/entities/user.entity";
import { GeneratedTokens } from "../../application/common/generated-tokens";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";
import ms from "ms";

@Injectable()
export class JwtServiceService implements JwtPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

async generateTokens(
  user: User,
): Promise<GeneratedTokens> {


  const accessExpires =
  this.configService.get<string>(
    'auth.accessTokenExpiresIn',
  )!;

  const refreshExpires =
  this.configService.get<string>(
    'auth.refreshTokenExpiresIn',
  )!;

  const accessPayload: JwtPayload = {
    sub: user.id,
    email: user.email.getValue(),
    role: user.role,
    type: 'access',
  };

  const refreshPayload: JwtPayload = {
    ...accessPayload,
    type: 'refresh',
  };

  const accessToken =
  await this.jwtService.signAsync(
    accessPayload,
    {
      secret: this.configService.get<string>(
        'auth.accessSecret',
      ),
      expiresIn: accessExpires as StringValue,
    },
  );

  const refreshToken =
  await this.jwtService.signAsync(
    refreshPayload,
    {
      secret: this.configService.get<string>(
        'auth.refreshSecret',
      ),
      expiresIn: refreshExpires as StringValue,
    },
  );

  const accessTokenExpiresIn =
  ms(accessExpires as ms.StringValue) / 1000;

  const refreshTokenExpiresIn =
    ms(refreshExpires as ms.StringValue) / 1000;

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
  };
}

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token)

    if (payload.type !== 'access') throw new UnauthorizedException('Invalid access token')

    return payload
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token,
      {
        secret: this.configService.get<string>('auth.refreshSecret'),
      }
    )

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token')

    return payload
  }

}
