import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  NotificationFrequency,
  TaskNotificationKind,
  TaskStatus,
} from '@prisma/client';

import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { NotificationFactory } from '../factories/notification.factory';
import { NotificationDispatcherService } from './notification-dispatcher.service';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_LOOKAHEAD_DAYS = 7;

function dateKeyInTimezone(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value;

    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function dayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export function taskNotificationKind(
  frequency: NotificationFrequency,
  dueDate: Date,
  now: Date,
  timezone: string,
): TaskNotificationKind | null {
  if (frequency === NotificationFrequency.DISABLED) return null;

  const today = dayNumber(dateKeyInTimezone(now, timezone));
  const due = dayNumber(dueDate.toISOString().slice(0, 10));
  const daysUntilDue = due - today;

  if (daysUntilDue < 0) return TaskNotificationKind.OVERDUE;

  const reminderWindow = {
    [NotificationFrequency.IMMEDIATE]: 0,
    [NotificationFrequency.DAILY]: 1,
    [NotificationFrequency.WEEKLY]: 7,
    [NotificationFrequency.DISABLED]: -1,
  }[frequency];

  return daysUntilDue <= reminderWindow ? TaskNotificationKind.REMINDER : null;
}

@Injectable()
export class TaskReminderScheduler
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(TaskReminderScheduler.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationFactory,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  onApplicationBootstrap(): void {
    void this.run();
    this.timer = setInterval(() => void this.run(), CHECK_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async run(now = new Date()): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const maxDueDate = new Date(
        now.getTime() + (MAX_LOOKAHEAD_DAYS + 1) * DAY_MS,
      );
      const tasks = await this.prisma.task.findMany({
        where: {
          status: { not: TaskStatus.COMPLETED },
          dueDate: { not: null, lte: maxDueDate },
        },
        include: {
          user: {
            select: {
              email: true,
              userSettings: true,
            },
          },
          notificationDeliveries: {
            select: {
              kind: true,
              dueDate: true,
            },
          },
        },
      });

      let delivered = 0;

      for (const task of tasks) {
        const settings = task.user.userSettings;
        const dueDate = task.dueDate;

        if (!settings || !dueDate) continue;
        if (
          !settings.emailNotifications &&
          !settings.whatsappNotifications &&
          !settings.discordNotifications
        )
          continue;

        const kind = taskNotificationKind(
          settings.taskNotificationFrequency,
          dueDate,
          now,
          settings.timezone,
        );

        if (!kind) continue;
        if (
          task.notificationDeliveries.some(
            (delivery) =>
              delivery.kind === kind &&
              delivery.dueDate.getTime() === dueDate.getTime(),
          )
        )
          continue;

        const notification =
          kind === TaskNotificationKind.OVERDUE
            ? this.notifications.buildTaskOverdue(
                task.user.email,
                task.title,
                dueDate,
              )
            : this.notifications.buildTaskReminder(
                task.user.email,
                task.title,
                dueDate,
              );

        const sent = await this.dispatcher.send(task.userId, notification);
        if (!sent) continue;

        await this.prisma.taskNotificationDelivery.create({
          data: {
            taskId: task.id,
            kind,
            dueDate,
          },
        });
        delivered += 1;
      }

      if (delivered > 0) {
        this.logger.log(`${delivered} recordatorio(s) de tareas enviados`);
      }
    } catch (error) {
      this.logger.error(
        'No se pudieron procesar los recordatorios de tareas',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.running = false;
    }
  }
}
