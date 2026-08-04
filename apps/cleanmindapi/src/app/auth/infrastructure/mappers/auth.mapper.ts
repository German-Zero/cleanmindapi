import { AuthResponse as ApiAuthResponse } from "../../api/response/auth-response";
import { AuthResponse as ApplicationAuthResponse } from "../../api/response/auth-response";

export class AuthMapper {
  static toResponse(
    response: ApplicationAuthResponse,
  ): ApiAuthResponse {
    return {
      mfaRequired: false,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,

      user: {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        avatarUrl: response.user.avatarUrl,
        emailVerified: response.user.emailVerified,
        requiresTermsAcceptance: response.user.requiresTermsAcceptance,
        needsOnboarding: response.user.needsOnboarding,
      },
    };
  }
}
