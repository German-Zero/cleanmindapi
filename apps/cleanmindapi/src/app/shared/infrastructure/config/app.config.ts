import { registerAs } from "@nestjs/config";

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
}));
