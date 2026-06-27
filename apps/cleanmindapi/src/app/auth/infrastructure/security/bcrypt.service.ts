import { Injectable } from "@nestjs/common";
import { PasswordHasherPort } from "../../application/ports/password-hasher.port";
import * as bcrypt from "bcrypt";


@Injectable()
export class BcryptService implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
