import { ListingStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";

const variants: Record<ListingStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-zinc-100 text-zinc-700",
  SOLD: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge className={`border-none ${variants[status]}`}>{status.replace("_", " ")}</Badge>;
}
