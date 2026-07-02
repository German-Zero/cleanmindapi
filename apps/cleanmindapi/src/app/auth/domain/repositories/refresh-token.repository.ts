import { RefreshToken } from "../entities/refresh-token.entity";



export abstract class RefreshTokenRepository {
  abstract create(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract update(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract findById(id: string): Promise<RefreshToken | null>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  abstract findByUserId(userId: string): Promise<RefreshToken[]>;
  abstract revoke(id: string): Promise<void>
  abstract revokeAllByUser(userId: string): Promise<void>;
  abstract deleteExpired(): Promise<void>
}
