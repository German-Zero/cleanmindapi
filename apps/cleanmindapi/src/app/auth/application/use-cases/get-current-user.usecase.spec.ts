import { User } from '../../../users/domain/entities/user.entity';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { GetCurrentUserUseCase } from './get-current-user.usecase';

describe('GetCurrentUserUseCase', () => {
  const users = {
    findById: jest.fn(),
  };
  const useCase = new GetCurrentUserUseCase(
    users as unknown as UserRepository,
  );

  beforeEach(() => {
    users.findById.mockReset();
  });

  it('returns the persisted user profile', async () => {
    const user = {
      id: 'user-id',
      name: 'Ada Lovelace',
      passwordHash: null,
    } as User;
    users.findById.mockResolvedValue(user);

    await expect(useCase.execute('user-id')).resolves.toBe(user);
    expect(users.findById).toHaveBeenCalledWith('user-id');
  });

  it('rejects a missing user', async () => {
    users.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-user')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });
});
