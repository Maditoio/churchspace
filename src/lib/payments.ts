export const LISTING_PAYMENT_AMOUNT_USD = 14.99;

export function addOneYear(date: Date) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function isPaymentActive(args: { paymentStatus?: "UNPAID" | "PAID" | "EXPIRED"; paymentExpiresAt?: Date | null; isTaken?: boolean }) {
  if (args.isTaken) return false;
  if (args.paymentStatus !== "PAID") return false;
  if (!args.paymentExpiresAt) return false;
  return args.paymentExpiresAt >= new Date();
}
