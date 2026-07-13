-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LUNAR_MIND', 'DEEP_SERENITY', 'CALM_TECH');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY', 'DISABLED');

-- CreateEnum
CREATE TYPE "MotivationFrequency" AS ENUM ('DAILY', 'WEEKLY', 'DISABLED');

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'LUNAR_MIND',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
    "discordNotifications" BOOLEAN NOT NULL DEFAULT false,
    "taskNotificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'DAILY',
    "motivationalMessages" BOOLEAN NOT NULL DEFAULT true,
    "motivationFrequency" "MotivationFrequency" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
