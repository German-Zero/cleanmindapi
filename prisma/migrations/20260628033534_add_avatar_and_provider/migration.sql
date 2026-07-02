-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;
