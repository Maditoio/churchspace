"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { isActivePaymentDisputeStatus } from "@/lib/payment-disputes";

type PaymentDisputeButtonProps = {
  paymentId: string;
  latestDisputeStatus?: string | null;
};

export function PaymentDisputeButton({ paymentId, latestDisputeStatus }: PaymentDisputeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const activeDispute = isActivePaymentDisputeStatus(latestDisputeStatus);

  async function submitDispute() {
    setLoading(true);
    const response = await fetch(`/api/payments/${paymentId}/disputes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, details }),
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Could not file dispute");
      return;
    }

    toast.success("Dispute logged. We have notified you and the admin team.");
    setOpen(false);
    setSubject("");
    setDetails("");
    router.refresh();
  }

  return (
    <>
      <Button variant="secondary" className="h-10 min-w-0 px-4" disabled={activeDispute} onClick={() => setOpen(true)}>
        {activeDispute ? "Dispute Open" : "File Dispute"}
      </Button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Log Payment Dispute">
        <div className="space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Tell the team what is wrong with this payment or transaction. This creates a tracked dispute in your dashboard.
          </p>
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Short summary of the issue" maxLength={120} />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Describe the payment issue, what happened, and what outcome you expect."
            className="min-h-36 w-full rounded-[8px] border border-(--border) bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent)"
            maxLength={2000}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-10 min-w-0 px-4" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button
              variant="accent"
              className="h-10 min-w-0 px-4"
              onClick={submitDispute}
              disabled={loading || subject.trim().length < 5 || details.trim().length < 20}
            >
              {loading ? "Submitting..." : "Submit Dispute"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}