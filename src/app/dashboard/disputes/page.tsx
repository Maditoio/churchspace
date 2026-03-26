import Link from "next/link";
import { redirect } from "next/navigation";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/Button";
import { PaymentDisputeButton } from "@/components/payments/PaymentDisputeButton";
import { PaymentDisputeStatusBadge } from "@/components/payments/PaymentDisputeStatusBadge";
import { auth } from "@/lib/auth";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { type PaymentDisputeStatusValue } from "@/lib/payment-disputes";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export default async function DashboardDisputesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/disputes");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const where = { userId: session.user.id };
  const totalDisputes = await prisma.paymentDispute.count({ where });
  const pagination = getPaginationMeta(totalDisputes, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const disputes = await prisma.paymentDispute.findMany({
    where,
    include: {
      payment: {
        include: {
          listing: { select: { title: true, slug: true } },
        },
      },
      assignee: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  const recentPayments = await prisma.listingPayment.findMany({
    where,
    include: {
      listing: { select: { title: true, slug: true } },
      disputes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
    orderBy: { paidAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl text-foreground">My Payment Disputes</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Track every payment dispute you have filed and review updates from the admin team.
          </p>
        </div>
        <Link href="/dashboard/payments"><Button variant="secondary">Back to Payments</Button></Link>
      </div>

      <section className="rounded-(--radius) border border-(--border) bg-white p-5 shadow-(--shadow-sm)">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Start a New Dispute</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Choose a payment and submit a dispute directly from this page.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {recentPayments.length ? (
            recentPayments.map((payment) => (
              <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--surface-raised) px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{payment.listing.title}</p>
                  <p className="text-xs text-(--text-secondary)">{payment.reference}</p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.disputes[0] ? <PaymentDisputeStatusBadge status={payment.disputes[0].status as PaymentDisputeStatusValue} /> : null}
                  <PaymentDisputeButton paymentId={payment.id} latestDisputeStatus={payment.disputes[0]?.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-(--border-subtle) bg-(--surface-raised) px-4 py-3 text-sm text-(--text-secondary)">
              You do not have any payment transactions yet.
            </p>
          )}
        </div>
      </section>

      <div className="space-y-4">
        {disputes.length ? (
          disputes.map((dispute) => (
            <article key={dispute.id} className="rounded-(--radius) border border-(--border) bg-white p-5 shadow-(--shadow-sm)">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{dispute.subject}</h2>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    {dispute.payment.listing.title} · {dispute.payment.reference}
                  </p>
                </div>
                <PaymentDisputeStatusBadge status={dispute.status as PaymentDisputeStatusValue} />
              </div>
              <p className="mt-4 text-sm leading-6 text-(--text-secondary)">{dispute.details}</p>
              {dispute.adminNotes ? (
                <div className="mt-4 rounded-xl border border-(--border-subtle) bg-(--surface-raised) p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-muted)">Admin Note</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{dispute.adminNotes}</p>
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-(--text-secondary)">
                <span>Opened {new Date(dispute.createdAt).toLocaleString("en-ZA")}</span>
                <span>Last updated {new Date(dispute.updatedAt).toLocaleString("en-ZA")}</span>
                <span>
                  {dispute.assignee?.name ? `Managed by ${dispute.assignee.name}` : "Awaiting assignment"}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-(--radius) border border-(--border) bg-white p-8 text-center text-sm text-(--text-secondary)">
            No payment disputes yet.
          </div>
        )}
      </div>

      <PaginationControls
        basePath="/dashboard/disputes"
        currentPage={pagination.currentPage}
        itemLabel="disputes"
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}