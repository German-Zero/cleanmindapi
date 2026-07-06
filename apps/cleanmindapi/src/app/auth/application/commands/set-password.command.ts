export class SetPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly password: string,
    public readonly confirmPassword: string,
  ) {}
}
