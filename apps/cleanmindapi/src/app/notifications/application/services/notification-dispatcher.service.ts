import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserSettingsRepository } from '../../../settings/domain/repositories/user-settings.repository';
import { NOTIFICATION_SENDERS } from '../common/notification.constants';
import { NotificationSenderPort } from '../ports/outbound/notification-sender.port';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly settingsRepository: UserSettingsRepository,

    @Inject(NOTIFICATION_SENDERS)
    private readonly senders: NotificationSenderPort[],
  ) {}

  async send(userId: string, notification: Notification): Promise<boolean> {
    const settings = await this.settingsRepository.findByUserId(userId);

    if (!settings) return false;

    const enabledChannels: NotificationChannel[] = [
      settings.emailNotifications ? NotificationChannel.EMAIL : null,
      settings.whatsappNotifications ? NotificationChannel.WHATSAPP : null,
      settings.discordNotifications ? NotificationChannel.DISCORD : null,
    ].filter((item): item is NotificationChannel => item !== null);
    const results = await Promise.all(
      enabledChannels.map(async (currentChannel) => {
        const enabled = {
          [NotificationChannel.EMAIL]: settings.emailNotifications,
          [NotificationChannel.WHATSAPP]: settings.whatsappNotifications,
          [NotificationChannel.DISCORD]: settings.discordNotifications,
        }[currentChannel];
        const sender = this.senders.find(
          (item) => item.channel === currentChannel,
        );

        if (!enabled || !sender) return false;

        try {
          await sender.send(userId, notification);
          return true;
        } catch (error) {
          this.logger.error(
            `failed sending notification through ${sender.channel}`,
            error instanceof Error ? error.stack : undefined,
          );
          return false;
        }
      }),
    );

    return results.some(Boolean);
  }
}
