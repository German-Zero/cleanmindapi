import { randomUUID } from "crypto";
import { AuthProvider } from "../enums/auth-provider.enum";
import { UserRole } from "../enums/user-role.enum";
import { Email } from "../value-objects/email.vo";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: Email,
    public passwordHash: string | null,
    public provider: AuthProvider,
    public role: UserRole,
    public emailVerified: boolean,
    public avatarUrl: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public lastLoginAt: Date | null,
    public onboardingCompletedAt: Date | null = null,
  ) {}

  private touch(): void {
    this.updatedAt = new Date();
  }

  static createLocal(params: {
    name: string;
    email: Email;
    passwordHash: string;
  }): User {
    const now = new Date();

    return new User(
      randomUUID(),
      params.name,
      params.email,
      params.passwordHash,
      AuthProvider.LOCAL,
      UserRole.USER,
      false,
      null,
      now,
      now,
      null,
      null,
    )
  }

  static createGoogle(params: {
    name: string;
    email: Email;
    avatarUrl?: string | null;
  }): User {
    const now = new Date();

    return new User(
      randomUUID(),
      params.name,
      params.email,
      null,
      AuthProvider.GOOGLE,
      UserRole.USER,
      true,
      params.avatarUrl ?? null,
      now,
      now,
      null,
      null,
    )
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  completeOnboarding(): void {
    if (this.onboardingCompletedAt) return;

    this.onboardingCompletedAt = new Date();
    this.touch();
  }

  rename(name: string): void {
      this.name = name;
      this.touch();
  }

  changeAvatar(url: string | null): void {
      this.avatarUrl = url;
      this.touch();
  }

  verifyEmail(): void {
      this.emailVerified = true;
      this.touch();
  }

  changePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.touch();
  }

  changeRole(role: UserRole): void {
    this.role = role;
    this.touch();
  }
}
