import { UserRole } from "../../../users/domain/enums/user-role.enum";
import { AuthenticationMethod } from './authentication-context';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  authTime: number;
  amr: AuthenticationMethod[];
  iat?: number;

  type: 'access' | 'refresh'
}
