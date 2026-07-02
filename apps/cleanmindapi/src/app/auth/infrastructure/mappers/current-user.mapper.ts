
import { CurrentUserResponse } from "../../api/response/current-user.response";
import { JwtPayload } from "../../application/common/jwt-payload";

export class CurrentUserMapper {
  static toResponse(payload: JwtPayload): CurrentUserResponse {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
