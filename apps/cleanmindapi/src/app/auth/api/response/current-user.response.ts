import { UserRole } from "../../../users/domain/enums/user-role.enum";


export class CurrentUserResponse {
  id!: string;
  name!: string;
  email!: string;
  role!: UserRole;
  avatarUrl!: string | null;
  hasPassword!: boolean;
  needsOnboarding!: boolean;
}
