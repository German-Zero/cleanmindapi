ALTER TABLE "user_settings"
ADD COLUMN "equippedStoreItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
