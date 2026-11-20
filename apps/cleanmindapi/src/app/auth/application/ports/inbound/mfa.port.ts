import type { AuthResponse } from '../../common/responses/auth-response';
import type { MfaSetupResponse, MfaStatusResponse } from '../../common/responses/mfa-responses';
import type { MfaRequiredResponse } from '../../common/responses/auth-response';
import type { User } from '../../../../users/domain/entities/user.entity';

export abstract class MfaPort {
  abstract status(userId: string): Promise<MfaStatusResponse>;
  abstract setup(userId: string, authTime: number): Promise<MfaSetupResponse>;
  abstract enable(userId: string, code: string): Promise<string[]>;
  abstract disable(userId: string, code: string): Promise<void>;
  abstract regenerateRecoveryCodes(
    userId: string,
    code: string,
  ): Promise<string[]>;
  abstract beginLogin(
    user: User,
    primaryMethod: 'pwd' | 'google',
  ): Promise<MfaRequiredResponse | null>;
  abstract verifyLogin(
    challengeToken: string,
    code: string,
  ): Promise<AuthResponse>;
}
