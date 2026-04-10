"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Users, Ruler, Star, Clock, CalendarRange } from "lucide-react";
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

  const firstImage = listing.images[0]?.url;
  const firstAlt = listing.images[0]?.alt ?? listing.title;
  const price = listing.rentPricePerMonth
    ? formatPrice(listing.rentPricePerMonth, " / month")
    : listing.rentPricePerHour
      ? formatPrice(listing.rentPricePerHour, " / hour")
      : listing.rentPricePerDay
        ? formatPrice(listing.rentPricePerDay, " / day")
        : listing.salePrice
          ? formatPrice(listing.salePrice)
          : "POA";

  return (
    <article className="group relative overflow-hidden rounded-(--radius) border border-(--border) bg-white shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-0.75 hover:shadow-(--shadow-lg)">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={firstAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              quality={60}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-end bg-[linear-gradient(135deg,var(--primary-soft),#f4efe4)] p-4 text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-secondary)">No Photo Yet</p>
                <p className="mt-2 line-clamp-2 text-lg font-semibold text-foreground">{listing.title}</p>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[rgba(26,26,46,0.35)] to-transparent" />
          {listing.isFeatured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold text-(--primary)">
              <Star className="h-3.5 w-3.5" /> Featured
            </span>
          )}
        </div>
      </Link>

      {/* Save button */}
      <button
        aria-label={saved ? "Unsave listing" : "Save listing"}
        disabled={savePending}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-white shadow-sm transition-opacity"
        onClick={toggleSave}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-(--text-secondary)"}`} />
      </button>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {listing.listingType.map((type) => (
            <Badge key={`${listing.id}-${type}`}>{listingTypeLabel(type)}</Badge>
          ))}
        </div>

        <Link href={`/listings/${listing.slug}`}>
          <h3 className="line-clamp-1 font-display text-2xl text-foreground hover:text-(--primary)">{listing.title}</h3>
        </Link>

        <p className="flex items-center gap-1 text-sm text-(--text-secondary)">
          <MapPin className="h-4 w-4 shrink-0" /> {listing.suburb}, {listing.city}
        </p>

        {listing.availabilityType === "ALWAYS" && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-(--success)">
            <Clock className="h-3.5 w-3.5" /> Always Available
          </span>
        )}
        {listing.availabilityType === "BY_REQUEST" && (
          <span className="inline-flex items-center gap-1 text-xs text-(--text-muted)">
            <CalendarRange className="h-3.5 w-3.5" /> By Request
          </span>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-(--text-secondary)">
          {listing.congregationSize ? (
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {listing.congregationSize}</span>
          ) : null}
          {listing.areaSquareMeters ? (
            <span className="inline-flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {listing.areaSquareMeters}m²</span>
          ) : null}
        </div>

        <p className="text-lg font-semibold text-(--primary)">{price}</p>

        <div className="flex items-center gap-2 border-t border-(--border-subtle) pt-3">
          <Avatar src={listing.agent.avatar} name={listing.agent.name} />
          <div>
            <p className="text-sm font-medium text-foreground">{listing.agent.name ?? "Agent"}</p>
            <p className="text-xs text-(--text-secondary)">{listing.agent.churchName ?? "Church community"}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
