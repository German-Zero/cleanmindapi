export abstract class PasswordSessionPort {
  abstract changePasswordAndRevokeSessions(
    userId: string,
    passwordHash: string,
    updatedAt: Date,
  ): Promise<void>;
}
