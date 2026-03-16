import { Badge } from "@/components/ui/Badge";

type PaymentStatus = "UNPAID" | "PAID" | "EXPIRED";

export function ListingPaymentBadge({
  paymentStatus,
  paymentExpiresAt,
  isTaken,
}: {
  paymentStatus: PaymentStatus;
  paymentExpiresAt?: Date | null;
  isTaken?: boolean;
}) {
  if (isTaken) {
    return <Badge className="border-none bg-zinc-200 text-zinc-800">Taken / Unlisted</Badge>;
  }

  if (paymentStatus === "PAID" && paymentExpiresAt && paymentExpiresAt >= new Date()) {
    return <Badge className="border-none bg-emerald-100 text-emerald-700">{paymentExpiresAt.toLocaleDateString()}</Badge>;
  }

  if (paymentStatus === "EXPIRED") {
    return <Badge className="border-none bg-rose-100 text-rose-700">Expired - Pay to Relist</Badge>;
  }

  return <Badge className="border-none bg-amber-100 text-amber-700">Payment Required ($14.99)</Badge>;
}
