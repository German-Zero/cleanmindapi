import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { DeleteAccountUseCase } from './delete-account.usecase';

describe('DeleteAccountUseCase', () => {
  const users = {
    existsById: jest.fn(),
    delete: jest.fn(),
  };
  const useCase = new DeleteAccountUseCase(
    users as unknown as UserRepository,
  );

  beforeEach(() => {
    users.existsById.mockReset();
    users.delete.mockReset();
  });

  it('deletes the user and their related data through database cascades', async () => {
    users.existsById.mockResolvedValue(true);
    users.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('user-id')).resolves.toBeUndefined();

    expect(users.delete).toHaveBeenCalledWith('user-id');
  });

  it('rejects a missing user without attempting a delete', async () => {
    users.existsById.mockResolvedValue(false);

    await expect(useCase.execute('missing-user')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
    expect(users.delete).not.toHaveBeenCalled();
  });
});
