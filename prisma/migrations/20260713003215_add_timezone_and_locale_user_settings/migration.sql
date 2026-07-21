/*
  Warnings:

  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- DropTable
DROP TABLE "UserSettings";

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'LUNAR_MIND',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "whatsappNotifications" BOOLEAN NOT NULL DEFAULT false,
    "discordNotifications" BOOLEAN NOT NULL DEFAULT false,
    "taskNotificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'DAILY',
    "motivationalMessages" BOOLEAN NOT NULL DEFAULT true,
    "motivationFrequency" "MotivationFrequency" NOT NULL DEFAULT 'DAILY',
    "locale" TEXT NOT NULL DEFAULT 'es-AR',
    "timezone" TEXT NOT NULL DEFAULT 'America/Argentina/Cordoba',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
