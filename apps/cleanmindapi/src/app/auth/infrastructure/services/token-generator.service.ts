import { Injectable } from "@nestjs/common";
import { TokenGeneratorPort } from "../../application/ports/outbound/token-generator.port";
import { randomBytes, randomInt } from "crypto";

@Injectable()
export class TokenGeneratorService implements TokenGeneratorPort {
  generate(bytes = 6): string {
    if (bytes === 6) {
      return randomInt(100000, 1000000).toString();
    }

    return randomBytes(bytes).toString('base64url');
  }
}
