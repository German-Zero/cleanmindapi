import { Injectable } from "@nestjs/common";
import { RegisterUserPort } from "../ports/inbound/register-user.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordHasherPort } from "../ports/outbound/password-hasher.port";
import { TokenHasherPort } from "../ports/outbound/token-hasher.port";
import { RefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { JwtPort } from "../ports/outbound/jwt.port";
import { TokenGeneratorPort } from "../ports/outbound/token-generator.port";
import { MailPort } from "../ports/outbound/mail.port";
import { VerificationTokenRepository } from "../../domain/repositories/verification-token.repository";
import { RegisterUserCommand } from "../commands/register-user.command";
import { AuthResponse } from "../../api/response/auth-response";
import { Email } from "../../../users/domain/value-objects/email.vo";
import { Password } from "../../../users/domain/value-objects/password.vo";
import { EmailAlreadyExistsException } from "../../../users/domain/exceptions/email-already-exists.exception";
import { User } from "../../../users/domain/entities/user.entity";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { VerificationToken } from "../../domain/entities/verification-token.entity";
import { AuthResponseMapper } from "../../api/mapper/auth-response.mapper";


@Injectable()
export class RegisterUserUseCase implements RegisterUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly refreshTokenHasher: TokenHasherPort,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwt: JwtPort,
    private readonly tokenGenerator: TokenGeneratorPort,
    private readonly mail: MailPort,
    private readonly tokenHasher: TokenHasherPort,
    private readonly verificationTokenRepository: VerificationTokenRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthResponse> {
    const email = new Email(command.email);
    const password = new Password(command.password);

    const exists = await this.userRepository.existsByEmail(email)

    if (exists) throw new EmailAlreadyExistsException();

    const passwordHash = await this.passwordHasher.hash(password)

    const user = User.createLocal({
      name: command.name,
      email,
      passwordHash
    })

    const createdUser = await this.userRepository.create(user);

    const tokens = await this.jwt.generateTokens(createdUser)

    const refreshTokenHash = await this.refreshTokenHasher.hash(
      tokens.refreshToken,
    );

    const refreshToken = RefreshToken.create({
      tokenHash: refreshTokenHash,
      userId: createdUser.id,
      expiresAt: new Date(
        Date.now() + tokens.refreshTokenExpiresIn * 1000,
      ),
    });

    await this.refreshTokenRepository.create(refreshToken);

    const verificationToken = this.tokenGenerator.generate()

    const verificationTokenHash = await this.tokenHasher.hash(verificationToken);

    const verification =
      VerificationToken.create({
        tokenHash: verificationTokenHash,
        userId: createdUser.id,
        expiresAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24,
        ),
      });

    await this.verificationTokenRepository.create(
      verification,
    );

    await this.mail.sendVerificationEmail(
      createdUser.email.getValue(),
      verificationToken,
    );

    return AuthResponseMapper.toResponse(
      createdUser,
      tokens,
    )
  }
}
