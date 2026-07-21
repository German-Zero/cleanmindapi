import { DiscordConnectionRepository } from '../../domain/repositories/discord-connection.repository';
import { DiscordApiService } from '../../infrastructure/discord/discord-api.service';
import { DiscordConnectionService } from './discord-connection.service';

describe('DiscordConnectionService', () => {
  it('creates a stored one-use state and an OAuth authorization URL', async () => {
    const connections = {
      createOAuthState: jest.fn().mockResolvedValue(undefined),
    } as unknown as DiscordConnectionRepository;
    const discord = {
      createAuthorizationUrl: jest.fn().mockImplementation(
        (state: string) => `https://discord.com/oauth2/authorize?state=${state}`,
      ),
    } as unknown as DiscordApiService;
    const service = new DiscordConnectionService(connections, discord);

    const url = await service.createAuthorizationUrl('cleanmind-user');

    expect(url).toContain('https://discord.com/oauth2/authorize?state=');
    expect(connections.createOAuthState).toHaveBeenCalledWith(
      'cleanmind-user',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
    );
  });

  it('rejects an expired or already consumed OAuth state', async () => {
    const connections = {
      consumeOAuthState: jest.fn().mockResolvedValue(null),
    } as unknown as DiscordConnectionRepository;
    const discord = {
      getProfileFromCode: jest.fn(),
    } as unknown as DiscordApiService;
    const service = new DiscordConnectionService(connections, discord);

    await expect(service.completeConnection('code', 'state')).rejects.toThrow(
      'Discord OAuth state is invalid or expired',
    );
    expect(discord.getProfileFromCode).not.toHaveBeenCalled();
  });

  it('does not allow one Discord account to be linked to two users', async () => {
    const connections = {
      consumeOAuthState: jest.fn().mockResolvedValue('cleanmind-user'),
      findByDiscordUserId: jest.fn().mockResolvedValue({
        userId: 'another-cleanmind-user',
      }),
      upsert: jest.fn(),
    } as unknown as DiscordConnectionRepository;
    const discord = {
      getProfileFromCode: jest.fn().mockResolvedValue({
        id: 'discord-user',
        username: 'mindful-user',
        globalName: null,
        avatarHash: null,
      }),
    } as unknown as DiscordApiService;
    const service = new DiscordConnectionService(connections, discord);

    await expect(service.completeConnection('code', 'state')).rejects.toThrow(
      'This Discord account is already connected to another CleanMind user',
    );
    expect(connections.upsert).not.toHaveBeenCalled();
  });
});
