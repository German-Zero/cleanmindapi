import { AuthResponse } from '../../application/common/responses/auth-response';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { AuthApiResponseMapper } from './auth-api-response.mapper';

describe('AuthApiResponseMapper', () => {
  it('does not expose authentication tokens in the response body', () => {
    const response: AuthResponse = {
      mfaRequired: false,
      accessToken: 'access-secret',
      refreshToken: 'refresh-secret',
      expiresIn: 900,
      refreshExpiresIn: 604800,
      user: {
        id: 'user-id',
        name: 'User',
        email: 'user@example.com',
        role: UserRole.USER,
        avatarUrl: null,
        emailVerified: true,
        requiresTermsAcceptance: false,
        needsOnboarding: false,
      },
    };

    const result = AuthApiResponseMapper.toResponse(response);

    expect(result).not.toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('refreshToken');
    expect(result.user).toEqual(response.user);
  });
});
