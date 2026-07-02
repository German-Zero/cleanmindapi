import { Password } from "../../../../users/domain/value-objects/password.vo";

export abstract class PasswordHasherPort {
  abstract hash(password: Password): Promise<string>;
  abstract compare(password: Password, hash: string, ): Promise<boolean>
}
