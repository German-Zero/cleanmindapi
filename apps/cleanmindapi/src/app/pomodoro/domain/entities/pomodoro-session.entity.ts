import { PomodoroSession, PomodoroSessionFinishUpdate, PomodoroSessionPauseUpdate, PomodoroSessionStatus } from '../models/pomodoro.model';
import { PomodoroSessionTransitionException } from '../exceptions/pomodoro-session-transition.exception';

export class PomodoroSessionEntity {
  private constructor(private readonly session: PomodoroSession) {}

  static restore(session: PomodoroSession): PomodoroSessionEntity {
    return new PomodoroSessionEntity({ ...session });
  }

  pause(now: Date): PomodoroSessionPauseUpdate {
    this.assertActive();

    if (this.session.pausedAt) {
      throw new PomodoroSessionTransitionException(
        'POMODORO_SESSION_ALREADY_PAUSED',
        'La sesión Pomodoro ya está pausada',
      );
    }

    this.session.pausedAt = now;

    return {
      pausedAt: now,
      accumulatedPausedSeconds: this.session.accumulatedPausedSeconds,
    };
  }

  resume(now: Date): PomodoroSessionPauseUpdate {
    this.assertActive();

    if (!this.session.pausedAt) {
      throw new PomodoroSessionTransitionException(
        'POMODORO_SESSION_NOT_PAUSED',
        'La sesión Pomodoro no está pausada',
      );
    }

    const pausedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - this.session.pausedAt.getTime()) / 1000),
    );
    this.session.accumulatedPausedSeconds += pausedSeconds;
    this.session.pausedAt = null;

    return {
      pausedAt: null,
      accumulatedPausedSeconds: this.session.accumulatedPausedSeconds,
    };
  }

  finish(
    status: Exclude<PomodoroSessionStatus, PomodoroSessionStatus.ACTIVE>,
    actualFocusSeconds: number,
    actualBreakSeconds: number,
    endedAt: Date,
  ): PomodoroSessionFinishUpdate {
    this.assertActive();
    this.session.status = status;
    this.session.actualFocusSeconds = actualFocusSeconds;
    this.session.actualBreakSeconds = actualBreakSeconds;
    this.session.endedAt = endedAt;

    return {
      status,
      actualFocusSeconds,
      actualBreakSeconds,
      endedAt,
    };
  }

  private assertActive(): void {
    if (this.session.status !== PomodoroSessionStatus.ACTIVE) {
      throw new PomodoroSessionTransitionException(
        'POMODORO_SESSION_NOT_ACTIVE',
        'La sesión Pomodoro ya no está activa',
      );
    }
  }
}
