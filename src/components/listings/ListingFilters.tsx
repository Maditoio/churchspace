"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const propertyTypes = [
  "SANCTUARY",
  "HALL",
  "CONFERENCE_ROOM",
  "OUTDOOR_SPACE",
  "VACANT_LAND",
  "FULL_PREMISES",
  "OTHER",
];

const listingTypes = ["RENT", "HIRE", "SALE", "SHARING"];

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const persistPreference = async (payload: { city?: string; type?: string; purpose?: string }) => {
    try {
      await fetch("/api/users/search-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Ignore persistence errors to keep filtering responsive.
    }
  };

  const applyFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const payload: { city?: string; type?: string; purpose?: string } = {};

    for (const key of ["city", "type", "purpose"] as const) {
      const value = formData.get(key)?.toString();
      if (value) params.set(key, value);
      else params.delete(key);
      if (value) payload[key] = value;
    }

    void persistPreference(payload);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={applyFilter} className="space-y-3 rounded-(--radius) border border-(--border) bg-white p-4">
      <Input name="city" placeholder="City" defaultValue={searchParams.get("city") ?? ""} />
      <select name="type" className="h-11 w-full rounded-lg border border-(--border) px-3 text-sm">
        <option value="">All Property Types</option>
        {propertyTypes.map((type) => (
          <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
        ))}
      </select>
      <select name="purpose" className="h-11 w-full rounded-lg border border-(--border) px-3 text-sm">
        <option value="">All Listing Types</option>
        {listingTypes.map((purpose) => (
          <option key={purpose} value={purpose}>{purpose}</option>
        ))}
      </select>
      <Button type="submit" className="w-full">Apply Filters</Button>
    </form>
  );
}
