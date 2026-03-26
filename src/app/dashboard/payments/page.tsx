import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/Button";
import { PaymentDisputeButton } from "@/components/payments/PaymentDisputeButton";
import { PaymentDisputeStatusBadge } from "@/components/payments/PaymentDisputeStatusBadge";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { activePaymentDisputeStatuses } from "@/lib/payment-disputes";
import { prisma } from "@/lib/prisma";
import { formatPaymentCurrency, getListingPaymentAmount, LISTING_PAYMENT_CURRENCY } from "@/lib/payments";

const PAGE_SIZE = 12;

export default async function DashboardPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; payment?: string; reference?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/payments");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const isAdmin = session.user.role === "SUPER_ADMIN";
  const listingPaymentAmount = await getListingPaymentAmount();

  const where = isAdmin ? {} : { userId: session.user.id };

  const totalPayments = await prisma.listingPayment.count({ where });
  const pagination = getPaginationMeta(totalPayments, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const [payments, aggregate, disputeCount] = await Promise.all([
    prisma.listingPayment.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, slug: true } },
        user: { select: { name: true, email: true } },
        disputes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, status: true, createdAt: true },
        },
      },
      orderBy: { paidAt: "desc" },
      skip: pagination.skip,
      take: PAGE_SIZE,
    }),
    prisma.listingPayment.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.paymentDispute.count({
      where: isAdmin
        ? { status: { in: activePaymentDisputeStatuses } }
        : { userId: session.user.id, status: { in: activePaymentDisputeStatuses } },
    }),
  ]);

  const totalSpent = Number(aggregate._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Payment History</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {isAdmin
            ? "Recent listing payments across all agents."
            : "Historical listing payments made for your listings."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={isAdmin ? "/admin/disputes" : "/dashboard/disputes"}><Button variant="secondary">{isAdmin ? "Manage Disputes" : "View My Disputes"}</Button></Link>
      </div>

      {resolvedSearchParams?.payment === "success" ? (
        <div className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Payment completed successfully{resolvedSearchParams.reference ? ` for reference ${resolvedSearchParams.reference}.` : "."}
        </div>
      ) : null}

      {resolvedSearchParams?.payment === "failed" ? (
        <div className="rounded-[var(--radius)] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          Payment could not be verified{resolvedSearchParams.reference ? ` for reference ${resolvedSearchParams.reference}.` : "."}
        </div>
      ) : null}

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-4 text-sm text-[var(--text-secondary)]">
        <p>
          Listing fee is <strong>{formatPaymentCurrency(listingPaymentAmount)}</strong> per listing.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] bg-[var(--surface-raised)] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Total Payments</p>
            <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{aggregate._count._all}</p>
          </div>
          <div className="rounded-[10px] bg-[var(--surface-raised)] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Total Amount</p>
            <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{formatPaymentCurrency(totalSpent, LISTING_PAYMENT_CURRENCY)}</p>
          </div>
          <div className="rounded-[10px] bg-[var(--surface-raised)] px-3 py-2 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Active Disputes</p>
            <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{disputeCount}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-raised)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Paid At</th>
              {isAdmin ? <th className="px-4 py-3">Agent</th> : null}
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dispute</th>
              {!isAdmin ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t border-[var(--border-subtle)]">
                <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(payment.paidAt).toLocaleString("en-ZA")}</td>
                {isAdmin ? (
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-primary)]">{payment.user.name ?? "Unknown"}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{payment.user.email}</p>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--text-primary)]">{payment.listing.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">/{payment.listing.slug}</p>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{payment.reference}</td>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{formatPaymentCurrency(Number(payment.amount), payment.currency)}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{new Date(payment.expiresAt).toLocaleDateString("en-ZA")}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{payment.status}</td>
                <td className="px-4 py-3">
                  {payment.disputes[0] ? <PaymentDisputeStatusBadge status={payment.disputes[0].status} /> : <span className="text-xs text-[var(--text-secondary)]">None</span>}
                </td>
                {!isAdmin ? (
                  <td className="px-4 py-3">
                    <PaymentDisputeButton paymentId={payment.id} latestDisputeStatus={payment.disputes[0]?.status} />
                  </td>
                ) : null}
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[var(--text-secondary)]" colSpan={isAdmin ? 7 : 8}>
                  No historical payments yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <PaginationControls
          basePath="/dashboard/payments"
          currentPage={pagination.currentPage}
          itemLabel="payments"
          pageSize={pagination.pageSize}
          query={{
            payment: resolvedSearchParams?.payment,
            reference: resolvedSearchParams?.reference,
          }}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    </div>
  );
}
