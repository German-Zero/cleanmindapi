import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentRefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies.refreshToken;
  },
);
