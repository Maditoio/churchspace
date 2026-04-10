"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const REPORT_REASONS = [
  "Incorrect information",
  "Spam or duplicate",
  "Offensive content",
  "Listing no longer available",
  "Other",
];

export function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });
      if (!res.ok) throw new Error("Report failed");
      toast.success("Thank you — your report has been submitted.");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch {
      toast.error("Could not submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-(--text-muted) transition-colors hover:text-(--destructive)"
      >
        <Flag className="h-3.5 w-3.5" />
        Report this listing
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Report Listing">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-(--text-secondary)">
            Please select a reason for reporting this listing.
          </p>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-(--primary)"
                />
                {r}
              </label>
            ))}
          </div>
          <textarea
            placeholder="Additional details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
          />
          <Button type="submit" disabled={!reason || loading} className="w-full">
            {loading ? "Submitting…" : "Submit Report"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
