import { User } from "../../../../users/domain/entities/user.entity";
import { GeneratedTokens } from "../../common/generated-tokens";
import { JwtPayload } from "../../common/jwt-payload";
import { AuthenticationContext } from '../../common/authentication-context';


export abstract class JwtPort {
  abstract generateTokens(
    user: User,
    context?: AuthenticationContext,
  ): Promise<GeneratedTokens>;
  abstract verifyAccessToken(token: string): Promise<JwtPayload>;
  abstract verifyRefreshToken(token: string): Promise<JwtPayload>;
}
