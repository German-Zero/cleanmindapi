export class LoginResponse {
  accessToken!: string;
  tokenType = 'Bearer';
  expiresIn = '15m';
}
