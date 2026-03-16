import { ListingsTable } from "@/components/admin/ListingsTable";
import { prisma } from "@/lib/prisma";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({ include: { agent: true }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">All Listings Management</h1>
      <ListingsTable listings={listings} />
    </div>
  );
}
