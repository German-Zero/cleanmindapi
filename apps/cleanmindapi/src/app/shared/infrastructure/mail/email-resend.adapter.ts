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
    code: string,
  ): Promise<void> {
    await this.resend.emails.send({
        from: this.config.getOrThrow<string>('auth.mail.from'),
        to: email,
        subject: 'Verify your email',
        html: this.verificationTemplate(code),
    });
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
    code: string,
  ): string {
    return `
      <h2>Welcome to CleanMind</h2>

      <p>
        Thank you for creating your account.
      </p>

      <p>
        Your verification code is:
      </p>

      <h1
        style="
          letter-spacing:8px;
          font-size:36px;
        "
      >
        ${code}
      </h1>

      <p>
        This code expires in 24 hours.
      </p>
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
