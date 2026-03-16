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

export function Step1BasicInfo() {
  return (
    <div className="space-y-4">
      <Input name="title" placeholder="Listing title" required />
      <select name="propertyType" className="h-11 w-full rounded-[8px] border border-[var(--border)] px-3">
        {propertyTypes.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}
      </select>
      <div className="grid gap-2 sm:grid-cols-2">
        {listingTypes.map((value) => (
          <label key={value} className="rounded-lg border border-[var(--border)] p-3 text-sm">
            <input type="checkbox" name="listingType" value={value} className="mr-2" />{value}
          </label>
        ))}
      </div>
      <textarea name="description" placeholder="Detailed property description" minLength={100} className="min-h-40 w-full rounded-[8px] border border-[var(--border)] p-3" />
    </div>
  );
}
