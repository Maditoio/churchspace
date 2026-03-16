"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export function AdminListingActions({ listingId, currentStatus }: { listingId: string; currentStatus: string }) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isPending = currentStatus === "PENDING_REVIEW";
  const isActive = currentStatus === "ACTIVE";

  async function handleAction(action: "approve" | "reject", rejectionReason?: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionReason }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(action === "approve" ? "Listing approved and is now live" : "Listing rejected");
      setRejectOpen(false);
      router.refresh();
    } else {
      toast.error("Action failed");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(isPending || !isActive) && (
          <Button variant="accent" disabled={loading} onClick={() => handleAction("approve")}>Approve & Publish</Button>
        )}
        {(isPending || isActive) && (
          <Button variant="danger" disabled={loading} onClick={() => setRejectOpen(true)}>Reject / Suspend</Button>
        )}
      </div>

      <Modal open={rejectOpen} onClose={() => { setRejectOpen(false); setReason(""); }} title="Reject or Suspend Listing">
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Provide a reason that will be sent to the listing agent.</p>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setRejectOpen(false); setReason(""); }}>Cancel</Button>
            <Button variant="danger" disabled={!reason.trim() || loading} onClick={() => handleAction("reject", reason)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
