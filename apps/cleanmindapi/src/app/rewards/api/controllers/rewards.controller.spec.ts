import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { RewardsService } from '../../application/services/rewards.service';
import { RewardsController } from './rewards.controller';

describe('RewardsController', () => {
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

    await expect(
      controller.getSummary({
        sub: 'user-1',
        email: 'user@example.com',
        role: UserRole.USER,
        authTime: 1,
        amr: ['pwd'],
        type: 'access',
      }),
    ).resolves.toEqual(summary);
    expect(rewards.getSummary).toHaveBeenCalledWith('user-1');
  });
});
