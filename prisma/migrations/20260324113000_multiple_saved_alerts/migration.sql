-- AlterTable
ALTER TABLE "UserSearchPreference" ADD COLUMN "fingerprint" TEXT;

-- Backfill fingerprint for existing single-alert records.
UPDATE "UserSearchPreference"
SET "fingerprint" = md5(
    concat_ws(
        '|',
        COALESCE(lower(trim("query")), ''),
        COALESCE(lower(trim("city")), ''),
        COALESCE(lower(trim("suburb")), ''),
        COALESCE("propertyType"::text, ''),
        COALESCE("listingType"::text, '')
    )
)
WHERE "fingerprint" IS NULL;

-- AlterTable
ALTER TABLE "UserSearchPreference" ALTER COLUMN "fingerprint" SET NOT NULL;

-- DropIndex
DROP INDEX "UserSearchPreference_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserSearchPreference_userId_fingerprint_key" ON "UserSearchPreference"("userId", "fingerprint");
