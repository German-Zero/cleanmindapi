import { Injectable } from "@nestjs/common";
import { TokenGeneratorPort } from "../../application/ports/outbound/token-generator.port";
import { randomBytes } from "crypto";

@Injectable()
export class TokenGeneratorService implements TokenGeneratorPort {
  generate(length = 32): string {
    return randomBytes(length).toString('hex')
  }
}
