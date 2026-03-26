import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { paymentDisputeStatusLabels, type PaymentDisputeStatusValue } from "@/lib/payment-disputes";

export function PaymentDisputeStatusBadge({ status }: { status: PaymentDisputeStatusValue }) {
  const className = {
    OPEN: "border-amber-200 bg-amber-50 text-amber-800",
    UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-800",
    WAITING_FOR_USER: "border-violet-200 bg-violet-50 text-violet-800",
    RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  } satisfies Record<PaymentDisputeStatusValue, string>;

  return <Badge className={cn(className[status])}>{paymentDisputeStatusLabels[status]}</Badge>;
}