import { Injectable } from "@nestjs/common";
import { TokenGeneratorPort } from "../../application/ports/outbound/token-generator.port";
import { randomInt } from "crypto";

@Injectable()
export class TokenGeneratorService implements TokenGeneratorPort {
  generate(): string {
    return randomInt(100000, 1000000).toString()
  }
}
