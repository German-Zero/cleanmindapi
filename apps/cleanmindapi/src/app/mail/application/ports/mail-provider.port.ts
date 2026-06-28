import { SendMailOptions } from "../../domain/interfaces/send-mail.interface";

export interface MailProviderPort {
  send(options: SendMailOptions,): Promise<void>;
}
