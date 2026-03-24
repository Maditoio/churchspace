import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";

const PAGE_SIZE = 12;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const totalPayments = await prisma.listingPayment.count();
  const pagination = getPaginationMeta(totalPayments, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const [payments, aggregateAll, aggregateMonth, payerGroups] = await Promise.all([
    prisma.listingPayment.findMany({
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, email: true, churchName: true } },
      },
      orderBy: { paidAt: "desc" },
      skip: pagination.skip,
      take: PAGE_SIZE,
    }),
    prisma.listingPayment.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.listingPayment.aggregate({
      where: { paidAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.listingPayment.groupBy({ by: ["userId"] }),
  ]);

  const totalRevenue = Number(aggregateAll._sum.amount ?? 0);
  const monthRevenue = Number(aggregateMonth._sum.amount ?? 0);
  const uniquePayers = payerGroups.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl text-foreground">Payments</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Listing payment overview and recent transactions by agent.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatsCard label="Revenue This Month" value={formatCurrency(monthRevenue)} />
        <StatsCard label="Total Payments" value={aggregateAll._count._all} />
        <StatsCard label="Unique Payers" value={uniquePayers} />
      </div>

      <section className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--surface-raised) text-(--text-secondary)">
            <tr>
              <th className="px-4 py-3">Paid At</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-(--border-subtle) align-top">
                <td className="px-4 py-3 text-(--text-secondary)">
                  {new Date(payment.paidAt).toLocaleString("en-ZA")}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{payment.user.name ?? "Unknown"}</p>
                  <p className="text-xs text-(--text-secondary)">{payment.user.email}</p>
                  {payment.user.churchName ? (
                    <p className="text-xs text-(--text-muted)">{payment.user.churchName}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{payment.listing.title}</p>
                  <p className="text-xs text-(--text-secondary)">/{payment.listing.slug}</p>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatCurrency(Number(payment.amount))}
                </td>
                <td className="px-4 py-3 text-(--text-secondary)">{payment.status}</td>
                <td className="px-4 py-3 text-xs text-(--text-secondary)">{payment.reference}</td>
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={6}>
                  No listing payments captured yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <PaginationControls
          basePath="/admin/payments"
          currentPage={pagination.currentPage}
          itemLabel="payments"
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </section>
    </div>
  );
}
