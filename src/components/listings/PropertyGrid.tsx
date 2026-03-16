import { PropertyCard } from "@/components/listings/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCardListing } from "@/types";

export function PropertyGrid({ listings }: { listings: PropertyCardListing[] }) {
  if (!listings.length) {
    return (
      <EmptyState
        title="No spaces found"
        description="Try adjusting filters or broadening your location search to discover more listings."
        ctaHref="/listings"
        ctaLabel="Reset Filters"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
