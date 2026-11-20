import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaPasswordResetTokenRepository } from './prisma-password-reset-token.repository';

describe('PrismaPasswordResetTokenRepository', () => {
  function createRepository(consumedCount: number) {
    const transaction = {
      passwordResetToken: {
        updateMany: jest.fn().mockResolvedValue({ count: consumedCount }),
      },
      user: { update: jest.fn().mockResolvedValue(undefined) },
      refreshToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const prisma = {
      $transaction: jest.fn((operation) => operation(transaction)),
    } as unknown as PrismaService;

    return {
      repository: new PrismaPasswordResetTokenRepository(prisma),
      transaction,
    };
  }

  it('updates the password and revokes sessions in the token transaction', async () => {
    const { repository, transaction } = createRepository(1);

    await expect(
      repository.completeReset('token-id', 'user-id', 'new-hash', new Date()),
    ).resolves.toBe(true);

    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { passwordHash: 'new-hash' },
    });
    expect(transaction.refreshToken.updateMany).toHaveBeenCalledTimes(1);
  });

  it('does not update the password when the reset token was already consumed', async () => {
    const { repository, transaction } = createRepository(0);

    await expect(
      repository.completeReset('token-id', 'user-id', 'new-hash', new Date()),
    ).resolves.toBe(false);

    expect(transaction.user.update).not.toHaveBeenCalled();
    expect(transaction.refreshToken.updateMany).not.toHaveBeenCalled();
  });
});
