import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { DiscordApiService } from './discord-api.service';

describe('DiscordApiService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('opens a DM channel and sends the message as the bot', async () => {
    const config = new ConfigService({
      notifications: {
        discord: { botToken: 'bot-secret', timeoutMs: 5000 },
      },
    });
    const post = jest
      .spyOn(axios, 'post')
      .mockResolvedValueOnce({ data: { id: 'dm-channel' } })
      .mockResolvedValueOnce({ data: { id: 'message' } });
    const service = new DiscordApiService(config);

    await service.sendDirectMessage('discord-user', 'Mensaje personal');

    expect(post).toHaveBeenNthCalledWith(
      1,
      'https://discord.com/api/v10/users/@me/channels',
      { recipient_id: 'discord-user' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bot bot-secret' }),
      }),
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      'https://discord.com/api/v10/channels/dm-channel/messages',
      {
        content: 'Mensaje personal',
        allowed_mentions: { parse: [] },
      },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bot bot-secret' }),
      }),
    );
  });
});
