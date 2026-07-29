import { Injectable } from '@nestjs/common';

import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { DeleteAccountPort } from '../ports/inbound/delete-account.port';

@Injectable()
export class DeleteAccountUseCase implements DeleteAccountPort {
  constructor(
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    if (!(await this.users.existsById(userId))) {
      throw new UserNotFoundException();
    }

    await this.users.delete(userId);
  }
}
