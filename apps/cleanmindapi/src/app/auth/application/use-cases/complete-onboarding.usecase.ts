import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { CompleteOnboardingPort } from '../ports/inbound/complete-onboarding.port';

@Injectable()
export class CompleteOnboardingUseCase implements CompleteOnboardingPort {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user) throw new UserNotFoundException();

    user.completeOnboarding();
    await this.users.update(user);
  }
}
