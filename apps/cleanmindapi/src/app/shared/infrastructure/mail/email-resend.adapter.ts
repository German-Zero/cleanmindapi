import { Injectable } from '@nestjs/common';
import { MailPort } from '../../../auth/application/ports/outbound/mail.port';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { HandlebarsService } from '../../mail/helpers/handlebars.service';
import { MailTemplate } from '../../mail/enums/mail-template.enum';
import {
  EMAIL_VERIFICATION_EXPIRATION_MINUTES,
  PASSWORD_RESET_EXPIRATION_MINUTES,
} from '../../application/auth-token-expiration.constants';

@Injectable()
export class ResendMailAdapter implements MailPort {
  private readonly resend: Resend;

  constructor(
    private readonly config: ConfigService,
    private readonly handlebars: HandlebarsService,
  ) {
    this.resend = new Resend(
      this.config.getOrThrow<string>('auth.mail.apiKey'),
    );
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    await this.resend.emails.send({
      from: this.config.getOrThrow<string>('auth.mail.from'),
      to: email,
      subject: 'Confirma tu correo en CleanMind',
      html: this.handlebars.renderEmail(MailTemplate.VERIFY_EMAIL, {
        verificationCode: code,
        expirationMinutes: EMAIL_VERIFICATION_EXPIRATION_MINUTES,
      }),
    });
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const frontend = this.config.get<string>('auth.frontend.url');

    const url = `${frontend}/recover-password?token=${token}`;

    await this.resend.emails.send({
      from: this.config.get<string>('auth.mail.from')!,
      to: email,
      subject: 'Crea una nueva contraseña',
      html: this.handlebars.renderEmail(MailTemplate.PASSWORD_RESET, {
        resetUrl: url,
        expirationMinutes: PASSWORD_RESET_EXPIRATION_MINUTES,
      }),
    });
  }
}
