import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user) throw new UserNotFoundException();

    user.completeOnboarding();
    await this.users.update(user);
  }
}
