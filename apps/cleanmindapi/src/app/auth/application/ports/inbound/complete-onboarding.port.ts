export abstract class CompleteOnboardingPort {
  abstract execute(userId: string): Promise<void>;
}
