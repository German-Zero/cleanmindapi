import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { PrismaRefreshTokenRepository } from './prisma-refresh-token.repository';

describe('PrismaRefreshTokenRepository', () => {
  function createRepository(consumedCount: number) {
    const transaction = {
      refreshToken: {
        updateMany: jest.fn().mockResolvedValue({ count: consumedCount }),
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    const prisma = {
      $transaction: jest.fn((operation) => operation(transaction)),
    } as unknown as PrismaService;

    return {
      repository: new PrismaRefreshTokenRepository(prisma),
      transaction,
    };
  }

  const current = RefreshToken.restore({
    id: 'current-id',
    tokenHash: 'current-hash',
    userId: 'user-id',
    expiresAt: new Date('2026-12-01T00:00:00.000Z'),
    createdAt: new Date('2026-11-01T00:00:00.000Z'),
    revokedAt: null,
  });
  const replacement = RefreshToken.create({
    tokenHash: 'replacement-hash',
    userId: 'user-id',
    expiresAt: new Date('2026-12-08T00:00:00.000Z'),
  });

  it('creates the replacement only after consuming the active token', async () => {
    const { repository, transaction } = createRepository(1);

    await expect(repository.rotate(current, replacement)).resolves.toBe(true);

    expect(transaction.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  it('does not create a replacement when another request consumed the token', async () => {
    const { repository, transaction } = createRepository(0);

    await expect(repository.rotate(current, replacement)).resolves.toBe(false);

    expect(transaction.refreshToken.create).not.toHaveBeenCalled();
  });
});
