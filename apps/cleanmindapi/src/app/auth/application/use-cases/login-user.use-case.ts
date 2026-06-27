import { Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenGeneratorPort } from "../ports/token-generator.port";
import { PasswordHasherPort } from "../ports/password-hasher.port";
import { UserRepositoryPort } from "../ports/user-repository.port";
import { LoginDto } from "../../dto/login.dto";

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenGenerator: TokenGeneratorPort
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.passwordHasher.compare(dto.password, user.passwordHash);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.tokenGenerator.generateAccessToken({
      sub: user.id,
      email: user.email
    });

    return accessToken;
  }
}
