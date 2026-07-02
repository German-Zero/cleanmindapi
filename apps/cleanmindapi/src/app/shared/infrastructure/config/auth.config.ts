import { registerAs } from "@nestjs/config";

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
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.MAIL_FROM!,
  },

  frontend: {
    url: process.env.FRONTEND_URL!,
  },
}));
