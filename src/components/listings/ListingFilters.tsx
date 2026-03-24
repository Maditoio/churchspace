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

  const applyFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["suburb", "city", "type", "purpose"] as const) {
      const value = formData.get(key)?.toString();
      if (value) params.set(key, value);
      else params.delete(key);
    }

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form onSubmit={applyFilter} className="space-y-3 rounded-(--radius) border border-(--border) bg-white p-4">
      <Input name="suburb" placeholder="Area / Suburb" defaultValue={searchParams.get("suburb") ?? ""} />
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
