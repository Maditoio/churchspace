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
  listingFeeLabel,
}: {
  listingId: string;
  isTaken: boolean;
  paymentStatus: PaymentStatus;
  paymentExpiresAt?: Date | null;
  listingFeeLabel: string;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"pay" | "taken" | "delete" | null>(null);

  const hasActivePayment = paymentStatus === "PAID" && !!paymentExpiresAt && new Date(paymentExpiresAt) >= new Date() && !isTaken;

  async function pay() {
    setLoadingAction("pay");
    const res = await fetch(`/api/listings/${listingId}/payment`, { method: "POST" });
    const payload = await res.json().catch(() => null);
    setLoadingAction(null);

    if (res.ok && payload?.authorizationUrl) {
      window.location.href = payload.authorizationUrl;
    } else {
      toast.error(payload?.error ?? "Could not process payment");
    }
  }

  async function markTaken() {
    setLoadingAction("taken");
    const res = await fetch(`/api/listings/${listingId}/taken`, { method: "PATCH" });
    setLoadingAction(null);

    if (res.ok) {
      toast.success("Listing marked as taken and unlisted.");
      router.refresh();
    } else {
      const payload = await res.json().catch(() => null);
      toast.error(payload?.error ?? "Could not update listing");
    }
  }

  async function deleteListing() {
    const confirmed = window.confirm("Delete this listing permanently? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setLoadingAction("delete");
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not delete listing");
      }

      toast.success("Listing deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete listing");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasActivePayment ? (
        <>
          <Button type="button" variant="secondary" className="h-9 min-w-0 px-3 text-xs" disabled={loadingAction !== null} onClick={markTaken}>
            {loadingAction === "taken" ? "Updating..." : "Mark Taken"}
          </Button>
          <Button type="button" variant="ghost" className="h-9 min-w-0 border border-(--border) px-3 text-xs text-(--text-secondary)" disabled={loadingAction !== null} onClick={deleteListing}>
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="accent" className="h-9 min-w-0 px-3 text-xs" disabled={loadingAction !== null} onClick={pay}>
            {loadingAction === "pay" ? "Redirecting..." : isTaken ? `Pay ${listingFeeLabel} to Relist` : `Pay ${listingFeeLabel}`}
          </Button>
          <Button type="button" variant="ghost" className="h-9 min-w-0 border border-(--border) px-3 text-xs text-(--text-secondary)" disabled={loadingAction !== null} onClick={deleteListing}>
            {loadingAction === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </>
      )}
    </div>
  );
}
