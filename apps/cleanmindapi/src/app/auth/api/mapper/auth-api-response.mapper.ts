import { AuthResponse } from '../../application/common/responses/auth-response';

export type AuthApiResponse = Omit<
  AuthResponse,
  'accessToken' | 'refreshToken'
>;

export class AuthApiResponseMapper {
  static toResponse(response: AuthResponse): AuthApiResponse {
    const result = { ...response };
    delete result.accessToken;
    delete result.refreshToken;
    return result;
  }
}
