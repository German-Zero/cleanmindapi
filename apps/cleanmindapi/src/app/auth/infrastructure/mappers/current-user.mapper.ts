
import { CurrentUserResponse } from "../../api/response/current-user.response";
import { User } from "../../../users/domain/entities/user.entity";

export class CurrentUserMapper {
  static toResponse(user: User): CurrentUserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      role: user.role,
      avatarUrl: user.avatarUrl,
      hasPassword: Boolean(user.passwordHash),
      needsOnboarding: user.onboardingCompletedAt === null,
    }
  }
}
