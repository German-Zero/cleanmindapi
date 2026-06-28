import { ConflictException, Injectable } from "@nestjs/common";
import { PasswordHasherPort } from "../ports/password-hasher.port";
import { UserRepositoryPort } from "../ports/user-repository.port";
import { RegisterDto } from "../../dto/register.dto";
import { User } from "../../domain/entities/user.entities";
import { randomUUID } from "crypto";

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(dto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) throw new ConflictException('Email already in use');

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = new User(
      randomUUID(),
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      false,
      new Date(),
      new Date()
    )

    return this.userRepository.create(user);
  }

}
