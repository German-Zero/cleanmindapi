CREATE TYPE "PointTransactionType" AS ENUM (
    'TASK_COMPLETED',
    'POMODORO_COMPLETED',
    'STORE_REDEMPTION',
    'ADMIN_ADJUSTMENT'
);

CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "periodKey" VARCHAR(7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "point_transactions_userId_type_sourceId_key"
ON "point_transactions"("userId", "type", "sourceId");

CREATE INDEX "point_transactions_userId_createdAt_idx"
ON "point_transactions"("userId", "createdAt");

CREATE INDEX "point_transactions_userId_periodKey_type_idx"
ON "point_transactions"("userId", "periodKey", "type");

ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
