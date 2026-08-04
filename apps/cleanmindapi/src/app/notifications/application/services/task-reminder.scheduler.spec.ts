import { NotificationFrequency, TaskNotificationKind } from '@prisma/client';
import { taskNotificationKind } from './task-reminder.scheduler';

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
