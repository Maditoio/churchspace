import { Listing, ListingImage, ListingStatus, ListingType, SavedListing, User } from "@prisma/client";
import { PropertyCardListing } from "@/types";

export function mapListingToCard(
  listing: Listing & {
    images: ListingImage[];
    agent: Pick<User, "name" | "avatar" | "churchName" | "whatsapp" | "email">;
    savedBy?: Pick<SavedListing, "id">[];
  },
): PropertyCardListing {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    images: listing.images.map((img) => ({ url: img.url, alt: img.alt })),
    propertyType: listing.propertyType,
    listingType: listing.listingType as ListingType[],
    city: listing.city,
    suburb: listing.suburb,
    congregationSize: listing.congregationSize,
    areaSquareMeters: listing.areaSquareMeters,
    rentPricePerMonth: listing.rentPricePerMonth ? Number(listing.rentPricePerMonth) : null,
    rentPricePerHour: listing.rentPricePerHour ? Number(listing.rentPricePerHour) : null,
    rentPricePerDay: listing.rentPricePerDay ? Number(listing.rentPricePerDay) : null,
    salePrice: listing.salePrice ? Number(listing.salePrice) : null,
    isFeatured: listing.isFeatured,
    isSaved: (listing.savedBy?.length ?? 0) > 0,
    status: listing.status as ListingStatus,
    agent: {
      name: listing.agent.name,
      avatar: listing.agent.avatar,
      churchName: listing.agent.churchName,
      whatsapp: listing.agent.whatsapp,
      email: listing.agent.email,
    },
  };
}
