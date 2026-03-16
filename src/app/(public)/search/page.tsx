import { ListingStatus } from "@prisma/client";
import { SearchBar } from "@/components/listings/SearchBar";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const session = await auth();
  const now = new Date();
  const q = params.q ?? "";
  const city = params.city ?? "";

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
      city: city ? { contains: city, mode: "insensitive" } : undefined,
    },
    include: {
      images: true,
      agent: true,
      savedBy: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Advanced Search</h1>
      <SearchBar />
      <PropertyGrid listings={listings.map(mapListingToCard)} />
    </div>
  );
}
