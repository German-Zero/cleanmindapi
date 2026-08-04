import { User } from "../../../users/domain/entities/user.entity";
import { GeneratedTokens } from "../../application/common/generated-tokens";
import { AuthResponse } from "../response/auth-response";


export class AuthResponseMapper {
  static toResponse(
    user: User,
    tokens: GeneratedTokens,
    requiresTermsAcceptance = false,
  ): AuthResponse {
    return {
      mfaRequired: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.accessTokenExpiresIn,

      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        requiresTermsAcceptance,
        needsOnboarding: user.onboardingCompletedAt === null,
      },
    };
  }
}
