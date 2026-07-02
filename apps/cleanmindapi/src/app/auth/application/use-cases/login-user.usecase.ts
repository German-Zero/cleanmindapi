import { Injectable } from "@nestjs/common";
import { LoginUserPort } from "../ports/inbound/login-user.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordHasherPort } from "../ports/outbound/password-hasher.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { JwtPort } from "../ports/outbound/jwt.port";
import { LoginUserCommand } from "../commands/login-user.command";
import { AuthResponse } from "../../api/response/auth-response";
import { Email } from "../../../users/domain/value-objects/email.vo";
import { Password } from "../../../users/domain/value-objects/password.vo";
import { InvalidCredentialsException } from "../../../users/domain/exceptions/invalid-credentials.exception";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { AuthResponseMapper } from "../../api/mapper/auth-response.mapper";


@Injectable()
export class LoginUserUseCase implements LoginUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly refreshTokenHasher: TokenHasherPort,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtPort: JwtPort,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<AuthResponse> {
    const email = new Email(command.email);
    const password = new Password(command.password);

    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const validPassword = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.jwtPort.generateTokens(user);

    const refreshTokenHash =
      await this.refreshTokenHasher.hash(tokens.refreshToken);

    const refreshToken = RefreshToken.create({
      tokenHash: refreshTokenHash,
      userId: user.id!,
      expiresAt: new Date(
        Date.now() + tokens.refreshTokenExpiresIn * 1000,
      ),
    });

    await this.refreshTokenRepository.create(refreshToken);

    user.updateLastLogin();

    await this.userRepository.update(user);

    return AuthResponseMapper.toResponse(
      user,
      tokens,
    )
  }
}
