import type { Metadata } from "next";
import { ListingStatus, ListingType, PropertyType } from "@prisma/client";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Church Property Listings",
  description:
    "Browse church buildings for rent and sale, conference rooms, halls, and youth ministry spaces in South Africa. Filter listings by city, type, and purpose.",
  alternates: {
    canonical: "/listings",
  },
};

export default async function ListingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const session = await auth();
  const now = new Date();

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
      city: params.city ? { contains: params.city, mode: "insensitive" } : undefined,
      propertyType: params.type ? (params.type as PropertyType) : undefined,
      listingType: params.purpose ? { has: params.purpose as ListingType } : undefined,
    },
    include: {
      images: true,
      agent: true,
      savedBy: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-16 md:grid-cols-[300px_1fr] md:px-8">
      <div>
        <h1 className="mb-4 font-display text-4xl text-[var(--text-primary)]">Browse Listings</h1>
        <p className="mb-6 text-sm leading-7 text-[var(--text-secondary)]">
          Find a church building to rent, compare church properties for sale, or discover conference and youth ministry spaces by location and property type.
        </p>
        <ListingFilters />
      </div>
      <div>
        <PropertyGrid listings={listings.map(mapListingToCard)} />
      </div>
    </div>
  );
}
