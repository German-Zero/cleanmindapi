import { ResendVerificationEmailCommand } from "../../commands/resend-verification-email.command";

export abstract class ResendVerificationEmailPort {
  abstract execute(
    command: ResendVerificationEmailCommand,
  ): Promise<void>;
}
