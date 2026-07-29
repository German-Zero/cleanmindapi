import { Module } from '@nestjs/common';
import { SharedMailModule } from '../../mail/shared-mail.module';
import { BrevoMailAdapter } from './email-brevo.adapter';

@Module({
  imports: [SharedMailModule],
  providers: [BrevoMailAdapter],
  exports: [BrevoMailAdapter],
})
export class MailModule {}
