import { Module } from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { SettingsModule } from "../settings/settings.module";

import { NOTIFICATION_SENDERS } from "./application/common/notification.constants";

import { EmailNotificationAdapter } from "./infrastructure/email/email-notification.adapter";
import { WhatsappNotificationAdapter } from "./infrastructure/whatsapp/whatsapp-notification.adapter";
import { DiscordNotificationAdapter } from "./infrastructure/discord/discord-notification.adapter";

import { NotificationDispatcherService } from "./application/services/notification-dispatcher.service";

import { NotificationSenderPort } from "./application/ports/outbound/notification-sender.port";

import { NotificationFactory } from "./application/factories/notification.factory";

@Module({
  imports: [
    ConfigModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [
    // Factory

    NotificationFactory,


    {
      provide: NOTIFICATION_SENDERS,
      useFactory: (
        email: EmailNotificationAdapter,
        discord: DiscordNotificationAdapter,
        whatsapp: WhatsappNotificationAdapter,
      ): NotificationSenderPort[] => [
        email,
        discord,
        whatsapp,
      ],
      inject: [
        EmailNotificationAdapter,
        DiscordNotificationAdapter,
        WhatsappNotificationAdapter,
      ]
    }
  ],
  exports: [
    NotificationDispatcherService,
  ]
})
export class NotificationModule {}
