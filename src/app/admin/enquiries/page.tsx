import { PaginationControls } from "@/components/ui/PaginationControls";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const totalEnquiries = await prisma.enquiry.count();
  const pagination = getPaginationMeta(totalEnquiries, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);
  const enquiries = await prisma.enquiry.findMany({
    include: { listing: true },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">All Platform Enquiries</h1>
      <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--surface-raised)">
            <tr><th className="px-4 py-3">Listing</th><th className="px-4 py-3">Sender</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Message</th></tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={5}>
                  No enquiries found.
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-t border-(--border-subtle)">
                  <td className="px-4 py-3">{enquiry.listing.title}</td>
                  <td className="px-4 py-3">{enquiry.senderName}</td>
                  <td className="px-4 py-3">{enquiry.senderEmail}</td>
                  <td className="px-4 py-3">{enquiry.senderPhone ?? "-"}</td>
                  <td className="px-4 py-3">{enquiry.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls
          basePath="/admin/enquiries"
          currentPage={pagination.currentPage}
          itemLabel="enquiries"
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    </div>
  );
}
