"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

type QueueRow = { id: string; title: string; createdAt: Date; agent: { name: string | null }; listingType: string[] };

export function ApprovalQueue({ listings }: { listings: QueueRow[] }) {
  const router = useRouter();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove(id: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setLoading(false);
    if (res.ok) { toast.success("Listing approved"); router.refresh(); }
    else toast.error("Failed to approve listing");
  }

  async function handleReject() {
    if (!rejectId) return;
    setLoading(true);
    const res = await fetch(`/api/admin/listings/${rejectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", rejectionReason: reason }),
    });
    setLoading(false);
    if (res.ok) { toast.success("Listing rejected"); setRejectId(null); setReason(""); router.refresh(); }
    else toast.error("Failed to reject listing");
  }

  if (!listings.length) {
    return <p className="text-sm text-[var(--text-secondary)]">No listings pending review. All clear!</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--surface-raised) text-(--text-secondary)">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-(--border-subtle)">
                <td className="px-4 py-3 font-medium">{listing.title}</td>
                <td className="px-4 py-3">{listing.agent.name ?? "-"}</td>
                <td className="px-4 py-3">{listing.listingType.join(", ")}</td>
                <td className="px-4 py-3">{new Date(listing.createdAt).toDateString()}</td>
                <td className="flex items-center gap-2 px-4 py-3">
                  <Button className="h-9 min-w-0 px-3" variant="accent" disabled={loading} onClick={() => handleApprove(listing.id)}>Approve</Button>
                  <Button className="h-9 min-w-0 px-3" variant="danger" disabled={loading} onClick={() => setRejectId(listing.id)}>Reject</Button>
                  <Link href={`/admin/listings/${listing.id}`} className="text-xs text-[var(--primary)] underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!rejectId} onClose={() => { setRejectId(null); setReason(""); }} title="Reject Listing">
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">Please provide a reason that will be sent to the agent.</p>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setRejectId(null); setReason(""); }}>Cancel</Button>
            <Button variant="danger" disabled={!reason.trim() || loading} onClick={handleReject}>Confirm Reject</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
