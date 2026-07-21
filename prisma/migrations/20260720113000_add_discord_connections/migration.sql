-- CreateTable
CREATE TABLE "discord_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "globalName" TEXT,
    "avatarHash" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_oauth_states" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_connections_userId_key" ON "discord_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_connections_discordUserId_key" ON "discord_connections"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_oauth_states_tokenHash_key" ON "discord_oauth_states"("tokenHash");

-- CreateIndex
CREATE INDEX "discord_oauth_states_userId_idx" ON "discord_oauth_states"("userId");

-- AddForeignKey
ALTER TABLE "discord_connections" ADD CONSTRAINT "discord_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_oauth_states" ADD CONSTRAINT "discord_oauth_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
