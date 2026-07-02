/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `users` table. All the data in the column will be lost.
  - Made the column `passwordHash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "provider",
DROP COLUMN "providerId",
ALTER COLUMN "passwordHash" SET NOT NULL;

-- DropEnum
DROP TYPE "AuthProvider";
