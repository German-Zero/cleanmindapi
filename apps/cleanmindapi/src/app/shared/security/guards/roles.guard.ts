import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { JwtPayload } from "../../../auth/application/common/jwt-payload";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (!roles) return true

    const request = context.switchToHttp().getRequest();

    const user = request.user as JwtPayload;

    return roles.includes(user.role)
  }
}
