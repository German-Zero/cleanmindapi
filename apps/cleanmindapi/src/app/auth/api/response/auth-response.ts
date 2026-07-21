import { AuthUser } from "../../application/common/auth-user";


export interface AuthResponse {
  mfaRequired: false;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;

  user: AuthUser;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  challengeToken: string;
  expiresIn: number;
}

export type LoginResponse = AuthResponse | MfaRequiredResponse;


