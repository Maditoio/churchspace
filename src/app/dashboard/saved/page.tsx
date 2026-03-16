import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { mapListingToCard } from "@/lib/listings";

export default async function SavedListingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-5xl text-[var(--text-primary)]">Saved Listings</h1>
        <EmptyState title="Sign in to see your saved spaces" description="You need to be signed in to view and manage your saved listings." ctaHref="/signin" ctaLabel="Sign In" />
      </div>
    );
  }

  const saved = await prisma.savedListing.findMany({
    where: { userId: session.user.id },
    include: { listing: { include: { images: true, agent: true } } },
    orderBy: { createdAt: "desc" },
  });

  const listings = saved.map((s) => mapListingToCard(s.listing));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Saved Listings</h1>
      {listings.length ? (
        <PropertyGrid listings={listings} />
      ) : (
        <EmptyState title="No saved listings yet" description="As you browse spaces, tap the heart icon to save your favorites here." ctaHref="/listings" ctaLabel="Browse Listings" />
      )}
    </div>
  );
}
