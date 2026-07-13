import { Injectable } from "@nestjs/common";
import { LoginGooglePort } from "../ports/inbound/login-google.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { JwtPort } from "../ports/outbound/jwt.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { LoginGoogleCommand } from "../commands/login-google.command";
import { Email } from "../../../users/domain/value-objects/email.vo";
import { User } from "../../../users/domain/entities/user.entity";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { AuthResponse } from "../../api/response/auth-response";
import { UserSettingsRepository } from "../../../settings/domain/repositories/user-settings.repository";
import { UserSettings } from "../../../settings/domain/entities/user-settings.entity";

@Injectable()
export class LoginGoogleUseCase
  implements LoginGooglePort
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtPort: JwtPort,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenHasher: TokenHasherPort,
    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}

  async execute(
    command: LoginGoogleCommand,
  ): Promise<AuthResponse> {
    const email = new Email(command.email);

    let user =
      await this.userRepository.findByEmail(email);

    if (!user) {
      user = User.createGoogle({
        name: command.name,
        email,
        avatarUrl: command.avatarUrl,
      });

      user = await this.userRepository.create(user);
    }

    const settings = UserSettings.createDefault(user.id)

    await this.userSettingsRepository.create(settings)

    const tokens =
      await this.jwtPort.generateTokens(user);

    const refreshHash =
      await this.tokenHasher.hash(
        tokens.refreshToken,
      );

    const refreshToken =
      RefreshToken.create({
        tokenHash: refreshHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() +
            tokens.refreshTokenExpiresIn * 1000,
        ),
      });

    await this.refreshTokenRepository.create(
      refreshToken,
    );

    user.updateLastLogin();

    await this.userRepository.update(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.accessTokenExpiresIn,

      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    };
  }
}
