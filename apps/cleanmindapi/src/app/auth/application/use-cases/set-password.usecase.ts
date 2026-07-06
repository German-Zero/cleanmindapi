import { BadRequestException, Injectable } from "@nestjs/common";
import { SetPasswordPort } from "../ports/inbound/set-password.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordHasherPort } from "../ports/outbound/password-hasher.port";
import { SetPasswordCommand } from "../commands/set-password.command";
import { UserNotFoundException } from "../../../users/domain/exceptions/user-not-found.exception";
import { Password } from "../../../users/domain/value-objects/password.vo";

@Injectable()
export class SetPasswordUseCase implements SetPasswordPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: SetPasswordCommand): Promise<void> {
    if (command.password !== command.confirmPassword) throw new BadRequestException('Passowrd do not match')

    const user = await this.userRepository.findById(command.userId)

    if (!user) throw new UserNotFoundException()

    if (user.passwordHash) throw new BadRequestException('Password already exists.')

    const hash = await this.passwordHasher.hash(new Password(command.password))

    user.changePassword(hash)

    await this.userRepository.update(user)
  }
}
