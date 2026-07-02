import { UserRole } from "../../../users/domain/enums/user-role.enum";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;

  type: 'access' | 'refresh'
}
