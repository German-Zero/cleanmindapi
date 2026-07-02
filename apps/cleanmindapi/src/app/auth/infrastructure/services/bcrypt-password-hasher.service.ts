import { Injectable } from "@nestjs/common";
import { PasswordHasherPort } from "../../application/ports/outbound/password-hasher.port";
import { Password } from "../../../users/domain/value-objects/password.vo";

import * as bcrypt from 'bcrypt'

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasherPort {
  private readonly SALT_ROUNDS = 12;

  async hash(password: Password): Promise<string> {
    return bcrypt.hash(password.getValue(), this.SALT_ROUNDS);
  }

  async compare(password: Password, hash: string): Promise<boolean> {
    return bcrypt.compare(password.getValue(), hash)
  }
}
