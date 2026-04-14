"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, CreditCard, ImageIcon, MoreHorizontal, PencilLine, Trash2, X } from "lucide-react";

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
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [loadingAction, setLoadingAction] = useState<"pay" | "taken" | "delete" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const hasActivePayment = paymentStatus === "PAID" && !!paymentExpiresAt && new Date(paymentExpiresAt) >= new Date() && !isTaken;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedInsideTrigger = menuRef.current?.contains(event.target as Node);
      const clickedInsidePortal = portalRef.current?.contains(event.target as Node);
      if (!clickedInsideTrigger && !clickedInsidePortal) {
        setOpen(false);
        setConfirmingDelete(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = 224;
      const estimatedMenuHeight = 240;
      const viewportPadding = 12;

      const placeAbove = window.innerHeight - rect.bottom < estimatedMenuHeight && rect.top > estimatedMenuHeight;
      const top = placeAbove
        ? Math.max(viewportPadding, rect.top - estimatedMenuHeight - 8)
        : Math.min(window.innerHeight - viewportPadding, rect.bottom + 8);

      const left = Math.max(
        viewportPadding,
        Math.min(window.innerWidth - menuWidth - viewportPadding, rect.right - menuWidth),
      );

      setMenuPosition({ top, left });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  async function pay() {
    setLoadingAction("pay");
    setOpen(false);
    const res = await fetch(`/api/listings/${listingId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await res.json().catch(() => null);
    setLoadingAction(null);

    if (res.ok && payload?.requiresPromotion && payload?.redirectUrl) {
      router.push(payload.redirectUrl);
      return;
    }

    if (res.ok && payload?.freeApplied) {
      toast.success("Promotion applied. Listing activated without payment.");
      router.push(`/dashboard/payments?payment=success&reference=${encodeURIComponent(payload?.payment?.reference ?? "")}`);
      return;
    }

    if (res.ok && payload?.authorizationUrl) {
      window.location.href = payload.authorizationUrl;
    } else {
      toast.error(payload?.error ?? "Could not process payment");
    }
  }

  async function markTaken() {
    setLoadingAction("taken");
    setOpen(false);
    setConfirmingDelete(false);
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
    setConfirmingDelete(false);
    setLoadingAction("delete");
    setOpen(false);
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not delete listing");
      }

      toast.success("Listing deleted");
      router.refresh();
    } catch (error) {
      setOpen(false);
      toast.error(error instanceof Error ? error.message : "Could not delete listing");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Listing actions"
        aria-expanded={open}
        onClick={() => { setOpen((prev) => !prev); if (open) setConfirmingDelete(false); }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-white text-(--text-secondary) shadow-(--shadow-sm) transition-colors hover:bg-(--primary-soft) hover:text-(--primary)"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        createPortal(
          <div
            ref={portalRef}
            className="fixed z-70 w-56 rounded-[18px] border border-(--border) bg-white p-1.5 shadow-(--shadow-lg)"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          >
            {confirmingDelete ? (
              <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2 text-sm font-medium text-(--destructive)">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Delete permanently?</span>
                </div>
                <p className="text-xs text-(--text-secondary)">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loadingAction !== null}
                    onClick={deleteListing}
                    className="flex-1 rounded-[10px] bg-(--destructive) px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
                  >
                    {loadingAction === "delete" ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="flex items-center justify-center rounded-[10px] border border-(--border) px-2 py-1.5 text-xs text-(--text-secondary) transition-colors hover:bg-(--surface-raised)"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <nav className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto">
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
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-sm text-(--destructive) transition-colors hover:bg-[rgba(190,58,44,0.08)] disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Listing</span>
                </button>
              </nav>
            )}
          </div>,
          document.body,
        )
      ) : null}
    </div>
  );
}
