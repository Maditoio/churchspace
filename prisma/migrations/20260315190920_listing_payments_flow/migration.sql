-- CreateEnum
CREATE TYPE "ListingPaymentStatus" AS ENUM ('UNPAID', 'PAID', 'EXPIRED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isTaken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentPaidAt" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" "ListingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "takenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ListingPayment" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "status" "ListingPaymentStatus" NOT NULL DEFAULT 'PAID',
    "provider" TEXT NOT NULL DEFAULT 'SIMULATED',
    "reference" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingPayment_reference_key" ON "ListingPayment"("reference");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_idx" ON "ListingPayment"("listingId");

-- CreateIndex
CREATE INDEX "ListingPayment_userId_idx" ON "ListingPayment"("userId");

-- CreateIndex
CREATE INDEX "ListingPayment_status_idx" ON "ListingPayment"("status");

-- AddForeignKey
ALTER TABLE "ListingPayment" ADD CONSTRAINT "ListingPayment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPayment" ADD CONSTRAINT "ListingPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
