import { registerAs } from "@nestjs/config";

export default registerAs('mail', () => ({
  provider: process.env.MAIL_PROVIDER,
  from: process.env.MAIL_FROM,
  apiKey: process.env.RESEND_API_KEY,
}))
