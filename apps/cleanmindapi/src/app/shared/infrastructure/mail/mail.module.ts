import { Module } from "@nestjs/common";
import { SharedMailModule } from '../../mail/shared-mail.module';
import { ResendMailAdapter } from "./email-resend.adapter";

@Module({
  imports: [SharedMailModule],
  providers: [ResendMailAdapter],
  exports: [ResendMailAdapter],
})
export class MailModule {}
