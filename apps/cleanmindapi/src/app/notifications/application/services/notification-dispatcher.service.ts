import { Inject, Injectable, Logger } from "@nestjs/common";
import { UserSettingsRepository } from "../../../settings/domain/repositories/user-settings.repository";
import { NOTIFICATION_SENDERS } from "../common/notification.constants";
import { NotificationSenderPort } from "../ports/outbound/notification-sender.port";
import { Notification } from "../../domain/entities/notification.entity";
import { NotificationChannel } from "../../domain/enums/notification-channel.enum";

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name)

  constructor(
    private readonly settingsRepository: UserSettingsRepository,

    @Inject(NOTIFICATION_SENDERS)
    private readonly senders: NotificationSenderPort[],
  ) {}

  async send(userId: string, notification: Notification): Promise<void> {
    const settings = await this.settingsRepository.findByUserId(userId);

    if (!settings) return

    const enabledChannels: NotificationChannel[] = [];

    if (settings.emailNotifications) enabledChannels.push(NotificationChannel.EMAIL)

    if (settings.whatsappNotifications) enabledChannels.push(NotificationChannel.WHATSAPP)

    if (settings.discordNotifications) enabledChannels.push(NotificationChannel.DISCORD)

    await Promise.all(this.senders.filter(sender =>
      enabledChannels.includes(sender.channel))
      .map(async sender => {
        try {
          await sender.send(userId, notification)
        } catch (error) {
          this.logger.error(`failed sending notification through ${sender.channel}`,
            error instanceof Error
              ? error.stack
              : undefined
          )
        }
      })
    )
  }
}
