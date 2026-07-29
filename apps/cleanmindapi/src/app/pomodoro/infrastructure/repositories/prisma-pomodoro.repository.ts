import { ConflictException, Injectable } from '@nestjs/common';
import {
  PomodoroBreakType as PrismaPomodoroBreakType,
  PomodoroSession as PrismaPomodoroSession,
  PomodoroSessionStatus as PrismaPomodoroSessionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import {
  PomodoroBreakType,
  PomodoroSession,
  PomodoroSessionStatus,
  PomodoroSettings,
} from '../../domain/models/pomodoro.model';
import {
  CreatePomodoroSessionData,
  FinishPomodoroSessionData,
  PomodoroRepository,
  PomodoroSettingsUpdate,
  UpdatePomodoroPauseData,
} from '../../domain/repositories/pomodoro.repository';

@Injectable()
export class PrismaPomodoroRepository implements PomodoroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserTimezone(userId: string): Promise<string> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { timezone: true },
    });

    return settings?.timezone ?? 'America/Argentina/Cordoba';
  }

  async findSettingsByUserId(userId: string): Promise<PomodoroSettings | null> {
    const settings = await this.prisma.pomodoroSettings.findUnique({
      where: { userId },
    });

    return settings ? { ...settings } : null;
  }

  async upsertSettings(
    userId: string,
    settings: PomodoroSettingsUpdate,
  ): Promise<PomodoroSettings> {
    const saved = await this.prisma.pomodoroSettings.upsert({
      where: { userId },
      create: { userId, ...settings },
      update: settings,
    });

    return { ...saved };
  }

  async findActiveByUserId(userId: string): Promise<PomodoroSession | null> {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: {
        userId,
        status: PrismaPomodoroSessionStatus.ACTIVE,
      },
    });

    return session ? this.toDomain(session) : null;
  }

  async findSessionByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<PomodoroSession | null> {
    const session = await this.prisma.pomodoroSession.findFirst({
      where: { id, userId },
    });

    return session ? this.toDomain(session) : null;
  }

  async createSession(
    data: CreatePomodoroSessionData,
  ): Promise<PomodoroSession> {
    try {
      const session = await this.prisma.pomodoroSession.create({
        data: {
          ...data,
          breakType: data.breakType as PrismaPomodoroBreakType,
        },
      });

      return this.toDomain(session);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe una sesión Pomodoro activa');
      }

      throw error;
    }
  }

  async updateActiveSessionPause(
    id: string,
    userId: string,
    data: UpdatePomodoroPauseData,
  ): Promise<PomodoroSession | null> {
    const result = await this.prisma.pomodoroSession.updateMany({
      where: {
        id,
        userId,
        status: PrismaPomodoroSessionStatus.ACTIVE,
      },
      data: {
        pausedAt: data.pausedAt,
        accumulatedPausedSeconds: data.accumulatedPausedSeconds,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findSessionByIdAndUserId(id, userId);
  }

  async finishActiveSession(
    id: string,
    userId: string,
    data: FinishPomodoroSessionData,
  ): Promise<PomodoroSession | null> {
    const result = await this.prisma.pomodoroSession.updateMany({
      where: {
        id,
        userId,
        status: PrismaPomodoroSessionStatus.ACTIVE,
      },
      data: {
        status: data.status as PrismaPomodoroSessionStatus,
        actualFocusSeconds: data.actualFocusSeconds,
        actualBreakSeconds: data.actualBreakSeconds,
        endedAt: data.endedAt,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findSessionByIdAndUserId(id, userId);
  }

  async findEndedBetween(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<PomodoroSession[]> {
    const sessions = await this.prisma.pomodoroSession.findMany({
      where: {
        userId,
        endedAt: { gte: from, lte: to },
      },
      orderBy: { endedAt: 'asc' },
    });

    return sessions.map((session) => this.toDomain(session));
  }

  private toDomain(session: PrismaPomodoroSession): PomodoroSession {
    return {
      id: session.id,
      userId: session.userId,
      taskId: session.taskId,
      status: session.status as PomodoroSessionStatus,
      breakType: session.breakType as PomodoroBreakType,
      plannedFocusSeconds: session.plannedFocusSeconds,
      plannedBreakSeconds: session.plannedBreakSeconds,
      actualFocusSeconds: session.actualFocusSeconds,
      actualBreakSeconds: session.actualBreakSeconds,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      pausedAt: session.pausedAt,
      accumulatedPausedSeconds: session.accumulatedPausedSeconds,
    };
  }
}
