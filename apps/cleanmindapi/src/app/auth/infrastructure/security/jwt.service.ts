import { Injectable } from "@nestjs/common";
import { JwtPayload, TokenGeneratorPort } from "../../application/ports/token-generator.port";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtTokenService implements TokenGeneratorPort {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload)
  }
}
