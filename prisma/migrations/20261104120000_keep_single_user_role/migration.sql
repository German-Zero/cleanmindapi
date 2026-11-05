BEGIN;

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TYPE "UserRole" RENAME TO "UserRole_previous";
CREATE TYPE "UserRole" AS ENUM ('USER');

-- Preserve every account and normalize its role to the only supported value.
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "UserRole" USING ('USER'::"UserRole");

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "UserRole_previous";

COMMIT;
