"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

const propertyTypes = [
  "",
  "SANCTUARY",
  "HALL",
  "CONFERENCE_ROOM",
  "OUTDOOR_SPACE",
  "VACANT_LAND",
  "FULL_PREMISES",
  "OTHER",
] as const;

const listingTypes = ["", "RENT", "HIRE", "SALE", "SHARING"] as const;

type AlertFormState = {
  query: string;
  suburb: string;
  city: string;
  type: string;
  purpose: string;
};

export default function ListingAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<AlertFormState>({
    query: "",
    suburb: "",
    city: "",
    type: "",
    purpose: "",
  });

  useEffect(() => {
    fetch("/api/users/search-preferences")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/alerts");
          return null;
        }

        return res.json();
      })
      .then((payload) => {
        if (!payload?.preference) return;

        setState({
          query: payload.preference.query ?? "",
          suburb: payload.preference.suburb ?? "",
          city: payload.preference.city ?? "",
          type: payload.preference.propertyType ?? "",
          purpose: payload.preference.listingType ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function setField(field: keyof AlertFormState, value: string) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/users/search-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: state.query,
          suburb: state.suburb,
          city: state.city,
          type: state.type || undefined,
          purpose: state.purpose || undefined,
        }),
      });

      if (response.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/alerts");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not save alert");
      }

      toast.success("Listing alert saved. We'll email you when matching listings are added.");
    } catch {
      toast.error("Could not save listing alert");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Listing Alerts</h1>
      <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
        Set your preferred area/suburb or city and we&apos;ll send you an email whenever a new listing matches your criteria.
      </p>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-(--radius) border border-(--border) bg-white p-6 md:grid-cols-2">
        <Input
          value={state.query}
          onChange={(e) => setField("query", e.target.value)}
          placeholder="Keyword (optional)"
          disabled={loading || saving}
        />
        <Input
          value={state.suburb}
          onChange={(e) => setField("suburb", e.target.value)}
          placeholder="Area / Suburb"
          disabled={loading || saving}
        />
        <Input
          value={state.city}
          onChange={(e) => setField("city", e.target.value)}
          placeholder="City"
          disabled={loading || saving}
        />
        <select
          className="h-11 w-full rounded-lg border border-(--border) px-3 text-sm"
          value={state.type}
          onChange={(e) => setField("type", e.target.value)}
          disabled={loading || saving}
        >
          {propertyTypes.map((type) => (
            <option key={type || "ALL_TYPES"} value={type}>{type ? type.replace(/_/g, " ") : "All Property Types"}</option>
          ))}
        </select>
        <select
          className="h-11 w-full rounded-lg border border-(--border) px-3 text-sm"
          value={state.purpose}
          onChange={(e) => setField("purpose", e.target.value)}
          disabled={loading || saving}
        >
          {listingTypes.map((type) => (
            <option key={type || "ALL_PURPOSES"} value={type}>{type || "All Listing Types"}</option>
          ))}
        </select>

        <Button type="submit" className="md:col-span-2" disabled={loading || saving}>
          {saving ? "Saving Alert..." : "Save Listing Alert"}
        </Button>
      </form>
    </div>
  );
}
