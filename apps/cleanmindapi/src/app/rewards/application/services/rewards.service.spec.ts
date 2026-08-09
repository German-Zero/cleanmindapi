import { PomodoroBreakType, PomodoroSession, PomodoroSessionStatus } from '../../../pomodoro/domain/models/pomodoro.model';
import { PointTransactionType } from '../../domain/enums/point-transaction-type.enum';
import { PointsRepository } from '../../domain/repositories/points.repository';
import { RewardsService } from './rewards.service';

describe('RewardsService', () => {
  const repositoryResult = {
    pointsAwarded: 5,
    balance: 45,
    earnedThisMonth: 35,
  };

  const createService = (
    overrides: Partial<PointsRepository> = {},
  ) => {
    const repository = {
      findUserTimezone: jest
        .fn()
        .mockResolvedValue('America/Argentina/Cordoba'),
      award: jest.fn().mockResolvedValue(repositoryResult),
      getSummary: jest.fn().mockResolvedValue({
        balance: 40,
        earnedThisMonth: 30,
      }),
      ...overrides,
    } as unknown as PointsRepository;

    return {
      service: new RewardsService(repository),
      repository,
    };
  };

  it('otorga 5 puntos una sola vez por tarea y usa el mes del usuario', async () => {
    const { service, repository } = createService();

    const result = await service.awardTaskCompletion(
      'user-1',
      'task-1',
      new Date('2026-09-01T01:00:00.000Z'),
    );

    expect(repository.award).toHaveBeenCalledWith({
      userId: 'user-1',
      type: PointTransactionType.TASK_COMPLETED,
      sourceId: 'task-1',
      amount: 5,
      periodKey: '2026-08',
      monthlyLimit: 100,
    });
    expect(result).toEqual({
      ...repositoryResult,
      monthlyLimit: 100,
      remainingThisMonth: 65,
    });
  });

  it('otorga 2 puntos por una sesiÃ³n Pomodoro elegible', async () => {
    const { service, repository } = createService({
      award: jest.fn().mockResolvedValue({
        pointsAwarded: 2,
        balance: 42,
        earnedThisMonth: 32,
      }),
    });
    const session: PomodoroSession = {
      id: 'session-1',
      userId: 'user-1',
      taskId: null,
      status: PomodoroSessionStatus.COMPLETED,
      breakType: PomodoroBreakType.SHORT,
      plannedFocusSeconds: 1500,
      plannedBreakSeconds: 300,
      actualFocusSeconds: 1500,
      actualBreakSeconds: 300,
      startedAt: new Date('2026-08-08T12:00:00.000Z'),
      endedAt: new Date('2026-08-08T12:25:00.000Z'),
      pausedAt: null,
      accumulatedPausedSeconds: 0,
    };

    const result = await service.awardPomodoroCompletion(
      'user-1',
      session,
      new Date('2026-08-08T12:25:00.000Z'),
    );

    expect(repository.award).toHaveBeenCalledWith({
      userId: 'user-1',
      type: PointTransactionType.POMODORO_COMPLETED,
      sourceId: 'session-1',
      amount: 2,
      periodKey: '2026-08',
      monthlyLimit: 100,
    });
    expect(result.pointsAwarded).toBe(2);
  });

  it('no premia Pomodoros menores a 15 minutos efectivos', async () => {
    const { service, repository } = createService();
    const session: PomodoroSession = {
      id: 'session-short',
      userId: 'user-1',
      taskId: null,
      status: PomodoroSessionStatus.COMPLETED,
      breakType: PomodoroBreakType.SHORT,
      plannedFocusSeconds: 600,
      plannedBreakSeconds: 300,
      actualFocusSeconds: 600,
      actualBreakSeconds: 0,
      startedAt: new Date('2026-08-08T12:00:00.000Z'),
      endedAt: new Date('2026-08-08T12:10:00.000Z'),
      pausedAt: null,
      accumulatedPausedSeconds: 0,
    };

    const result = await service.awardPomodoroCompletion(
      'user-1',
      session,
      new Date('2026-08-08T12:10:00.000Z'),
    );

    expect(repository.award).not.toHaveBeenCalled();
    expect(repository.getSummary).toHaveBeenCalledWith('user-1', '2026-08');
    expect(result).toEqual({
      pointsAwarded: 0,
      balance: 40,
      earnedThisMonth: 30,
      monthlyLimit: 100,
      remainingThisMonth: 70,
    });
  });

  it('expone el saldo y el progreso del mes actual', async () => {
    const { service, repository } = createService();

    const result = await service.getSummary(
      'user-1',
      new Date('2026-08-08T12:00:00.000Z'),
    );

    expect(repository.getSummary).toHaveBeenCalledWith('user-1', '2026-08');
    expect(result).toEqual({
      balance: 40,
      earnedThisMonth: 30,
      monthlyLimit: 100,
      remainingThisMonth: 70,
    });
  });
});
