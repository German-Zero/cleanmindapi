import { UserRole } from "../../../users/domain/enums/user-role.enum";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
}
