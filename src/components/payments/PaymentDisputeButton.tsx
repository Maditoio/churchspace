"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info } from "lucide-react";
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
  const [infoOpen, setInfoOpen] = useState(false);
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
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="inline-flex items-center gap-1 text-sm text-(--text-secondary) hover:text-(--primary)"
            >
              <Info className="h-4 w-4" />
              <span>More info</span>
            </button>
          </div>
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Issue summary" maxLength={120} />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="What happened and what you expect"
            className="min-h-36 w-full rounded-lg border border-(--border) bg-white px-3 py-3 text-sm text-foreground outline-none placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent)"
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

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="Dispute Info">
        <div className="space-y-3 text-sm text-(--text-secondary)">
          <p>Use a short summary and clear details so we can review quickly.</p>
          <p>Include payment reference, timeline, and expected resolution.</p>
          <p>Only one active dispute is allowed per payment.</p>
          <p>Disputes must be raised within 7 days of payment.</p>
          <div className="flex justify-end pt-2">
            <Button variant="accent" className="h-10 min-w-0 px-4" onClick={() => setInfoOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}