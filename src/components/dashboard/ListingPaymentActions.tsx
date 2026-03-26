"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, ImageIcon, MoreHorizontal, PencilLine, Trash2 } from "lucide-react";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"pay" | "taken" | "delete" | null>(null);

  const hasActivePayment = paymentStatus === "PAID" && !!paymentExpiresAt && new Date(paymentExpiresAt) >= new Date() && !isTaken;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function pay() {
    setOpen(false);
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
    setOpen(false);
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
    setOpen(false);
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
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Listing actions"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary) shadow-(--shadow-sm) transition-colors hover:bg-(--primary-soft) hover:text-(--primary)"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-30 w-56 rounded-[18px] border border-(--border) bg-white p-1.5 shadow-(--shadow-lg)">
          <nav className="flex flex-col gap-1">
            <Link
              href={`/dashboard/listings/${listingId}/edit`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-(--primary-soft) hover:text-(--primary)"
            >
              <PencilLine className="h-4 w-4" />
              <span>Edit Listing</span>
            </Link>
            <Link
              href={`/dashboard/listings/${listingId}/photos`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-(--primary-soft) hover:text-(--primary)"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Manage Photos</span>
            </Link>
            {hasActivePayment ? (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={markTaken}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-(--primary-soft) hover:text-(--primary) disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{loadingAction === "taken" ? "Updating..." : "Mark as Taken"}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={pay}
                className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-(--primary-soft) hover:text-(--primary) disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                <span>{loadingAction === "pay" ? "Redirecting..." : isTaken ? `Pay ${listingFeeLabel} to Relist` : `Pay ${listingFeeLabel}`}</span>
              </button>
            )}
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={deleteListing}
              className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm text-(--destructive) transition-colors hover:bg-[rgba(190,58,44,0.08)] disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              <span>{loadingAction === "delete" ? "Deleting..." : "Delete Listing"}</span>
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
