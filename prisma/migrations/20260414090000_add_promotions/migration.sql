-- Create enums for promotions
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_LISTING');
CREATE TYPE "PromotionUsagePaymentStatus" AS ENUM ('PAID', 'FREE_VIA_PROMO', 'PARTIAL_PAID');

-- Create promotions table
CREATE TABLE "Promotion" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "codeNormalized" TEXT NOT NULL,
  "description" TEXT,
  "type" "PromotionType" NOT NULL,
  "discountValue" DECIMAL(10,2) NOT NULL,
  "maxUses" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "maxFreeListings" INTEGER,
  "freeListingsUsed" INTEGER NOT NULL DEFAULT 0,
  "maxUsesPerUser" INTEGER,
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- Create promotion usage audit table
CREATE TABLE "PromotionUsage" (
  "id" TEXT NOT NULL,
  "promotionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "paymentReference" TEXT,
  "originalPrice" DECIMAL(10,2) NOT NULL,
  "discountApplied" DECIMAL(10,2) NOT NULL,
  "finalPrice" DECIMAL(10,2) NOT NULL,
  "paymentStatus" "PromotionUsagePaymentStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromotionUsage_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "Promotion_name_key" ON "Promotion"("name");
CREATE UNIQUE INDEX "Promotion_codeNormalized_key" ON "Promotion"("codeNormalized");
CREATE UNIQUE INDEX "PromotionUsage_paymentReference_key" ON "PromotionUsage"("paymentReference");

-- Search/reporting indexes
CREATE INDEX "Promotion_isActive_validFrom_validUntil_idx" ON "Promotion"("isActive", "validFrom", "validUntil");
CREATE INDEX "PromotionUsage_promotionId_createdAt_idx" ON "PromotionUsage"("promotionId", "createdAt");
CREATE INDEX "PromotionUsage_userId_createdAt_idx" ON "PromotionUsage"("userId", "createdAt");
CREATE INDEX "PromotionUsage_listingId_createdAt_idx" ON "PromotionUsage"("listingId", "createdAt");

-- Foreign keys
ALTER TABLE "PromotionUsage"
  ADD CONSTRAINT "PromotionUsage_promotionId_fkey"
  FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromotionUsage"
  ADD CONSTRAINT "PromotionUsage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromotionUsage"
  ADD CONSTRAINT "PromotionUsage_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
