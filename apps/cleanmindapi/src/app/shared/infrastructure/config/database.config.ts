import { registerAs } from '@nestjs/config';
import { requiredEnv } from './required-env';

export default registerAs('database', () => ({
  url: requiredEnv('DATABASE_URL'),
}));
