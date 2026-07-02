import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../../../auth/application/common/jwt-payload";
import type { StringValue } from "ms";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(
        'auth.accessSecret',
      ) as StringValue,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<JwtPayload> {
    return payload;
  }
}
