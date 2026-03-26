"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { paymentDisputeStatusLabels, type PaymentDisputeStatusValue } from "@/lib/payment-disputes";

type AdminDisputeActionsProps = {
  disputeId: string;
  currentStatus: PaymentDisputeStatusValue;
  currentAdminNotes?: string | null;
};

export function AdminDisputeActions({ disputeId, currentStatus, currentAdminNotes }: AdminDisputeActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PaymentDisputeStatusValue>(currentStatus);
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const response = await fetch(`/api/admin/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not update dispute");
      return;
    }

    toast.success("Dispute updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="secondary" className="h-10 min-w-0 px-4" onClick={() => setOpen(true)}>
        Update
      </Button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Manage Dispute">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentDisputeStatusValue)}
              className="h-11 w-full rounded-[8px] border border-(--border) bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--accent)"
            >
              {(Object.keys(paymentDisputeStatusLabels) as PaymentDisputeStatusValue[]).map((value) => (
                <option key={value} value={value}>{paymentDisputeStatusLabels[value]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Add investigation notes, next steps, or the final resolution."
              className="min-h-36 w-full rounded-[8px] border border-(--border) bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent)"
              maxLength={2000}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-10 min-w-0 px-4" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="accent" className="h-10 min-w-0 px-4" onClick={save} disabled={loading}>
              {loading ? "Saving..." : "Save Update"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}