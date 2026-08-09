import { ConflictException, NotFoundException } from '@nestjs/common';
import { RewardsService } from '../../../rewards/application/services/rewards.service';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import {
  PomodoroBreakType,
  PomodoroSession,
  PomodoroSessionStatus,
  PomodoroSettings,
} from '../../domain/models/pomodoro.model';
import { PomodoroRepository } from '../../domain/repositories/pomodoro.repository';
import { PomodoroService } from './pomodoro.service';

describe('PomodoroService', () => {
  const settings: PomodoroSettings = {
    userId: 'user-id',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreak: false,
    dailyGoalMinutes: null,
  };

  const activeSession: PomodoroSession = {
    id: 'session-id',
    userId: 'user-id',
    taskId: null,
    status: PomodoroSessionStatus.ACTIVE,
    breakType: PomodoroBreakType.SHORT,
    plannedFocusSeconds: 1500,
    plannedBreakSeconds: 300,
    actualFocusSeconds: 0,
    actualBreakSeconds: 0,
    startedAt: new Date('2026-07-21T12:00:00.000Z'),
    endedAt: null,
    pausedAt: null,
    accumulatedPausedSeconds: 0,
  };

  function createService(
    overrides: {
      repository?: Partial<PomodoroRepository>;
      tasks?: Partial<TaskRepository>;
      rewards?: Partial<RewardsService>;
    } = {},
  ) {
    const repository = {
      findUserTimezone: jest
        .fn()
        .mockResolvedValue('America/Argentina/Cordoba'),
      findSettingsByUserId: jest.fn().mockResolvedValue(settings),
      upsertSettings: jest.fn(),
      findActiveByUserId: jest.fn().mockResolvedValue(null),
      findSessionByIdAndUserId: jest.fn(),
      createSession: jest.fn().mockResolvedValue(activeSession),
      updateActiveSessionPause: jest.fn().mockResolvedValue(activeSession),
      finishActiveSession: jest.fn(),
      findEndedBetween: jest.fn().mockResolvedValue([]),
      ...overrides.repository,
    } as unknown as PomodoroRepository;
    const tasks = {
      findById: jest.fn(),
      ...overrides.tasks,
    } as unknown as TaskRepository;
    const rewards = {
      awardPomodoroCompletion: jest.fn().mockResolvedValue({
        pointsAwarded: 2,
        balance: 22,
        earnedThisMonth: 12,
        monthlyLimit: 100,
        remainingThisMonth: 88,
      }),
      ...overrides.rewards,
    } as unknown as RewardsService;

    return {
      service: new PomodoroService(repository, tasks, rewards),
      repository,
      tasks,
      rewards,
    };
  }

  it('loads settings, active session and summary as one state', async () => {
    const { service } = createService({
      repository: {
        findActiveByUserId: jest.fn().mockResolvedValue(activeSession),
      },
    });

    const state = await service.getState(
      'user-id',
      7,
    );

    expect(state.settings).toBe(settings);
    expect(state.activeSession).toBe(activeSession);
    expect(state.summary.period.days).toBe(7);
    expect(state.summary.daily).toHaveLength(7);
  });

  it('starts a session using the authenticated user settings', async () => {
    const { service, repository } = createService();

    await service.startSession('user-id', null, PomodoroBreakType.LONG);

    expect(repository.createSession).toHaveBeenCalledWith({
      userId: 'user-id',
      taskId: null,
      breakType: PomodoroBreakType.LONG,
      plannedFocusSeconds: 1500,
      plannedBreakSeconds: 900,
    });
  });

  it('does not allow two active sessions for the same user', async () => {
    const { service } = createService({
      repository: {
        findActiveByUserId: jest.fn().mockResolvedValue(activeSession),
      },
    });

    await expect(
      service.startSession('user-id', null, PomodoroBreakType.SHORT),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not allow linking another user task', async () => {
    const { service } = createService({
      tasks: {
        findById: jest.fn().mockResolvedValue({ userId: 'other-user' }),
      },
    });

    await expect(
      service.startSession('user-id', 'task-id', PomodoroBreakType.SHORT),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('persists when an active session is paused', async () => {
    const now = new Date('2026-07-21T12:05:00.000Z');
    const { service, repository } = createService({
      repository: {
        findSessionByIdAndUserId: jest.fn().mockResolvedValue(activeSession),
      },
    });

    await service.pauseSession('user-id', 'session-id', now);

    expect(repository.updateActiveSessionPause).toHaveBeenCalledWith(
      'session-id',
      'user-id',
      {
        pausedAt: now,
        accumulatedPausedSeconds: 0,
      },
    );
  });

  it('adds the paused duration when an active session resumes', async () => {
    const pausedAt = new Date('2026-07-21T12:05:00.000Z');
    const { service, repository } = createService({
      repository: {
        findSessionByIdAndUserId: jest.fn().mockResolvedValue({
          ...activeSession,
          pausedAt,
          accumulatedPausedSeconds: 20,
        }),
      },
    });

    await service.resumeSession(
      'user-id',
      'session-id',
      new Date('2026-07-21T12:06:10.500Z'),
    );

    expect(repository.updateActiveSessionPause).toHaveBeenCalledWith(
      'session-id',
      'user-id',
      {
        pausedAt: null,
        accumulatedPausedSeconds: 90,
      },
    );
  });

  it('builds neutral daily statistics from completed and interrupted focus', async () => {
    const sessions: PomodoroSession[] = [
      {
        ...activeSession,
        id: 'completed',
        status: PomodoroSessionStatus.COMPLETED,
        actualFocusSeconds: 1500,
        actualBreakSeconds: 300,
        endedAt: new Date(2026, 6, 21, 10, 0),
      },
      {
        ...activeSession,
        id: 'interrupted',
        status: PomodoroSessionStatus.INTERRUPTED,
        actualFocusSeconds: 600,
        actualBreakSeconds: 0,
        endedAt: new Date(2026, 6, 21, 11, 0),
      },
    ];
    const { service } = createService({
      repository: {
        findEndedBetween: jest.fn().mockResolvedValue(sessions),
      },
    });

    const summary = await service.getSummary(
      'user-id',
      7,
      new Date(2026, 6, 21, 12, 0),
    );

    expect(summary.today).toEqual({
      focusSeconds: 2100,
      breakSeconds: 300,
      completedSessions: 1,
    });
    expect(summary.period).toEqual(
      expect.objectContaining({
        completedSessions: 1,
        interruptedSessions: 1,
        focusSeconds: 2100,
      }),
    );
    expect(summary.daily).toHaveLength(7);
  });

  it('otorga puntos cuando completa una sesión de enfoque', async () => {
    const completed = {
      ...activeSession,
      status: PomodoroSessionStatus.COMPLETED,
      actualFocusSeconds: 1500,
      actualBreakSeconds: 300,
      endedAt: new Date('2026-07-21T12:30:00.000Z'),
    };
    const { service, rewards } = createService({
      repository: {
        finishActiveSession: jest.fn().mockResolvedValue(completed),
      },
    });

    const result = await service.completeSession(
      'user-id',
      'session-id',
      1500,
      300,
    );

    expect(rewards.awardPomodoroCompletion).toHaveBeenCalledWith(
      'user-id',
      completed,
    );
    expect(result.reward.pointsAwarded).toBe(2);
  });

  it('recupera una finalización repetida sin duplicar la recompensa', async () => {
    const completed = {
      ...activeSession,
      status: PomodoroSessionStatus.COMPLETED,
      actualFocusSeconds: 1500,
      endedAt: new Date('2026-07-21T12:25:00.000Z'),
    };
    const { service, rewards } = createService({
      repository: {
        finishActiveSession: jest.fn().mockResolvedValue(null),
        findSessionByIdAndUserId: jest.fn().mockResolvedValue(completed),
      },
    });

    const result = await service.completeSession(
      'user-id',
      'session-id',
      1500,
      0,
    );

    expect(rewards.awardPomodoroCompletion).toHaveBeenCalledWith(
      'user-id',
      completed,
    );
    expect(result.reward.pointsAwarded).toBe(2);
  });
});
