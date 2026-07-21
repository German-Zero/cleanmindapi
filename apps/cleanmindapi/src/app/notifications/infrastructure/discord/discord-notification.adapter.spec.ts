import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';
import { NotificationTemplateService } from '../templates/notification-template.service';
import { DiscordApiService } from './discord-api.service';
import { DiscordNotificationAdapter } from './discord-notification.adapter';

describe('DiscordNotificationAdapter', () => {
  const notification = Notification.create({
    recipient: 'user@example.com',
    type: NotificationType.MOTIVATIONAL,
    payload: { quote: 'Un paso pequeno sigue siendo progreso.' },
  });

  it('sends the rendered notification to the connected Discord user', async () => {
    const connections = {
      findByUserId: jest.fn().mockResolvedValue({
        userId: 'cleanmind-user',
        discordUserId: 'discord-user',
      }),
    } as unknown as DiscordConnectionRepository;
    const discord = {
      sendDirectMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as DiscordApiService;
    const templates = {
      renderDiscord: jest.fn().mockReturnValue('Mensaje renderizado'),
    } as unknown as NotificationTemplateService;
    const adapter = new DiscordNotificationAdapter(
      connections,
      discord,
      templates,
    );

    await adapter.send('cleanmind-user', notification);

    expect(discord.sendDirectMessage).toHaveBeenCalledWith(
      'discord-user',
      'Mensaje renderizado',
    );
  });

  it('does not send when the CleanMind user has no Discord connection', async () => {
    const connections = {
      findByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as DiscordConnectionRepository;
    const discord = {
      sendDirectMessage: jest.fn(),
    } as unknown as DiscordApiService;
    const templates = {
      renderDiscord: jest.fn().mockReturnValue('Mensaje renderizado'),
    } as unknown as NotificationTemplateService;
    const adapter = new DiscordNotificationAdapter(
      connections,
      discord,
      templates,
    );

    await expect(adapter.send('cleanmind-user', notification)).rejects.toThrow(
      'Discord account is not connected',
    );
    expect(discord.sendDirectMessage).not.toHaveBeenCalled();
  });
});
