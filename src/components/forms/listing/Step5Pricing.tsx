"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Step5Pricing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [hireRateMode, setHireRateMode] = useState<"HOURLY" | "DAILY">("HOURLY");

  useEffect(() => {
    const root = rootRef.current;
    const form = root?.closest("form");
    if (!form) return;

    const readListingTypes = () => {
      const nextTypes = new FormData(form)
        .getAll("listingType")
        .map((value) => String(value));
      setTypes(nextTypes);
    };

    readListingTypes();
    form.addEventListener("change", readListingTypes);

    return () => {
      form.removeEventListener("change", readListingTypes);
    };
  }, []);

  const showRent = types.includes("RENT");
  const showHire = types.includes("HIRE");
  const showSale = types.includes("SALE");
  const showSharing = types.includes("SHARING");
  const hasSelection = types.length > 0;

  function preventCommaInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (input.value.includes(",")) {
      input.value = input.value.replace(/,/g, "");
    }
  }

  return (
    <div ref={rootRef} className="space-y-5">
      <div className="rounded-(--radius) border border-(--border) bg-white p-4 text-sm text-(--text-secondary)">
        {hasSelection ? (
          <p>
            Showing pricing fields for: <span className="font-semibold text-foreground">{types.join(", ")}</span>
          </p>
        ) : (
          <p>Please select at least one listing type in Step 1 to continue pricing setup.</p>
        )}
      </div>

      {showRent && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-foreground">Rent Pricing</legend>
          <p className="mt-1 text-xs text-(--text-muted)">Rent listings require monthly rent and a deposit.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input
              name="rentPricePerMonth"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              onInput={preventCommaInput}
              placeholder="Monthly rent (R)"
            />
            <Input
              name="depositAmount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              onInput={preventCommaInput}
              placeholder="Deposit (R)"
            />
          </div>
        </fieldset>
      )}

      {showHire && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-foreground">Hire Pricing</legend>
          <p className="mt-1 text-xs text-(--text-muted)">Choose whether you charge an hourly or daily rate.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-white px-3 py-1.5 text-sm text-foreground">
              <input
                type="radio"
                name="hireRateMode"
                value="HOURLY"
                checked={hireRateMode === "HOURLY"}
                onChange={() => setHireRateMode("HOURLY")}
              />
              Hourly Rate
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-white px-3 py-1.5 text-sm text-foreground">
              <input
                type="radio"
                name="hireRateMode"
                value="DAILY"
                checked={hireRateMode === "DAILY"}
                onChange={() => setHireRateMode("DAILY")}
              />
              Daily Rate
            </label>
          </div>
          <div className="mt-3">
            {hireRateMode === "HOURLY" ? (
              <Input
                name="rentPricePerHour"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                onInput={preventCommaInput}
                placeholder="Hourly rate (R)"
              />
            ) : (
              <Input
                name="rentPricePerDay"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                onInput={preventCommaInput}
                placeholder="Daily rate (R)"
              />
            )}
          </div>
        </fieldset>
      )}

      {showSale && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-foreground">Sale Pricing</legend>
          <Input name="salePrice" type="number" min="0" placeholder="Sale price (R)" className="mt-2" />
        </fieldset>
      )}

      {showSharing && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-foreground">Sharing Schedule</legend>
          <p className="mb-3 text-xs text-(--text-secondary)">Set available slots for each weekday</p>
          <div className="space-y-2">
            {DAYS.map((day) => (
              <div key={day} className="grid grid-cols-[100px_1fr_1fr] items-center gap-2">
                <span className="text-sm font-medium">{day}</span>
                <Input name={`share_start_${day}`} type="time" placeholder="Start" />
                <Input name={`share_end_${day}`} type="time" placeholder="End" />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      {!showRent && !showHire && !showSale && !showSharing && hasSelection && (
        <div className="rounded-(--radius) border border-(--border) bg-(--surface-raised) px-4 py-3 text-sm text-(--text-secondary)">
          No pricing fields are required for the selected listing type.
        </div>
      )}

      <fieldset className="rounded-(--radius) border border-(--border) p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">Availability</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <Input name="availableFrom" type="date" />
          <Input name="availableTo" type="date" />
        </div>
        <select name="availabilityType" className="mt-3 h-11 w-full rounded-lg border border-(--border) px-3 text-sm">
          <option value="ALWAYS">Always Available</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="BY_REQUEST">By Request</option>
        </select>
      </fieldset>
    </div>
  );
}
