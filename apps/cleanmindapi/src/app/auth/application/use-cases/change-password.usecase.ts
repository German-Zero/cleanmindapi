import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { ChangePasswordPort } from '../ports/inbound/change-password.port';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { PasswordHasherPort } from '../ports/outbound/password-hasher.port';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { Password } from '../../../users/domain/value-objects/password.vo';
import { PasswordSessionPort } from '../ports/outbound/password-session.port';

@Injectable()
export class ChangePasswordUseCase implements ChangePasswordPort {
  constructor(
    private readonly repo: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly passwordSessions: PasswordSessionPort,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    if (command.newPassword !== command.confirmPassword)
      throw new ApplicationError(
        'AUTH_INVALID_INPUT',
        'Las contraseñas no coinciden.',
      );

    const user = await this.repo.findById(command.userId);

    if (!user) throw new UserNotFoundException();

    if (!user.passwordHash)
      throw new ApplicationError(
        'AUTH_INVALID_INPUT',
        'Esta cuenta todavía no tiene una contraseña local.',
      );

    const valid = await this.passwordHasher.compare(
      new Password(command.currentPassword),
      user.passwordHash,
    );

    if (!valid)
      throw new ApplicationError(
        'AUTH_UNAUTHORIZED',
        'La contraseña actual es incorrecta.',
      );

    const newHash = await this.passwordHasher.hash(
      new Password(command.newPassword),
    );

    user.changePassword(newHash);

    await this.passwordSessions.changePasswordAndRevokeSessions(
      user.id,
      newHash,
      user.updatedAt,
    );
  }
}
