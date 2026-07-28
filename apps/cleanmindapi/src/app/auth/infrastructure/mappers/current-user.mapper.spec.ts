import { User } from "../../../users/domain/entities/user.entity";
import { AuthProvider } from "../../../users/domain/enums/auth-provider.enum";
import { UserRole } from "../../../users/domain/enums/user-role.enum";
import { Email } from "../../../users/domain/value-objects/email.vo";
import { CurrentUserMapper } from "./current-user.mapper";

describe('CurrentUserMapper', () => {
  it('returns the complete current user contract', () => {
    const now = new Date();
    const user = new User(
      'user-id',
      'Ada Lovelace',
      new Email('ada@example.com'),
      'password-hash',
      AuthProvider.LOCAL,
      UserRole.USER,
      true,
      'https://example.com/avatar.png',
      now,
      now,
      null,
    );

    expect(CurrentUserMapper.toResponse(user)).toEqual({
      id: 'user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: UserRole.USER,
      avatarUrl: 'https://example.com/avatar.png',
      hasPassword: true,
    });

    user.passwordHash = null;
    user.avatarUrl = null;

    expect(CurrentUserMapper.toResponse(user)).toMatchObject({
      avatarUrl: null,
      hasPassword: false,
    });
  });
});
