import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { ListingPaymentBadge } from "@/components/listings/ListingPaymentBadge";
import { ListingPaymentActions } from "@/components/dashboard/ListingPaymentActions";
import { formatPaymentCurrency, getListingPaymentAmount } from "@/lib/payments";

const PAGE_SIZE = 12;

export default async function DashboardListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/dashboard/listings");
  }

  const isAdmin = session?.user?.role === "SUPER_ADMIN";
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const where = isAdmin ? {} : { agentId: session.user.id };
  const listingPaymentAmount = await getListingPaymentAmount();
  const listingFeeLabel = formatPaymentCurrency(listingPaymentAmount);

  const totalListings = await prisma.listing.count({ where });
  const pagination = getPaginationMeta(totalListings, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);

  const listings = await prisma.listing.findMany({
    where,
    include: { agent: true },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl text-foreground">{isAdmin ? "All Listings" : "My Listings"}</h1>
        <Link href="/dashboard/listings/new" className="rounded-[10px] bg-(--accent) px-4 py-3 text-sm font-medium text-(--primary)">New Listing</Link>
      </div>
      {!isAdmin ? (
        <p className="text-sm text-(--text-secondary)">
          Listing fee is <strong>{listingFeeLabel} per listing</strong>. Payment keeps the listing live for 1 year. Marking a listing as taken unlists it; relisting requires a new payment.
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-(--radius) border border-(--border) bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-(--surface-raised)"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Valid Til</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-(--text-secondary)" colSpan={5}>
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="border-t border-(--border-subtle)">
                  <td className="px-4 py-3">{listing.title}</td>
                  <td className="px-4 py-3">{listing.city}</td>
                  <td className="px-4 py-3"><ListingStatusBadge status={listing.status} /></td>
                  <td className="px-4 py-3">
                    <ListingPaymentBadge
                      paymentStatus={listing.paymentStatus}
                      paymentExpiresAt={listing.paymentExpiresAt}
                      isTaken={listing.isTaken}
                      paymentRequiredLabel={`Payment Required (${listingFeeLabel})`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ListingPaymentActions
                      listingId={listing.id}
                      isTaken={listing.isTaken}
                      paymentStatus={listing.paymentStatus}
                      paymentExpiresAt={listing.paymentExpiresAt}
                      listingFeeLabel={listingFeeLabel}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls
          basePath="/dashboard/listings"
          currentPage={pagination.currentPage}
          itemLabel="listings"
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    </div>
  );
}
