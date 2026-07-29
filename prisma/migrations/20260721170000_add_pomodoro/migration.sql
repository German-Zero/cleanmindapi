-- CreateEnum
CREATE TYPE "PomodoroSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INTERRUPTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PomodoroBreakType" AS ENUM ('SHORT', 'LONG');

-- CreateTable
CREATE TABLE "pomodoro_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "focusMinutes" INTEGER NOT NULL DEFAULT 25,
    "shortBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "longBreakMinutes" INTEGER NOT NULL DEFAULT 15,
    "sessionsBeforeLongBreak" INTEGER NOT NULL DEFAULT 4,
    "autoStartBreak" BOOLEAN NOT NULL DEFAULT false,
    "dailyGoalMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pomodoro_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pomodoro_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "status" "PomodoroSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "breakType" "PomodoroBreakType" NOT NULL DEFAULT 'SHORT',
    "plannedFocusSeconds" INTEGER NOT NULL,
    "plannedBreakSeconds" INTEGER NOT NULL,
    "actualFocusSeconds" INTEGER NOT NULL DEFAULT 0,
    "actualBreakSeconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pomodoro_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pomodoro_settings_userId_key" ON "pomodoro_settings"("userId");

-- CreateIndex
CREATE INDEX "pomodoro_sessions_userId_startedAt_idx" ON "pomodoro_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "pomodoro_sessions_taskId_idx" ON "pomodoro_sessions"("taskId");

-- A user can only have one active timer, including concurrent requests.
CREATE UNIQUE INDEX "pomodoro_sessions_one_active_per_user"
ON "pomodoro_sessions"("userId")
WHERE "status" = 'ACTIVE';

-- AddForeignKey
ALTER TABLE "pomodoro_settings" ADD CONSTRAINT "pomodoro_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pomodoro_sessions" ADD CONSTRAINT "pomodoro_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
