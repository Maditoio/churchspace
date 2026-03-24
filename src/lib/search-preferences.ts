import { ListingType, PropertyType } from "@prisma/client";
import { listingTypeLabel } from "@/lib/utils";

type SearchPreferencePayload = {
  area?: string | null;
  city?: string | null;
  purpose?: ListingType | string | null;
  query?: string | null;
  suburb?: string | null;
  type?: PropertyType | string | null;
};

export type NormalizedSearchPreference = {
  city: string | null;
  fingerprint: string;
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  query: string | null;
  suburb: string | null;
};

export function normalizeSearchPreferenceInput(payload: SearchPreferencePayload): NormalizedSearchPreference {
  const query = payload.query?.trim() || null;
  const city = payload.city?.trim() || null;
  const suburb = payload.suburb?.trim() || payload.area?.trim() || null;
  const propertyType = payload.type ? PropertyType[payload.type as keyof typeof PropertyType] : null;
  const listingType = payload.purpose ? ListingType[payload.purpose as keyof typeof ListingType] : null;
  const fingerprint = createSearchPreferenceFingerprint({ query, city, suburb, propertyType, listingType });

  return {
    city,
    fingerprint,
    listingType,
    propertyType,
    query,
    suburb,
  };
}

export function hasSearchPreferenceCriteria(preference: Pick<NormalizedSearchPreference, "city" | "listingType" | "propertyType" | "query" | "suburb">) {
  return Boolean(
    preference.query || preference.city || preference.suburb || preference.propertyType || preference.listingType,
  );
}

export function createSearchPreferenceFingerprint(preference: {
  city: string | null;
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  query: string | null;
  suburb: string | null;
}) {
  return [
    preference.query?.toLowerCase() ?? "",
    preference.city?.toLowerCase() ?? "",
    preference.suburb?.toLowerCase() ?? "",
    preference.propertyType ?? "",
    preference.listingType ?? "",
  ].join("|");
}

export function formatSavedAlertField(value: string | null | undefined, fallback = "Any") {
  return value?.trim() ? value : fallback;
}

export function formatPropertyTypeLabel(value: PropertyType | string | null | undefined, fallback = "Any") {
  if (!value) {
    return fallback;
  }

  return value.replaceAll("_", " ");
}

export function formatListingTypeLabel(value: ListingType | string | null | undefined, fallback = "Any") {
  if (!value) {
    return fallback;
  }

  return listingTypeLabel(value);
}
