import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from '../settings/settings.module';
import { SharedMailModule } from '../shared/mail/shared-mail.module';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';

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
import { TaskReminderRepository } from './domain/repositories/task-reminder.repository';
import { DiscordApiService } from './infrastructure/discord/discord-api.service';
import { DiscordApiPort } from './application/ports/outbound/discord-api.port';
import { PrismaDiscordConnectionRepository } from './infrastructure/discord/prisma-discord-connection.repository';
import { DiscordServerWebhookService } from './infrastructure/discord/discord-server-webhook.service';
import { PrismaTaskReminderRepository } from './infrastructure/repositories/prisma-task-reminder.repository';
import { DiscordConnectionPort } from './application/ports/inbound/discord-connection.port';

@Module({
  imports: [ConfigModule, SettingsModule, SharedMailModule, PrismaModule],
  controllers: [DiscordConnectionController],
  providers: [
    // Factory

    NotificationFactory,
    NotificationTemplateService,
    NotificationDispatcherService,
    TaskReminderScheduler,
    DiscordConnectionService,
    {
      provide: DiscordConnectionPort,
      useExisting: DiscordConnectionService,
    },
    DiscordApiService,
    {
      provide: DiscordApiPort,
      useExisting: DiscordApiService,
    },
    DiscordServerWebhookService,
    PrismaDiscordConnectionRepository,
    PrismaTaskReminderRepository,
    {
      provide: TaskReminderRepository,
      useExisting: PrismaTaskReminderRepository,
    },
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
