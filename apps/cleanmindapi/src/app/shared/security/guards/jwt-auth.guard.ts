import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { TERMS_OPTIONAL_KEY } from '../decorators/terms-optional.decorator';
import { TermsService } from '../../../legal/application/terms.service';
import { JwtPayload } from '../../../auth/application/common/jwt-payload';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly terms: TermsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass()
      ],
    );

    if (isPublic) return true;

    const authenticated = await super.canActivate(context);

    if (!authenticated) return false;

    const termsOptional = this.reflector.getAllAndOverride<boolean>(
      TERMS_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (termsOptional) return true;

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (await this.terms.requiresAcceptance(request.user.sub)) {
      throw new ForbiddenException(
        'Debes aceptar la versión vigente de los términos para continuar.',
      );
    }

    return true;
  }
}
