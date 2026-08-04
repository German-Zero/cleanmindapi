import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';
import { SharedMailModule } from '../shared/mail/shared-mail.module';

import { NOTIFICATION_SENDERS } from './application/common/notification.constants';

import { EmailNotificationAdapter } from './infrastructure/email/email-notification.adapter';
import { WhatsappNotificationAdapter } from './infrastructure/whatsapp/whatsapp-notification.adapter';
import { DiscordNotificationAdapter } from './infrastructure/discord/discord-notification.adapter';

import { NotificationDispatcherService } from './application/services/notification-dispatcher.service';
import { TaskReminderScheduler } from './application/services/task-reminder.scheduler';

import { NotificationSenderPort } from './application/ports/outbound/notification-sender.port';

import { NotificationFactory } from './application/factories/notification.factory';
import { NotificationTemplateService } from './infrastructure/templates/notification-template.service';
import { DiscordConnectionController } from './api/controllers/discord-connection.controller';
import { DiscordConnectionService } from './application/services/discord-connection.service';
import { DiscordConnectionRepository } from './domain/repositories/discord-connection.repository';
import { DiscordApiService } from './infrastructure/discord/discord-api.service';
import { PrismaDiscordConnectionRepository } from './infrastructure/discord/prisma-discord-connection.repository';
import { DiscordServerWebhookService } from './infrastructure/discord/discord-server-webhook.service';

@Module({
  imports: [ConfigModule, SettingsModule, SharedMailModule],
  controllers: [DiscordConnectionController],
  providers: [
    // Factory

    NotificationFactory,
    NotificationTemplateService,
    NotificationDispatcherService,
    TaskReminderScheduler,
    DiscordConnectionService,
    DiscordApiService,
    DiscordServerWebhookService,
    PrismaDiscordConnectionRepository,
    {
      provide: DiscordConnectionRepository,
      useExisting: PrismaDiscordConnectionRepository,
    },
    EmailNotificationAdapter,
    DiscordNotificationAdapter,
    WhatsappNotificationAdapter,
    {
      provide: NOTIFICATION_SENDERS,
      useFactory: (
        email: EmailNotificationAdapter,
        discord: DiscordNotificationAdapter,
        whatsapp: WhatsappNotificationAdapter,
      ): NotificationSenderPort[] => [email, discord, whatsapp],
      inject: [
        EmailNotificationAdapter,
        DiscordNotificationAdapter,
        WhatsappNotificationAdapter,
      ],
    },
  ],
  exports: [
    NotificationFactory,
    NotificationDispatcherService,
    DiscordServerWebhookService,
  ],
})
export class NotificationModule {}
