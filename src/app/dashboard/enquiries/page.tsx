"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Enquiry = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  message: string;
  isRead: boolean;
  listing: { title: string };
};

export default function DashboardEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries")
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/enquiries");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const items = Array.isArray(data) ? data : Array.isArray(data?.enquiries) ? data.enquiries : [];
        setEnquiries(items);
      })
      .catch(() => toast.error("Could not load enquiries"))
      .finally(() => setLoading(false));
  }, [router]);

  async function markRead(id: string) {
    const res = await fetch(`/api/enquiries/${id}/read`, { method: "PATCH" });
    if (res.ok) {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, isRead: true } : e)));
    } else if (res.status === 401) {
      router.replace("/signin?callbackUrl=/dashboard/enquiries");
    } else {
      toast.error("Could not update enquiry");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">Enquiries</h1>
      {loading ? (
        <p className="text-sm text-(--text-secondary)">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-(--surface-raised)">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-(--text-secondary)">No enquiries yet.</td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-t border-(--border-subtle)">
                    <td className="px-4 py-3">{enquiry.listing.title}</td>
                    <td className="px-4 py-3">{enquiry.senderName}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs">
                        <a className="block text-(--primary) underline hover:no-underline" href={`mailto:${enquiry.senderEmail}`}>{enquiry.senderEmail}</a>
                        {enquiry.senderPhone ? (
                          <a className="block text-(--primary) underline hover:no-underline" href={`tel:${enquiry.senderPhone}`}>{enquiry.senderPhone}</a>
                        ) : (
                          <span className="text-(--text-secondary)">No phone</span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3">{enquiry.message}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${enquiry.isRead ? "bg-gray-100 text-gray-600" : "bg-(--accent-light) text-(--primary) font-semibold"}`}>
                        {enquiry.isRead ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!enquiry.isRead && (
                        <button
                          onClick={() => markRead(enquiry.id)}
                          className="text-xs text-(--primary) underline hover:no-underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
