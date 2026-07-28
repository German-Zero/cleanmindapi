ALTER TABLE "pomodoro_sessions"
ADD COLUMN "pausedAt" TIMESTAMP(3),
ADD COLUMN "accumulatedPausedSeconds" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "whiteboards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 3,
    "elements" JSONB NOT NULL,
    "backgroundImage" TEXT,
    "savedColors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whiteboards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "whiteboards_userId_key"
ON "whiteboards"("userId");

ALTER TABLE "whiteboards"
ADD CONSTRAINT "whiteboards_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
