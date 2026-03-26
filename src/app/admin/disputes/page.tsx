import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { PaymentDisputeStatusBadge } from "@/components/payments/PaymentDisputeStatusBadge";
import { AdminDisputeActions } from "@/components/admin/AdminDisputeActions";

const PAGE_SIZE = 12;

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const totalDisputes = await prisma.paymentDispute.count();
  const pagination = getPaginationMeta(totalDisputes, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const [openCount, reviewCount, closedCount, disputes] = await Promise.all([
    prisma.paymentDispute.count({ where: { status: "OPEN" } }),
    prisma.paymentDispute.count({ where: { status: { in: ["UNDER_REVIEW", "WAITING_FOR_USER"] } } }),
    prisma.paymentDispute.count({ where: { status: { in: ["RESOLVED", "REJECTED"] } } }),
    prisma.paymentDispute.findMany({
      include: {
        user: { select: { name: true, email: true } },
        payment: { include: { listing: { select: { title: true, slug: true } } } },
        assignee: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: PAGE_SIZE,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl text-foreground">Payment Disputes</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Manage the full dispute lifecycle for payment and transaction issues.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Open Disputes" value={openCount} />
        <StatsCard label="In Review" value={reviewCount} />
        <StatsCard label="Closed Disputes" value={closedCount} />
      </div>

      <section className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--surface-raised) text-(--text-secondary)">
            <tr>
              <th className="px-4 py-3">Opened</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="border-t border-(--border-subtle) align-top">
                <td className="px-4 py-3 text-(--text-secondary)">{new Date(dispute.createdAt).toLocaleString("en-ZA")}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{dispute.user.name ?? "Unknown"}</p>
                  <p className="text-xs text-(--text-secondary)">{dispute.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{dispute.payment.reference}</p>
                  <p className="text-xs text-(--text-secondary)">{dispute.payment.listing.title}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{dispute.subject}</p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-(--text-secondary)">{dispute.details}</p>
                  {dispute.adminNotes ? <p className="mt-2 text-xs text-(--text-muted)">Note: {dispute.adminNotes}</p> : null}
                </td>
                <td className="px-4 py-3"><PaymentDisputeStatusBadge status={dispute.status} /></td>
                <td className="px-4 py-3 text-(--text-secondary)">{dispute.assignee?.name ?? "Unassigned"}</td>
                <td className="px-4 py-3"><AdminDisputeActions disputeId={dispute.id} currentStatus={dispute.status} currentAdminNotes={dispute.adminNotes} /></td>
              </tr>
            ))}
            {disputes.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={7}>No payment disputes logged yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <PaginationControls
          basePath="/admin/disputes"
          currentPage={pagination.currentPage}
          itemLabel="disputes"
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </section>
    </div>
  );
}