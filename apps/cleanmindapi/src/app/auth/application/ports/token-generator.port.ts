export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'verify-email' | 'refresh';
}

export abstract class TokenGeneratorPort {
  abstract generateAccessToken(payload: JwtPayload): Promise<string>;
}
