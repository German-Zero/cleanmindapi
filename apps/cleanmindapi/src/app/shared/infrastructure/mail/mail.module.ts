import { Module } from "@nestjs/common";
import { ResendMailAdapter } from "./email-resend.adapter";

@Module({
  providers: [ResendMailAdapter],
  exports: [ResendMailAdapter],
})
export class MailModule {}
