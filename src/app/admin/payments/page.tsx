import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default async function AdminPaymentsPage() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [payments, aggregateAll, aggregateMonth] = await Promise.all([
    prisma.listingPayment.findMany({
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, email: true, churchName: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 100,
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
  ]);

  const totalRevenue = Number(aggregateAll._sum.amount ?? 0);
  const monthRevenue = Number(aggregateMonth._sum.amount ?? 0);
  const uniquePayers = new Set(payments.map((payment) => payment.user.email)).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Payments</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Listing payment overview and recent transactions by agent.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
        <StatsCard label="Revenue This Month" value={formatCurrency(monthRevenue)} />
        <StatsCard label="Total Payments" value={aggregateAll._count._all} />
        <StatsCard label="Unique Payers" value={uniquePayers} />
      </div>

      <section className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-raised)] text-[var(--text-secondary)]">
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
              <tr key={payment.id} className="border-t border-[var(--border-subtle)] align-top">
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {new Date(payment.paidAt).toLocaleString("en-ZA")}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--text-primary)]">{payment.user.name ?? "Unknown"}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{payment.user.email}</p>
                  {payment.user.churchName ? (
                    <p className="text-xs text-[var(--text-muted)]">{payment.user.churchName}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--text-primary)]">{payment.listing.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">/{payment.listing.slug}</p>
                </td>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                  {formatCurrency(Number(payment.amount))}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{payment.status}</td>
                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{payment.reference}</td>
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[var(--text-secondary)]" colSpan={6}>
                  No listing payments captured yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
