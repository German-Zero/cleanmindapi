import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES ?? '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES ?? '7d',

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
  },

  mail: {
    apiKey: process.env.BREVO_API_KEY!,
    apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3',
    timeoutMs: Number(process.env.BREVO_TIMEOUT_MS ?? 10_000),
    from: process.env.MAIL_FROM!,
    fromName: process.env.MAIL_FROM_NAME ?? process.env.APP_NAME ?? 'CleanMind',
    appName: process.env.APP_NAME,
    supportEmail: process.env.SUPPORT_EMAIL,
    logoUrl: process.env.LOGO_URL,
  },

  mfa: {
    issuer: process.env.MFA_ISSUER ?? 'CleanMind',
    encryptionKey: process.env.MFA_ENCRYPTION_KEY,
    challengeExpiresInSeconds: Number(
      process.env.MFA_CHALLENGE_EXPIRES_IN_SECONDS ?? 300,
    ),
    maxAttempts: Number(process.env.MFA_MAX_ATTEMPTS ?? 5),
    setupMaxAuthAgeSeconds: Number(
      process.env.MFA_SETUP_MAX_AUTH_AGE_SECONDS ?? 600,
    ),
  },

  frontend: {
    url: process.env.FRONTEND_URL!,
  },
}));
