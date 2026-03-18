"use client";

import { useMemo, useState } from "react";
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
  const [description, setDescription] = useState("");
  const minDescriptionLength = 100;
  const hasMinDescription = description.trim().length >= minDescriptionLength;
  const remainingChars = useMemo(
    () => Math.max(0, minDescriptionLength - description.trim().length),
    [description],
  );

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
      <div className="space-y-1">
        <textarea
          name="description"
          placeholder="Detailed property description"
          minLength={100}
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`min-h-40 w-full rounded-[8px] border p-3 transition-colors ${
            hasMinDescription
              ? "border-emerald-400 bg-emerald-50/60"
              : "border-[var(--border)]"
          }`}
        />
        <p className={`text-xs ${hasMinDescription ? "text-emerald-700" : "text-[var(--text-muted)]"}`}>
          {hasMinDescription
            ? "Great description length. You can continue editing or move to the next step."
            : `Description must be at least 100 characters (${remainingChars} remaining).`}
        </p>
      </div>
    </div>
  );
}
