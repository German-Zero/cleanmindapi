import { Inject, Injectable } from "@nestjs/common";
import { MailProviderPort } from "../ports/mail-provider.port";
import { SendMailOptions } from "../../domain/interfaces/send-mail.interface";
import { MAIL_PROVIDER } from "../../mail.tokens";


@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_PROVIDER)
    private readonly provider: MailProviderPort,
  ) {}

  async send(options: SendMailOptions,) {
    await this.provider.send(options)
  }
}
