import { UserSettingsRepository } from '../../../settings/domain/repositories/user-settings.repository';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { NotificationDispatcherService } from './notification-dispatcher.service';

describe('NotificationDispatcherService', () => {
  it('reports success when at least one enabled channel succeeds', async () => {
    const settings = {
      emailNotifications: true,
      whatsappNotifications: false,
      discordNotifications: true,
    };
    const email = {
      channel: NotificationChannel.EMAIL,
      send: jest.fn().mockResolvedValue(undefined),
    };
    const discord = {
      channel: NotificationChannel.DISCORD,
      send: jest.fn().mockRejectedValue(new Error('Discord unavailable')),
    };
    const service = new NotificationDispatcherService(
      {
        findByUserId: jest.fn().mockResolvedValue(settings),
      } as unknown as UserSettingsRepository,
      [email, discord] as never,
    );

    await expect(service.send('user-id', {} as never)).resolves.toBe(true);

    expect(email.send).toHaveBeenCalledTimes(1);
    expect(discord.send).toHaveBeenCalledTimes(1);
  });
});
