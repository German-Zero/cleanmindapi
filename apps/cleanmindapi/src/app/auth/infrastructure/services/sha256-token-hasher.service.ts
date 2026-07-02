import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { TokenHasherPort } from "../../application/ports/outbound/token-hasher.port";

@Injectable()
export class Sha256TokenHasherService implements TokenHasherPort
{
  async hash(token: string): Promise<string> {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  async compare(
    token: string,
    hash: string,
  ): Promise<boolean> {
    const hashed = await this.hash(token);

    return hashed === hash;
  }
}
