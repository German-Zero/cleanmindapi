export class VerifyEmailCommand {
  constructor(
    public readonly code: string
  ) {}
}
