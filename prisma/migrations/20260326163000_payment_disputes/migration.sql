CREATE TYPE "PaymentDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'WAITING_FOR_USER', 'RESOLVED', 'REJECTED');

CREATE TABLE "PaymentDispute" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "subject" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "PaymentDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentDispute_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentDispute_paymentId_createdAt_idx" ON "PaymentDispute"("paymentId", "createdAt");
CREATE INDEX "PaymentDispute_userId_createdAt_idx" ON "PaymentDispute"("userId", "createdAt");
CREATE INDEX "PaymentDispute_status_createdAt_idx" ON "PaymentDispute"("status", "createdAt");

ALTER TABLE "PaymentDispute" ADD CONSTRAINT "PaymentDispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "ListingPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentDispute" ADD CONSTRAINT "PaymentDispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentDispute" ADD CONSTRAINT "PaymentDispute_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;