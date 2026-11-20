import { Email } from '../../../users/domain/value-objects/email.vo';
import { User } from '../../../users/domain/entities/user.entity';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { SetPasswordCommand } from '../commands/set-password.command';
import { ChangePasswordUseCase } from './change-password.usecase';
import { SetPasswordUseCase } from './set-password.usecase';

describe('password changes', () => {
  it('revokes sessions after changing a local password', async () => {
    const user = User.createLocal({
      id: 'user-id',
      name: 'User',
      email: new Email('user@example.com'),
      passwordHash: 'old-hash',
    });
    const users = {
      findById: jest.fn().mockResolvedValue(user),
    };
    const passwords = {
      compare: jest.fn().mockResolvedValue(true),
      hash: jest.fn().mockResolvedValue('new-hash'),
    };
    const passwordSessions = {
      changePasswordAndRevokeSessions: jest.fn(),
    };
    const useCase = new ChangePasswordUseCase(
      users as never,
      passwords as never,
      passwordSessions as never,
    );

    await useCase.execute(
      new ChangePasswordCommand(
        'user-id',
        'current123',
        'newpass123',
        'newpass123',
      ),
    );

    expect(
      passwordSessions.changePasswordAndRevokeSessions,
    ).toHaveBeenCalledWith('user-id', 'new-hash', user.updatedAt);
  });

  it('revokes sessions after setting a local password', async () => {
    const user = User.createGoogle({
      id: 'user-id',
      name: 'User',
      email: new Email('user@example.com'),
    });
    const users = {
      findById: jest.fn().mockResolvedValue(user),
    };
    const passwords = { hash: jest.fn().mockResolvedValue('new-hash') };
    const passwordSessions = {
      changePasswordAndRevokeSessions: jest.fn(),
    };
    const useCase = new SetPasswordUseCase(
      users as never,
      passwords as never,
      passwordSessions as never,
    );

    await useCase.execute(
      new SetPasswordCommand('user-id', 'newpass123', 'newpass123'),
    );

    expect(
      passwordSessions.changePasswordAndRevokeSessions,
    ).toHaveBeenCalledWith('user-id', 'new-hash', user.updatedAt);
  });
});
