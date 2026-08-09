import { GetCurrentUserPort } from '../../../auth/application/ports/inbound/get-current-user.port';
import { PomodoroService } from '../../../pomodoro/application/services/pomodoro.service';
import { RewardsService } from '../../../rewards/application/services/rewards.service';
import { GetSettingsPort } from '../../../settings/application/ports/inbound/get-settings.port';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { DashboardResponseMapper } from '../common/mapper/dashboard-response.mapper';
import { DashboardResponse } from '../common/responses/dashboard.response';
import { GetDashboardCommand } from '../commands/get-dashboard.command';
import { DashboardBuilderService } from '../services/dashboard-builder.service';
import { GetDashboardUseCase } from './get-dashboard.usecase';

describe('GetDashboardUseCase', () => {
  it('incluye el resumen de recompensas en el bootstrap', async () => {
    const tasks = [];
    const pomodoro = {
      today: {
        focusSeconds: 0,
        breakSeconds: 0,
        completedSessions: 0,
      },
    };
    const rewardsSummary = {
      balance: 35,
      earnedThisMonth: 20,
      monthlyLimit: 100,
      remainingThisMonth: 80,
    };
    const rewardStore = {
      summary: rewardsSummary,
      items: [],
    };
    const user = { id: 'user-1' };
    const settings = { theme: 'LUNAR_MIND' };
    const dashboard = {
      summary: { total: 0, todo: 0, inProgress: 0, completed: 0 },
      quadrants: { do: 0, plan: 0, delegate: 0, delete: 0 },
      today: [],
      overdue: [],
      upcoming: [],
      pomodoro: pomodoro.today,
    };
    const response = {
      rewards: rewardsSummary,
      rewardStore,
    } as unknown as DashboardResponse;
    const taskRepository = {
      findAllByUser: jest.fn().mockResolvedValue(tasks),
    } as unknown as TaskRepository;
    const dashboardBuilder = {
      build: jest.fn().mockReturnValue(dashboard),
    } as unknown as DashboardBuilderService;
    const pomodoroService = {
      getSummary: jest.fn().mockResolvedValue(pomodoro),
    } as unknown as PomodoroService;
    const currentUser = {
      execute: jest.fn().mockResolvedValue(user),
    } as unknown as GetCurrentUserPort;
    const getSettings = {
      execute: jest.fn().mockResolvedValue(settings),
    } as unknown as GetSettingsPort;
    const rewards = {
      getStore: jest.fn().mockResolvedValue(rewardStore),
    } as unknown as RewardsService;
    const mapper = jest
      .spyOn(DashboardResponseMapper, 'toResponse')
      .mockReturnValue(response);
    const useCase = new GetDashboardUseCase(
      taskRepository,
      dashboardBuilder,
      pomodoroService,
      currentUser,
      getSettings,
      rewards,
    );

    await expect(
      useCase.execute(new GetDashboardCommand('user-1')),
    ).resolves.toBe(response);
    expect(rewards.getStore).toHaveBeenCalledWith('user-1');
    expect(mapper).toHaveBeenCalledWith(
      dashboard,
      tasks,
      user,
      settings,
      rewardStore,
    );

    mapper.mockRestore();
  });
});
