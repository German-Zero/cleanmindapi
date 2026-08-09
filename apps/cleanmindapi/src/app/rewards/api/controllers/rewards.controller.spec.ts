import { JwtPayload } from '../../../auth/application/common/jwt-payload';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { RewardsService } from '../../application/services/rewards.service';
import { RewardsController } from './rewards.controller';

describe('RewardsController', () => {
  const user: JwtPayload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: UserRole.USER,
    authTime: 1,
    amr: ['pwd'],
    type: 'access',
  };

  it('devuelve el resumen del usuario autenticado', async () => {
    const summary = {
      balance: 45,
      earnedThisMonth: 35,
      monthlyLimit: 100,
      remainingThisMonth: 65,
    };
    const rewards = {
      getSummary: jest.fn().mockResolvedValue(summary),
    } as unknown as RewardsService;
    const controller = new RewardsController(rewards);

    await expect(controller.getSummary(user)).resolves.toEqual(summary);
    expect(rewards.getSummary).toHaveBeenCalledWith('user-1');
  });

  it('expone la tienda del usuario autenticado', async () => {
    const store = { summary: { balance: 40 }, items: [] };
    const rewards = {
      getStore: jest.fn().mockResolvedValue(store),
    } as unknown as RewardsService;
    const controller = new RewardsController(rewards);

    await expect(controller.getStore(user)).resolves.toBe(store);
    expect(rewards.getStore).toHaveBeenCalledWith('user-1');
  });

  it('canjea un artículo para el usuario autenticado', async () => {
    const purchase = {
      summary: { balance: 5 },
      item: { id: 'BORDER_AURORA', owned: true },
      purchased: true,
    };
    const rewards = {
      purchaseStoreItem: jest.fn().mockResolvedValue(purchase),
    } as unknown as RewardsService;
    const controller = new RewardsController(rewards);

    await expect(
      controller.purchaseStoreItem(user, 'BORDER_AURORA'),
    ).resolves.toBe(purchase);
    expect(rewards.purchaseStoreItem).toHaveBeenCalledWith(
      'user-1',
      'BORDER_AURORA',
    );
  });

  it('equipa un artículo para el usuario autenticado', async () => {
    const store = { summary: { balance: 5 }, items: [] };
    const rewards = {
      setStoreItemEquipped: jest.fn().mockResolvedValue(store),
    } as unknown as RewardsService;
    const controller = new RewardsController(rewards);

    await expect(
      controller.equipStoreItem(user, 'BORDER_AURORA'),
    ).resolves.toBe(store);
    expect(rewards.setStoreItemEquipped).toHaveBeenCalledWith(
      'user-1',
      'BORDER_AURORA',
      true,
    );
  });

  it('quita un artículo para el usuario autenticado', async () => {
    const store = { summary: { balance: 5 }, items: [] };
    const rewards = {
      setStoreItemEquipped: jest.fn().mockResolvedValue(store),
    } as unknown as RewardsService;
    const controller = new RewardsController(rewards);

    await expect(
      controller.unequipStoreItem(user, 'BORDER_AURORA'),
    ).resolves.toBe(store);
    expect(rewards.setStoreItemEquipped).toHaveBeenCalledWith(
      'user-1',
      'BORDER_AURORA',
      false,
    );
  });
});
