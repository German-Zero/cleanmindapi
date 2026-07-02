import { JwtPayload } from "../../common/jwt-payload";

export abstract class GetCurrentUserPort {
  abstract execute(payload: JwtPayload): Promise<JwtPayload>;
}
