import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../../../auth/application/common/jwt-payload";

export const CurrentUser = createParamDecorator(
  (
    property: keyof JwtPayload | undefined,
    context: ExecutionContext,
  ) => {
    const request = context
      .switchToHttp()
      .getRequest();

    const user: JwtPayload = request.user;

    return property
      ? user[property]
      : user;
  },
);
