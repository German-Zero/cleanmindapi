-- CreateTable
CREATE TABLE "terms_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_terms_acceptances" (
    "userId" TEXT NOT NULL,
    "termsVersionId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_terms_acceptances_pkey" PRIMARY KEY ("userId", "termsVersionId")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "terms_versions_version_key" ON "terms_versions"("version");
CREATE INDEX "terms_versions_effectiveAt_idx" ON "terms_versions"("effectiveAt");
CREATE INDEX "user_terms_acceptances_termsVersionId_idx" ON "user_terms_acceptances"("termsVersionId");

-- AddForeignKey
ALTER TABLE "user_terms_acceptances"
ADD CONSTRAINT "user_terms_acceptances_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_terms_acceptances"
ADD CONSTRAINT "user_terms_acceptances_termsVersionId_fkey"
FOREIGN KEY ("termsVersionId") REFERENCES "terms_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the currently published beta terms.
INSERT INTO "terms_versions" (
    "id",
    "version",
    "title",
    "documentUrl",
    "effectiveAt"
) VALUES (
    '00000000-0000-4000-8000-000000000001',
    'beta-1',
    'Aviso de privacidad y condiciones de participación',
    '/beta',
    TIMESTAMP '2026-07-29 00:00:00'
);

-- Preserve the acceptance already collected from local registrations.
INSERT INTO "user_terms_acceptances" (
    "userId",
    "termsVersionId",
    "acceptedAt"
)
SELECT
    "id",
    '00000000-0000-4000-8000-000000000001',
    "termsAcceptedAt"
FROM "users"
WHERE "termsAcceptedAt" IS NOT NULL;

-- Existing users have already passed their first login.
UPDATE "users"
SET "onboardingCompletedAt" = COALESCE("lastLoginAt", "createdAt")
WHERE "lastLoginAt" IS NOT NULL;

-- The acceptance table is now the only source of truth.
ALTER TABLE "users" DROP COLUMN "termsAcceptedAt";
