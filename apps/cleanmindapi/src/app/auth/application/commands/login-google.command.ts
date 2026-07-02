export class LoginGoogleCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly avatarUrl: string | null,
  ) {}
}
