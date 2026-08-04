CREATE TYPE "TaskNotificationKind" AS ENUM ('REMINDER', 'OVERDUE');

CREATE TABLE "task_notification_deliveries" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "kind" "TaskNotificationKind" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_notification_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_notification_deliveries_taskId_kind_dueDate_key"
ON "task_notification_deliveries"("taskId", "kind", "dueDate");

CREATE INDEX "task_notification_deliveries_sentAt_idx"
ON "task_notification_deliveries"("sentAt");

ALTER TABLE "task_notification_deliveries" ADD CONSTRAINT "task_notification_deliveries_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
