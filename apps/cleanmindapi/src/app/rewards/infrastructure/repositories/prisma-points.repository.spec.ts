import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { PointTransactionType } from '../../domain/enums/point-transaction-type.enum';
import { PrismaPointsRepository } from './prisma-points.repository';

describe('PrismaPointsRepository', () => {
  const input = {
    userId: 'user-1',
    type: PointTransactionType.TASK_COMPLETED,
    sourceId: 'task-1',
    amount: 5,
    periodKey: '2026-08',
    monthlyLimit: 100,
  };

  function createRepository(options: {
    existing?: object | null;
    balance?: number;
    earned?: number;
  } = {}) {
    const aggregates = [
      { _sum: { amount: options.balance ?? 25 } },
      { _sum: { amount: options.earned ?? 10 } },
    ];
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: null }]),
      pointTransaction: {
        findUnique: jest.fn().mockResolvedValue(options.existing ?? null),
        aggregate: jest.fn().mockImplementation(() =>
          Promise.resolve(aggregates.shift() ?? { _sum: { amount: 0 } }),
        ),
        create: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transactionClient) => unknown) =>
          callback(transactionClient),
      ),
      userSettings: {
        findUnique: jest.fn().mockResolvedValue({
          timezone: 'America/Argentina/Cordoba',
        }),
      },
      pointTransaction: {
        aggregate: jest.fn(),
      },
    } as unknown as PrismaService;

    return {
      repository: new PrismaPointsRepository(prisma),
      prisma,
      transactionClient,
    };
  }

  it('serializa por usuario y registra la recompensa completa', async () => {
    const { repository, transactionClient } = createRepository();

    const result = await repository.award(input);

    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(transactionClient.pointTransaction.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: PointTransactionType.TASK_COMPLETED,
        sourceId: 'task-1',
        amount: 5,
        periodKey: '2026-08',
      },
    });
    expect(result).toEqual({
      pointsAwarded: 5,
      balance: 30,
      earnedThisMonth: 15,
    });
  });

  it('recorta la recompensa para no superar los 100 puntos mensuales', async () => {
    const { repository, transactionClient } = createRepository({
      balance: 70,
      earned: 98,
    });

    const result = await repository.award(input);

    expect(transactionClient.pointTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 2 }),
    });
    expect(result).toEqual({
      pointsAwarded: 2,
      balance: 72,
      earnedThisMonth: 100,
    });
  });

  it('registra el origen con cero puntos cuando el límite ya fue alcanzado', async () => {
    const { repository, transactionClient } = createRepository({
      balance: 100,
      earned: 100,
    });

    const result = await repository.award(input);

    expect(transactionClient.pointTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 0 }),
    });
    expect(result.pointsAwarded).toBe(0);
    expect(result.balance).toBe(100);
  });

  it('no vuelve a registrar un origen que ya fue procesado', async () => {
    const { repository, transactionClient } = createRepository({
      existing: { id: 'transaction-1' },
      balance: 50,
      earned: 45,
    });

    const result = await repository.award(input);

    expect(transactionClient.pointTransaction.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      pointsAwarded: 0,
      balance: 50,
      earnedThisMonth: 45,
    });
  });

  it('lee la zona horaria y resume saldo y puntos mensuales', async () => {
    const { repository, prisma } = createRepository();
    const prismaMock = prisma as unknown as {
      pointTransaction: { aggregate: jest.Mock };
      userSettings: { findUnique: jest.Mock };
    };
    prismaMock.pointTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 80 } })
      .mockResolvedValueOnce({ _sum: { amount: 60 } });

    await expect(repository.findUserTimezone('user-1')).resolves.toBe(
      'America/Argentina/Cordoba',
    );
    await expect(repository.getSummary('user-1', '2026-08')).resolves.toEqual({
      balance: 80,
      earnedThisMonth: 60,
    });
  });
});
