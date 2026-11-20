import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { SetPasswordPort } from '../ports/inbound/set-password.port';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { PasswordHasherPort } from '../ports/outbound/password-hasher.port';
import { SetPasswordCommand } from '../commands/set-password.command';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { Password } from '../../../users/domain/value-objects/password.vo';
import { PasswordSessionPort } from '../ports/outbound/password-session.port';

@Injectable()
export class SetPasswordUseCase implements SetPasswordPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly passwordSessions: PasswordSessionPort,
  ) {}

  async execute(command: SetPasswordCommand): Promise<void> {
    if (command.password !== command.confirmPassword)
      throw new ApplicationError(
        'AUTH_INVALID_INPUT',
        'Las contraseñas no coinciden.',
      );

    const user = await this.userRepository.findById(command.userId);

    if (!user) throw new UserNotFoundException();

    if (user.passwordHash)
      throw new ApplicationError(
        'AUTH_INVALID_INPUT',
        'La cuenta ya tiene una contraseña local.',
      );

    const hash = await this.passwordHasher.hash(new Password(command.password));

    user.changePassword(hash);

    await this.passwordSessions.changePasswordAndRevokeSessions(
      user.id,
      hash,
      user.updatedAt,
    );
  }
}
