import { TaskNotificationKind } from '../enums/task-notification-kind.enum';
import { TaskReminderCandidate } from '../models/task-reminder.model';

export abstract class TaskReminderRepository {
  abstract findCandidates(through: Date): Promise<TaskReminderCandidate[]>;
  abstract recordDelivery( taskId: string, kind: TaskNotificationKind, dueDate: Date, ): Promise<void>;
  abstract hasDelivery( taskId: string, kind: TaskNotificationKind, dueDate: Date, ): Promise<boolean>;
  abstract withSchedulerLock(action: () => Promise<void>): Promise<boolean>;
}
