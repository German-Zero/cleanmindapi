import { Injectable } from "@nestjs/common";
import { MailProviderPort } from "../../application/ports/mail-provider.port";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";
import { SendMailOptions } from "../../domain/interfaces/send-mail.interface";

@Injectable()
export class ResendProvider implements MailProviderPort {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'),
  )
    this.from = this.config.getOrThrow<string>('MAIL_FROM')
}

  async send(options: SendMailOptions): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
