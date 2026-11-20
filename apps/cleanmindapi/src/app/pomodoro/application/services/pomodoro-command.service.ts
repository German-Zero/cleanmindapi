import { Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../shared/application/errors/application-error';
import { TaskRepository } from '../../../tasks/domain/repositories/task.repository';
import { PomodoroSessionEntity } from '../../domain/entities/pomodoro-session.entity';
import { PomodoroBreakType, PomodoroSession, PomodoroSessionStatus, PomodoroSettings } from '../../domain/models/pomodoro.model';
import { PomodoroRepository } from '../../domain/repositories/pomodoro.repository';
import { PomodoroCommandPort, UpdatePomodoroSettingsInput } from '../ports/inbound/pomodoro-command.port';
import { PomodoroQueryPort } from '../ports/inbound/pomodoro-query.port';

@Injectable()
export class PomodoroCommandService implements PomodoroCommandPort {
  constructor(
    private readonly repository: PomodoroRepository,
    private readonly taskRepository: TaskRepository,
    private readonly queries: PomodoroQueryPort,
  ) {}

  async updateSettings(
    userId: string,
    input: UpdatePomodoroSettingsInput,
  ): Promise<PomodoroSettings> {
    const current = await this.queries.getSettings(userId);

    return this.repository.upsertSettings(userId, {
      focusMinutes: input.focusMinutes ?? current.focusMinutes,
      shortBreakMinutes: input.shortBreakMinutes ?? current.shortBreakMinutes,
      longBreakMinutes: input.longBreakMinutes ?? current.longBreakMinutes,
      sessionsBeforeLongBreak:
        input.sessionsBeforeLongBreak ?? current.sessionsBeforeLongBreak,
      autoStartBreak: input.autoStartBreak ?? current.autoStartBreak,
      dailyGoalMinutes:
        input.dailyGoalMinutes === undefined
          ? current.dailyGoalMinutes
          : input.dailyGoalMinutes,
    });
  }

  async startSession(
    userId: string,
    taskId: string | null,
    breakType: PomodoroBreakType,
  ): Promise<PomodoroSession> {
    if (await this.repository.findActiveByUserId(userId)) {
      throw new ApplicationError(
        'POMODORO_SESSION_CONFLICT',
        'Ya existe una sesión Pomodoro activa',
      );
    }

    if (taskId) {
      const task = await this.taskRepository.findById(taskId);

      if (!task || task.userId !== userId) {
        throw new ApplicationError('TASK_NOT_FOUND', 'Tarea no encontrada');
      }
    }

    const settings = await this.queries.getSettings(userId);
    const breakMinutes =
      breakType === PomodoroBreakType.LONG
        ? settings.longBreakMinutes
        : settings.shortBreakMinutes;

    return this.repository.createSession({
      userId,
      taskId,
      breakType,
      plannedFocusSeconds: settings.focusMinutes * 60,
      plannedBreakSeconds: breakMinutes * 60,
    });
  }

  async pauseSession(
    userId: string,
    sessionId: string,
    now = new Date(),
  ): Promise<PomodoroSession> {
    const session = await this.getOwnedActiveSession(userId, sessionId);
    const update = PomodoroSessionEntity.restore(session).pause(now);
    const updated = await this.repository.updateActiveSessionPause(
      sessionId,
      userId,
      update,
    );

    if (!updated)
      throw new ApplicationError(
        'POMODORO_SESSION_NOT_FOUND',
        'Sesión Pomodoro activa no encontrada',
      );

    return updated;
  }

  async resumeSession(
    userId: string,
    sessionId: string,
    now = new Date(),
  ): Promise<PomodoroSession> {
    const session = await this.getOwnedActiveSession(userId, sessionId);
    const update = PomodoroSessionEntity.restore(session).resume(now);
    const updated = await this.repository.updateActiveSessionPause(
      sessionId,
      userId,
      update,
    );

    if (!updated)
      throw new ApplicationError(
        'POMODORO_SESSION_NOT_FOUND',
        'Sesión Pomodoro activa no encontrada',
      );

    return updated;
  }

  completeSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.COMPLETED,
      actualFocusSeconds,
      actualBreakSeconds,
    );
  }

  interruptSession(
    userId: string,
    sessionId: string,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.INTERRUPTED,
      actualFocusSeconds,
      actualBreakSeconds,
    );
  }

  cancelSession(userId: string, sessionId: string): Promise<PomodoroSession> {
    return this.finishSession(
      userId,
      sessionId,
      PomodoroSessionStatus.CANCELLED,
      0,
      0,
    );
  }

  private async getOwnedActiveSession(
    userId: string,
    sessionId: string,
  ): Promise<PomodoroSession> {
    const session = await this.repository.findSessionByIdAndUserId(
      sessionId,
      userId,
    );

    if (!session || session.status !== PomodoroSessionStatus.ACTIVE) {
      throw new ApplicationError(
        'POMODORO_SESSION_NOT_FOUND',
        'Sesión Pomodoro activa no encontrada',
      );
    }

    return session;
  }

  private async finishSession(
    userId: string,
    sessionId: string,
    status: Exclude<PomodoroSessionStatus, PomodoroSessionStatus.ACTIVE>,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
  ): Promise<PomodoroSession> {
    const session = await this.getOwnedActiveSession(userId, sessionId);
    const update = PomodoroSessionEntity.restore(session).finish(
      status,
      actualFocusSeconds,
      actualBreakSeconds,
      new Date(),
    );
    const updated = await this.repository.finishActiveSession(
      sessionId,
      userId,
      update,
    );

    if (!updated)
      throw new ApplicationError(
        'POMODORO_SESSION_NOT_FOUND',
        'Sesión Pomodoro activa no encontrada',
      );

    return updated;
  }
}
