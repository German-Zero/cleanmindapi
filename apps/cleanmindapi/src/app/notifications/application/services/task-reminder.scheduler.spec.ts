import { NotificationFrequency } from '../../../settings/domain/enums/notification-frequency.enum';
import { TaskNotificationKind } from '../../domain/enums/task-notification-kind.enum';
import { taskNotificationKind } from './task-reminder.scheduler';
import { TaskReminderScheduler } from './task-reminder.scheduler';

describe('taskNotificationKind', () => {
  const now = new Date('2026-08-04T15:00:00.000Z');
  const timezone = 'America/Argentina/Buenos_Aires';

  it.each([
    [
      NotificationFrequency.IMMEDIATE,
      '2026-08-04',
      TaskNotificationKind.REMINDER,
    ],
    [NotificationFrequency.IMMEDIATE, '2026-08-05', null],
    [NotificationFrequency.DAILY, '2026-08-05', TaskNotificationKind.REMINDER],
    [NotificationFrequency.WEEKLY, '2026-08-11', TaskNotificationKind.REMINDER],
    [NotificationFrequency.DAILY, '2026-08-03', TaskNotificationKind.OVERDUE],
    [NotificationFrequency.DISABLED, '2026-08-04', null],
  ])('resolves %s for due date %s', (frequency, dueDate, expected) => {
    expect(
      taskNotificationKind(
        frequency,
        new Date(`${dueDate}T00:00:00.000Z`),
        now,
        timezone,
      ),
    ).toBe(expected);
  });
});

describe('TaskReminderScheduler', () => {
  const timezone = 'America/Argentina/Buenos_Aires';

  it('records a reminder when at least one enabled channel succeeds', async () => {
    const now = new Date('2026-08-04T15:00:00.000Z');
    const dispatcher = { send: jest.fn().mockResolvedValue(true) };
    const recordDelivery = jest.fn();
    const withSchedulerLock = jest.fn(async (action: () => Promise<void>) => {
      await action();
      return true;
    });
    const scheduler = new TaskReminderScheduler(
      {
        findCandidates: jest.fn().mockResolvedValue([
          {
            taskId: 'task-id',
            userId: 'user-id',
            title: 'Task',
            dueDate: new Date('2026-08-04T18:00:00.000Z'),
            recipientEmail: 'user@example.com',
            settings: {
              emailNotifications: true,
              whatsappNotifications: false,
              discordNotifications: true,
              taskNotificationFrequency: NotificationFrequency.IMMEDIATE,
              timezone,
            },
          },
        ]),
        hasDelivery: jest.fn().mockResolvedValue(false),
        recordDelivery,
        withSchedulerLock,
      } as never,
      {
        buildTaskReminder: jest.fn().mockReturnValue({}),
        buildTaskOverdue: jest.fn().mockReturnValue({}),
      } as never,
      dispatcher as never,
    );

    await scheduler.run(now);

    expect(dispatcher.send).toHaveBeenCalledWith('user-id', {});
    expect(recordDelivery).toHaveBeenCalledWith(
      'task-id',
      TaskNotificationKind.REMINDER,
      new Date('2026-08-04T18:00:00.000Z'),
    );
    expect(withSchedulerLock).toHaveBeenCalledTimes(1);
  });
});
