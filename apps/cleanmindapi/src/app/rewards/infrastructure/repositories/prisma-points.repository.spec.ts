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

  function createRepository(
    options: {
      existing?: object | null;
      balance?: number;
      earned?: number;
    } = {},
  ) {
    const aggregates = [
      { _sum: { amount: options.balance ?? 25 } },
      { _sum: { amount: options.earned ?? 10 } },
    ];
    const transactionClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: null }]),
      pointTransaction: {
        findUnique: jest.fn().mockResolvedValue(options.existing ?? null),
        aggregate: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve(aggregates.shift() ?? { _sum: { amount: 0 } }),
          ),
        create: jest.fn().mockResolvedValue({}),
      },
      userSettings: {
        findUnique: jest.fn().mockResolvedValue({ equippedStoreItems: [] }),
        upsert: jest.fn().mockResolvedValue({}),
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
          equippedStoreItems: [],
        }),
      },
      pointTransaction: {
        aggregate: jest.fn(),
        findMany: jest.fn().mockResolvedValue([{ sourceId: 'BORDER_AURORA' }]),
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
    const lockQuery = transactionClient.$queryRaw.mock.calls[0][0] as string[];
    expect(lockQuery.join('')).toContain(')::text AS locked');
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

  it('usa valores seguros cuando no hay configuración ni movimientos', async () => {
    const { repository, prisma } = createRepository();
    const prismaMock = prisma as unknown as {
      pointTransaction: { aggregate: jest.Mock };
      userSettings: { findUnique: jest.Mock };
    };
    prismaMock.userSettings.findUnique.mockResolvedValue(null);
    prismaMock.pointTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    await expect(repository.findUserTimezone('user-1')).resolves.toBe(
      'America/Argentina/Cordoba',
    );
    await expect(repository.getSummary('user-1', '2026-08')).resolves.toEqual({
      balance: 0,
      earnedThisMonth: 0,
    });
  });

  it('descuenta el costo y registra el canje como movimiento negativo', async () => {
    const { repository, transactionClient } = createRepository({
      balance: 60,
      earned: 30,
    });

    const result = await repository.redeemStoreItem({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      cost: 35,
      periodKey: '2026-08',
    });

    expect(transactionClient.pointTransaction.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: PointTransactionType.STORE_REDEMPTION,
        sourceId: 'BORDER_AURORA',
        amount: -35,
        periodKey: '2026-08',
      },
    });
    expect(result).toEqual({
      status: 'PURCHASED',
      balance: 25,
      earnedThisMonth: 30,
    });
  });

  it('no registra el canje si el saldo es insuficiente', async () => {
    const { repository, transactionClient } = createRepository({
      balance: 20,
      earned: 20,
    });

    const result = await repository.redeemStoreItem({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      cost: 35,
      periodKey: '2026-08',
    });

    expect(result.status).toBe('INSUFFICIENT_POINTS');
    expect(result.balance).toBe(20);
    expect(transactionClient.pointTransaction.create).not.toHaveBeenCalled();
  });

  it('no cobra nuevamente una recompensa ya adquirida', async () => {
    const { repository, transactionClient } = createRepository({
      existing: { id: 'redemption-1' },
      balance: 25,
      earned: 30,
    });

    const result = await repository.redeemStoreItem({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      cost: 35,
      periodKey: '2026-08',
    });

    expect(result.status).toBe('OWNED');
    expect(result.balance).toBe(25);
    expect(transactionClient.pointTransaction.create).not.toHaveBeenCalled();
  });

  it('lista los identificadores de recompensas adquiridas', async () => {
    const { repository, prisma } = createRepository();

    await expect(repository.getOwnedStoreItemIds('user-1')).resolves.toEqual([
      'BORDER_AURORA',
    ]);
    expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        type: PointTransactionType.STORE_REDEMPTION,
      },
      select: { sourceId: true },
    });
  });

  it('lista las recompensas equipadas desde la configuración', async () => {
    const { repository, prisma } = createRepository();
    const prismaMock = prisma as unknown as {
      userSettings: { findUnique: jest.Mock };
    };
    prismaMock.userSettings.findUnique.mockResolvedValue({
      equippedStoreItems: ['BORDER_AURORA'],
    });

    await expect(repository.getEquippedStoreItemIds('user-1')).resolves.toEqual(
      ['BORDER_AURORA'],
    );
  });

  it('equipa una recompensa adquirida y reemplaza su categoría', async () => {
    const { repository, transactionClient } = createRepository({
      existing: { id: 'redemption-1' },
    });
    transactionClient.userSettings.findUnique.mockResolvedValue({
      equippedStoreItems: ['BORDER_SUNSET', 'EFFECT_SERENE_GLASS'],
    });

    const result = await repository.setStoreItemEquipped({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      categoryItemIds: ['BORDER_AURORA', 'BORDER_SUNSET'],
      equipped: true,
    });

    expect(transactionClient.userSettings.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      create: {
        userId: 'user-1',
        equippedStoreItems: ['EFFECT_SERENE_GLASS', 'BORDER_AURORA'],
      },
      update: {
        equippedStoreItems: ['EFFECT_SERENE_GLASS', 'BORDER_AURORA'],
      },
    });
    expect(result).toEqual({
      status: 'UPDATED',
      equippedItemIds: ['EFFECT_SERENE_GLASS', 'BORDER_AURORA'],
    });
  });

  it('no equipa una recompensa que el usuario no adquirió', async () => {
    const { repository, transactionClient } = createRepository({
      existing: null,
    });

    const result = await repository.setStoreItemEquipped({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      categoryItemIds: ['BORDER_AURORA', 'BORDER_SUNSET'],
      equipped: true,
    });

    expect(result).toEqual({
      status: 'NOT_OWNED',
      equippedItemIds: [],
    });
    expect(transactionClient.userSettings.upsert).not.toHaveBeenCalled();
  });

  it('quita una recompensa sin alterar las demás categorías', async () => {
    const { repository, transactionClient } = createRepository();
    transactionClient.userSettings.findUnique.mockResolvedValue({
      equippedStoreItems: ['BORDER_AURORA', 'EFFECT_SERENE_GLASS'],
    });

    await repository.setStoreItemEquipped({
      userId: 'user-1',
      itemId: 'BORDER_AURORA',
      categoryItemIds: ['BORDER_AURORA', 'BORDER_SUNSET'],
      equipped: false,
    });

    expect(transactionClient.userSettings.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { equippedStoreItems: ['EFFECT_SERENE_GLASS'] },
      }),
    );
  });
});
