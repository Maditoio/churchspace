"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

type PaymentStatus = "UNPAID" | "PAID" | "EXPIRED";

export function ListingPaymentActions({
  listingId,
  isTaken,
  paymentStatus,
  paymentExpiresAt,
}: {
  listingId: string;
  isTaken: boolean;
  paymentStatus: PaymentStatus;
  paymentExpiresAt?: Date | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const hasActivePayment = paymentStatus === "PAID" && !!paymentExpiresAt && new Date(paymentExpiresAt) >= new Date() && !isTaken;

  async function pay() {
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/payment`, { method: "POST" });
    setLoading(false);

    if (res.ok) {
      toast.success("Payment successful. Listing is now paid for 1 year.");
      router.refresh();
    } else {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Could not process payment");
    }
  }

  async function markTaken() {
    setLoading(true);
    const res = await fetch(`/api/listings/${listingId}/taken`, { method: "PATCH" });
    setLoading(false);

    if (res.ok) {
      toast.success("Listing marked as taken and unlisted.");
      router.refresh();
    } else {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Could not update listing");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasActivePayment ? (
        <Button type="button" variant="secondary" className="h-9 min-w-0 px-3 text-xs" disabled={loading} onClick={markTaken}>
          Mark Taken
        </Button>
      ) : (
        <Button type="button" variant="accent" className="h-9 min-w-0 px-3 text-xs" disabled={loading} onClick={pay}>
          {isTaken ? "Pay $14.99 to Relist" : "Pay $14.99"}
        </Button>
      )}
    </div>
  );
}
