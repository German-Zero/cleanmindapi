import { Injectable } from '@nestjs/common';
import { NotificationFrequency as PrismaNotificationFrequency, TaskNotificationKind as PrismaTaskNotificationKind, TaskStatus } from '@prisma/client';

import { NotificationFrequency } from '../../../settings/domain/enums/notification-frequency.enum';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { TaskNotificationKind } from '../../domain/enums/task-notification-kind.enum';
import { TaskReminderCandidate } from '../../domain/models/task-reminder.model';
import { TaskReminderRepository } from '../../domain/repositories/task-reminder.repository';

const SCHEDULER_LOCK_NAMESPACE = 20_261_119;
const SCHEDULER_LOCK_KEY = 1;
const SCHEDULER_TRANSACTION_TIMEOUT_MS = 30_000;

const notificationFrequencies: Record<
  PrismaNotificationFrequency,
  NotificationFrequency
> = {
  [PrismaNotificationFrequency.IMMEDIATE]: NotificationFrequency.IMMEDIATE,
  [PrismaNotificationFrequency.DAILY]: NotificationFrequency.DAILY,
  [PrismaNotificationFrequency.WEEKLY]: NotificationFrequency.WEEKLY,
  [PrismaNotificationFrequency.DISABLED]: NotificationFrequency.DISABLED,
};

const prismaTaskNotificationKinds: Record<
  TaskNotificationKind,
  PrismaTaskNotificationKind
> = {
  [TaskNotificationKind.REMINDER]: PrismaTaskNotificationKind.REMINDER,
  [TaskNotificationKind.OVERDUE]: PrismaTaskNotificationKind.OVERDUE,
};

@Injectable()
export class PrismaTaskReminderRepository implements TaskReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCandidates(through: Date): Promise<TaskReminderCandidate[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        status: { not: TaskStatus.COMPLETED },
        dueDate: { not: null, lte: through },
      },
      include: {
        user: {
          select: {
            email: true,
            userSettings: true,
          },
        },
      },
    });

    return tasks.flatMap((task) => {
      if (!task.dueDate) return [];

      return [
        {
          taskId: task.id,
          userId: task.userId,
          title: task.title,
          dueDate: task.dueDate,
          recipientEmail: task.user.email,
          settings: task.user.userSettings
            ? {
                emailNotifications: task.user.userSettings.emailNotifications,
                whatsappNotifications:
                  task.user.userSettings.whatsappNotifications,
                discordNotifications:
                  task.user.userSettings.discordNotifications,
                taskNotificationFrequency:
                  notificationFrequencies[
                    task.user.userSettings.taskNotificationFrequency
                  ],
                timezone: task.user.userSettings.timezone,
              }
            : null,
        },
      ];
    });
  }

  async recordDelivery(
    taskId: string,
    kind: TaskNotificationKind,
    dueDate: Date,
  ): Promise<void> {
    await this.prisma.taskNotificationDelivery.create({
      data: {
        taskId,
        kind: prismaTaskNotificationKinds[kind],
        dueDate,
      },
    });
  }

  async hasDelivery(
    taskId: string,
    kind: TaskNotificationKind,
    dueDate: Date,
  ): Promise<boolean> {
    const delivery = await this.prisma.taskNotificationDelivery.findUnique({
      where: {
        taskId_kind_dueDate: {
          taskId,
          kind: prismaTaskNotificationKinds[kind],
          dueDate,
        },
      },
      select: { id: true },
    });

    return delivery !== null;
  }

  async withSchedulerLock(action: () => Promise<void>): Promise<boolean> {
    return this.prisma.$transaction(
      async (transaction) => {
        const [lock] = await transaction.$queryRaw<
          Array<{ acquired: boolean }>
        >`
          SELECT pg_try_advisory_xact_lock(
            ${SCHEDULER_LOCK_NAMESPACE}::integer,
            ${SCHEDULER_LOCK_KEY}::integer
          ) AS acquired
        `;

        if (!lock?.acquired) return false;

        await action();
        return true;
      },
      { timeout: SCHEDULER_TRANSACTION_TIMEOUT_MS },
    );
  }
}
