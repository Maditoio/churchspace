import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { activePaymentDisputeStatuses } from "@/lib/payment-disputes";
import { PaymentDisputeStatusBadge } from "@/components/payments/PaymentDisputeStatusBadge";
import { formatPaymentCurrency, LISTING_PAYMENT_CURRENCY } from "@/lib/payments";

const PAGE_SIZE = 12;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const totalPayments = await prisma.listingPayment.count();
  const pagination = getPaginationMeta(totalPayments, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const [payments, aggregateAll, aggregateMonth, payerGroups, activeDisputes, promoAggregate, freeViaPromoCount] = await Promise.all([
    prisma.listingPayment.findMany({
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, email: true, churchName: true } },
        disputes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true },
        },
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
    prisma.paymentDispute.count({ where: { status: { in: activePaymentDisputeStatuses } } }),
    prisma.promotionUsage.aggregate({
      _sum: { discountApplied: true },
      _count: { _all: true },
    }),
    prisma.promotionUsage.count({ where: { paymentStatus: "FREE_VIA_PROMO" } }),
  ]);

  const totalRevenue = Number(aggregateAll._sum.amount ?? 0);
  const monthRevenue = Number(aggregateMonth._sum.amount ?? 0);
  const uniquePayers = payerGroups.length;
  const promoDiscountTotal = Number(promoAggregate._sum.discountApplied ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl text-foreground">Payments</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Listing payment overview and recent transactions by agent.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/disputes"><Button variant="secondary">Manage Disputes</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <StatsCard label="Total Revenue" value={formatPaymentCurrency(totalRevenue, LISTING_PAYMENT_CURRENCY)} />
        <StatsCard label="Revenue This Month" value={formatPaymentCurrency(monthRevenue, LISTING_PAYMENT_CURRENCY)} />
        <StatsCard label="Total Payments" value={aggregateAll._count._all} />
        <StatsCard label="Unique Payers" value={uniquePayers} />
        <StatsCard label="Active Disputes" value={activeDisputes} />
        <StatsCard label="Promo Discounts" value={formatPaymentCurrency(promoDiscountTotal, LISTING_PAYMENT_CURRENCY)} />
        <StatsCard label="Free Via Promo" value={freeViaPromoCount} />
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
              <th className="px-4 py-3">Dispute</th>
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
                  {formatPaymentCurrency(Number(payment.amount), payment.currency)}
                </td>
                <td className="px-4 py-3 text-(--text-secondary)">{payment.status}</td>
                <td className="px-4 py-3">
                  {payment.disputes[0] ? <PaymentDisputeStatusBadge status={payment.disputes[0].status} /> : <span className="text-xs text-(--text-secondary)">None</span>}
                </td>
                <td className="px-4 py-3 text-xs text-(--text-secondary)">
                  {(() => {
                    const ref = payment.reference ?? "";
                    const parts = ref.split("-");
                    return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : ref;
                  })()}
                </td>
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={7}>
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
