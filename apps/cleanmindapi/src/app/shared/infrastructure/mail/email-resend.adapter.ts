import { Injectable } from "@nestjs/common";
import { MailPort } from "../../../auth/application/ports/outbound/mail.port";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ResendMailAdapter implements MailPort {
  private readonly resend: Resend;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(
      this.config.getOrThrow<string>('auth.mail.apiKey'),
    );
  }

  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const frontend =
      this.config.getOrThrow<string>('auth.frontend.url');

    const url = `${frontend}/auth/verify?token=${token}`;
    try {

      const result = await this.resend.emails.send({
        from: this.config.getOrThrow<string>('auth.mail.from'),
        to: email,
        subject: 'Verify your email',
        html: this.verificationTemplate(url),
      });
      console.log('Verification email sent:', result);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  async sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const frontend =
      this.config.get<string>('auth.frontend.url');

    const url =
      `${frontend}/auth/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: this.config.get<string>('auth.mail.from')!,
      to: email,
      subject: 'Reset your password',
      html: this.resetPasswordTemplate(url),
    });
  }

  private verificationTemplate(
    url: string,
  ): string {
    return `
      <h2>Welcome to CleanMind</h2>

      <p>
        Thank you for creating an account.
      </p>

      <p>
        Click the button below to verify your email.
      </p>

      <a href="${url}">
        Verify Email
      </a>
    `;
  }

  private resetPasswordTemplate(
    url: string,
  ): string {
    return `
      <h2>Password Recovery</h2>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        Click the button below.
      </p>

      <a href="${url}">
        Reset Password
      </a>
    `;
  }
}
