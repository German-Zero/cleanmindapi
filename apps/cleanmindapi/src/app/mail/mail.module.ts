import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "./application/services/mail.service";
import { ResendProvider } from "./infrastructure/providers/resend.provider";
import { MAIL_PROVIDER } from "./mail.tokens";


@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    MailService,
    ResendProvider,
    {
      provide: MAIL_PROVIDER,
      useClass: ResendProvider,
    },
  ],
  exports: [
    MailService,
  ],
})
export class MailModule {}
