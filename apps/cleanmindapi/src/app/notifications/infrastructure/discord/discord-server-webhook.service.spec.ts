import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { NotificationTemplateService } from '../templates/notification-template.service';
import { DiscordServerWebhookService } from './discord-server-webhook.service';

describe('DiscordServerWebhookService', () => {
  const webhookUrl = 'https://discord.com/api/webhooks/123/secret-token';

  afterEach(() => jest.restoreAllMocks());

  it('posts server messages without Discord mentions', async () => {
    const config = new ConfigService({
      notifications: {
        discord: { webhookUrl, username: 'CleanMind', timeoutMs: 5000 },
      },
    });
    const post = jest.spyOn(axios, 'post').mockResolvedValue({ status: 204 });
    const service = new DiscordServerWebhookService(
      config,
      {} as NotificationTemplateService,
    );

    await service.send('Estado del servidor');

    expect(post).toHaveBeenCalledWith(
      webhookUrl,
      expect.objectContaining({
        content: 'Estado del servidor',
        allowed_mentions: { parse: [] },
      }),
      expect.objectContaining({ timeout: 5000 }),
    );
  });

  it('rejects URLs that are not Discord webhooks', async () => {
    const config = new ConfigService({
      notifications: {
        discord: { webhookUrl: 'https://example.com/webhook' },
      },
    });
    const post = jest.spyOn(axios, 'post').mockResolvedValue({ status: 204 });
    const service = new DiscordServerWebhookService(
      config,
      {} as NotificationTemplateService,
    );

    await expect(service.send('Estado')).rejects.toThrow(
      'DISCORD_WEBHOOK_URL must be an HTTPS Discord webhook URL',
    );
    expect(post).not.toHaveBeenCalled();
  });
});
