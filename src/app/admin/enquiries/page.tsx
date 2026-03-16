import { prisma } from "@/lib/prisma";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({ include: { listing: true }, orderBy: { createdAt: "desc" }, take: 120 });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">All Platform Enquiries</h1>
      <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-raised)]">
            <tr><th className="px-4 py-3">Listing</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Message</th></tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-3">{enquiry.listing.title}</td>
                <td className="px-4 py-3">{enquiry.senderName}</td>
                <td className="px-4 py-3">{enquiry.senderEmail}</td>
                <td className="px-4 py-3">{enquiry.senderPhone ?? "-"}</td>
                <td className="px-4 py-3">{enquiry.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
