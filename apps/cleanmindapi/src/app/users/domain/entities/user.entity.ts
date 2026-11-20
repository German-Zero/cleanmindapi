import { AuthProvider } from '../enums/auth-provider.enum';
import { UserRole } from '../enums/user-role.enum';
import { Email } from '../value-objects/email.vo';

export class User {
  private _name: string;
  private _email: Email;
  private _passwordHash: string | null;
  private _provider: AuthProvider;
  private _role: UserRole;
  private _emailVerified: boolean;
  private _avatarUrl: string | null;
  private _updatedAt: Date;
  private _lastLoginAt: Date | null;
  private _onboardingCompletedAt: Date | null;

  constructor(
    public readonly id: string,
    name: string,
    email: Email,
    passwordHash: string | null,
    provider: AuthProvider,
    role: UserRole,
    emailVerified: boolean,
    avatarUrl: string | null,
    public readonly createdAt: Date,
    updatedAt: Date,
    lastLoginAt: Date | null,
    onboardingCompletedAt: Date | null = null,
  ) {
    this._name = name;
    this._email = email;
    this._passwordHash = passwordHash;
    this._provider = provider;
    this._role = role;
    this._emailVerified = emailVerified;
    this._avatarUrl = avatarUrl;
    this._updatedAt = updatedAt;
    this._lastLoginAt = lastLoginAt;
    this._onboardingCompletedAt = onboardingCompletedAt;
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get passwordHash(): string | null {
    return this._passwordHash;
  }

  get provider(): AuthProvider {
    return this._provider;
  }

  get role(): UserRole {
    return this._role;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get onboardingCompletedAt(): Date | null {
    return this._onboardingCompletedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  static createLocal(params: {
    id: string;
    name: string;
    email: Email;
    passwordHash: string;
  }): User {
    const now = new Date();

    return new User(
      params.id,
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
    );
  }

  static createGoogle(params: {
    id: string;
    name: string;
    email: Email;
    avatarUrl?: string | null;
  }): User {
    const now = new Date();

    return new User(
      params.id,
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
    );
  }

  updateLastLogin(): void {
    this._lastLoginAt = new Date();
  }

  completeOnboarding(): void {
    if (this._onboardingCompletedAt) return;

    this._onboardingCompletedAt = new Date();
    this.touch();
  }

  rename(name: string): void {
    this._name = name;
    this.touch();
  }

  changeAvatar(url: string | null): void {
    this._avatarUrl = url;
    this.touch();
  }

  verifyEmail(): void {
    this._emailVerified = true;
    this.touch();
  }

  changePassword(passwordHash: string | null): void {
    this._passwordHash = passwordHash;
    this.touch();
  }

  changeRole(role: UserRole): void {
    this._role = role;
    this.touch();
  }
}
