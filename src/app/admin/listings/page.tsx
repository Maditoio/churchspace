import { ListingsTable } from "@/components/admin/ListingsTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getPaginationMeta, parsePageParam } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { formatPaymentCurrency, getListingPaymentAmount } from "@/lib/payments";

const PAGE_SIZE = 14;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const listingPaymentAmount = await getListingPaymentAmount();
  const totalListings = await prisma.listing.count();
  const pagination = getPaginationMeta(totalListings, parsePageParam(resolvedSearchParams?.page), PAGE_SIZE);
  const listings = await prisma.listing.findMany({
    include: { agent: true },
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">All Listings Management</h1>
      <ListingsTable listings={listings} listingFeeLabel={formatPaymentCurrency(listingPaymentAmount)} />
      <PaginationControls
        basePath="/admin/listings"
        currentPage={pagination.currentPage}
        itemLabel="listings"
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
