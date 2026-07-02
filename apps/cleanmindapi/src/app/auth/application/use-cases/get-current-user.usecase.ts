import { Injectable } from "@nestjs/common";
import { GetCurrentUserPort } from "../ports/inbound/get-current-user.port";
import { JwtPayload } from "../common/jwt-payload";

@Injectable()
export class GetCurrentUserUseCase implements GetCurrentUserPort {
  async execute(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
