import { VerifyEmailCommand } from "../../commands/verify-email.command";

export abstract class VerifyEmailPort {
  abstract execute(command: VerifyEmailCommand): Promise<void>;
}
