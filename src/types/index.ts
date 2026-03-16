import { Listing, ListingImage, ListingType, PropertyType, ListingStatus, User } from "@prisma/client";

export type UserRole = "USER" | "AGENT" | "SUPER_ADMIN";

export type ListingWithRelations = Listing & {
  images: ListingImage[];
  agent: Pick<User, "id" | "name" | "avatar" | "churchName" | "whatsapp" | "email" | "denomination">;
};

export type PropertyCardListing = {
  id: string;
  slug: string;
  title: string;
  images: { url: string; alt: string | null }[];
  propertyType: PropertyType;
  listingType: ListingType[];
  city: string;
  suburb: string;
  congregationSize?: number | null;
  areaSquareMeters?: number | null;
  rentPricePerHour?: number | null;
  rentPricePerDay?: number | null;
  salePrice?: number | null;
  isFeatured: boolean;
  isSaved?: boolean;
  status?: ListingStatus;
  agent: {
    name: string | null;
    avatar?: string | null;
    churchName?: string | null;
    whatsapp?: string | null;
    email: string;
  };
};
