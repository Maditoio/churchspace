"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Step5Pricing() {
  const [types, setTypes] = useState<string[]>([]);

  function toggleType(type: string) {
    setTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }

  const showRentHire = types.includes("RENT") || types.includes("HIRE") || types.length === 0;
  const showSale = types.includes("SALE") || types.length === 0;
  const showSharing = types.includes("SHARING");

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Filter fields by listing type (optional — shows all if none selected)</p>
        <div className="flex flex-wrap gap-2">
          {["RENT", "HIRE", "SALE", "SHARING"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                types.includes(t)
                  ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-white text-[var(--text-secondary)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {showRentHire && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Rent / Hire Pricing</legend>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            <Input name="rentPricePerHour" type="number" min="0" placeholder="Price per hour (R)" />
            <Input name="rentPricePerDay" type="number" min="0" placeholder="Price per day (R)" />
            <Input name="rentPricePerMonth" type="number" min="0" placeholder="Price per month (R)" />
            <Input name="depositAmount" type="number" min="0" placeholder="Deposit (R)" />
          </div>
        </fieldset>
      )}

      {showSale && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Sale Pricing</legend>
          <Input name="salePrice" type="number" min="0" placeholder="Sale price (R)" className="mt-2" />
        </fieldset>
      )}

      {showSharing && (
        <fieldset className="rounded-(--radius) border border-(--border) p-4">
          <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Sharing Schedule</legend>
          <p className="mb-3 text-xs text-[var(--text-secondary)]">Set available slots for each weekday</p>
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

      <fieldset className="rounded-(--radius) border border-(--border) p-4">
        <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Availability</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <Input name="availableFrom" type="date" />
          <Input name="availableTo" type="date" />
        </div>
        <select name="availabilityType" className="mt-3 h-11 w-full rounded-[8px] border border-[var(--border)] px-3 text-sm">
          <option value="ALWAYS">Always Available</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="BY_REQUEST">By Request</option>
        </select>
      </fieldset>
    </div>
  );
}
