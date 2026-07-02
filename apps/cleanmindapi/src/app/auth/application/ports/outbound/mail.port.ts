export abstract class MailPort {
  abstract sendVerificationEmail(email: string, verificationUrl: string): Promise<void>
  abstract sendResetPasswordEmail(email: string, token: string): Promise<void>
}
