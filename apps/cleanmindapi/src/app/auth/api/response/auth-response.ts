import { AuthUser } from "../../application/common/auth-user";


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  user: AuthUser;
}


