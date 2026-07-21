import { registerAs } from '@nestjs/config';

export default registerAs('notifications', () => ({
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    botToken: process.env.DISCORD_BOT_TOKEN,
    redirectUri: process.env.DISCORD_REDIRECT_URI,
    successUrl: process.env.DISCORD_OAUTH_SUCCESS_URL,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    username: process.env.DISCORD_WEBHOOK_USERNAME ?? 'CleanMind',
    avatarUrl: process.env.DISCORD_WEBHOOK_AVATAR_URL,
    timeoutMs: Number(process.env.DISCORD_WEBHOOK_TIMEOUT_MS ?? 5000),
  },
}));
