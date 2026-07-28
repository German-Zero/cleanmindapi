import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ChangePasswordPort } from "../ports/inbound/change-password.port";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordHasherPort } from "../ports/outbound/password-hasher.port";
import { ChangePasswordCommand } from "../commands/change-password.command";
import { UserNotFoundException } from "../../../users/domain/exceptions/user-not-found.exception";
import { Password } from "../../../users/domain/value-objects/password.vo";

@Injectable()
export class ChangePasswordUseCase implements ChangePasswordPort {
  constructor(
    private readonly repo: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    if (command.newPassword !== command.confirmPassword) throw new BadRequestException('Las contraseñas no coinciden.')

    const user = await this.repo.findById(command.userId)

    if (!user) throw new UserNotFoundException();

    if (!user.passwordHash) throw new BadRequestException('Esta cuenta todavía no tiene una contraseña local.')

    const valid = await this.passwordHasher.compare(
      new Password(command.currentPassword),
      user.passwordHash,
    )

    if (!valid) throw new UnauthorizedException('La contraseña actual es incorrecta.')

    const newHash = await this.passwordHasher.hash(new Password(command.newPassword));

    user.changePassword(newHash);

    await this.repo.update(user)
  }
}
