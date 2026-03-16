"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Users, Ruler, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatPrice, listingTypeLabel } from "@/lib/utils";
import { PropertyCardListing } from "@/types";

type PropertyCardProps = {
  listing: PropertyCardListing;
};

export function PropertyCard({ listing }: PropertyCardProps) {
  const [saved, setSaved] = useState(Boolean(listing.isSaved));
  const [savePending, setSavePending] = useState(false);

  async function toggleSave(event: React.MouseEvent) {
    event.preventDefault();
    setSavePending(true);
    const method = saved ? "DELETE" : "POST";
    const res = await fetch(`/api/saved/${listing.id}`, { method });
    setSavePending(false);
    if (res.ok) {
      setSaved((prev) => !prev);
      toast.success(saved ? "Removed from saved" : "Saved to favourites");
    } else if (res.status === 401) {
      toast.error("Sign in to save listings");
    } else {
      toast.error("Could not update saved listing");
    }
  }

  const firstImage = listing.images[0]?.url ?? "https://picsum.photos/seed/churchspace-fallback/1200/800";
  const firstAlt = listing.images[0]?.alt ?? listing.title;
  const price = listing.salePrice
    ? formatPrice(listing.salePrice)
    : listing.rentPricePerHour
      ? formatPrice(listing.rentPricePerHour, " / hour")
      : listing.rentPricePerDay
        ? formatPrice(listing.rentPricePerDay, " / day")
        : "POA";

  return (
    <article className="group relative overflow-hidden rounded-(--radius) border border-(--border) bg-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)]">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={firstImage} alt={firstAlt} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(26,26,46,0.35)] to-transparent" />
          {listing.isFeatured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <Star className="h-3.5 w-3.5" /> Featured
            </span>
          )}
        </div>
      </Link>

      {/* Save button */}
      <button
        aria-label={saved ? "Unsave listing" : "Save listing"}
        disabled={savePending}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white shadow-sm transition-opacity"
        onClick={toggleSave}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-[var(--text-secondary)]"}`} />
      </button>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {listing.listingType.map((type) => (
            <Badge key={`${listing.id}-${type}`}>{listingTypeLabel(type)}</Badge>
          ))}
        </div>

        <Link href={`/listings/${listing.slug}`}>
          <h3 className="line-clamp-1 font-display text-2xl text-[var(--text-primary)] hover:text-[var(--primary)]">{listing.title}</h3>
        </Link>

        <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
          <MapPin className="h-4 w-4 flex-shrink-0" /> {listing.suburb}, {listing.city}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
          {listing.congregationSize ? (
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {listing.congregationSize}</span>
          ) : null}
          {listing.areaSquareMeters ? (
            <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {listing.areaSquareMeters}m²</span>
          ) : null}
        </div>

        <p className="text-lg font-semibold text-[var(--primary)]">{price}</p>

        <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
          <Avatar src={listing.agent.avatar} name={listing.agent.name} />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{listing.agent.name ?? "Agent"}</p>
            <p className="text-xs text-[var(--text-secondary)]">{listing.agent.churchName ?? "Church community"}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
