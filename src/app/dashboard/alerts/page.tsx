"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { parsePageParam } from "@/lib/pagination";
import { formatListingTypeLabel, formatPropertyTypeLabel, formatSavedAlertField } from "@/lib/search-preferences";
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

type SavedAlert = {
  id: string;
  createdAt: string;
  query: string | null;
  city: string | null;
  suburb: string | null;
  propertyType: string | null;
  listingType: string | null;
  lastRecommendationSentAt: string | null;
};

type AlertsPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export default function ListingAlertsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [pagination, setPagination] = useState<AlertsPagination>({
    currentPage: 1,
    pageSize: 6,
    totalItems: 0,
    totalPages: 1,
  });
  const [state, setState] = useState<AlertFormState>({
    query: "",
    suburb: "",
    city: "",
    type: "",
    purpose: "",
  });
  const currentPage = parsePageParam(searchParams.get("page"));

  useEffect(() => {
    fetch(`/api/users/search-preferences?page=${currentPage}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/signin?callbackUrl=/dashboard/alerts");
          return null;
        }

        return res.json();
      })
      .then((payload) => {
        if (!payload) return;

        setAlerts(Array.isArray(payload.preferences) ? payload.preferences : []);

        if (payload.pagination) {
          setPagination(payload.pagination);

          if (payload.pagination.currentPage !== currentPage) {
            const params = new URLSearchParams(searchParams.toString());
            if (payload.pagination.currentPage > 1) {
              params.set("page", String(payload.pagination.currentPage));
            } else {
              params.delete("page");
            }

            const query = params.toString();
            router.replace(query ? `/dashboard/alerts?${query}` : "/dashboard/alerts", { scroll: false });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [currentPage, reloadToken, router, searchParams]);

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

      setState({ query: "", suburb: "", city: "", type: "", purpose: "" });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      const query = params.toString();
      setRefreshing(true);
      setReloadToken((value) => value + 1);
      router.push(query ? `/dashboard/alerts?${query}` : "/dashboard/alerts", { scroll: false });

      toast.success("Listing alert saved. We'll email you when matching listings are added.");
    } catch {
      toast.error("Could not save listing alert");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlert(alertId: string) {
    const confirmed = window.confirm("Delete this saved alert? You will stop receiving matching email recommendations for it.");
    if (!confirmed) {
      return;
    }

    setDeletingId(alertId);

    try {
      const response = await fetch(`/api/users/search-preferences/${alertId}`, { method: "DELETE" });

      if (response.status === 401) {
        router.replace("/signin?callbackUrl=/dashboard/alerts");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not delete alert");
      }

      setRefreshing(true);
      setReloadToken((value) => value + 1);

      if (alerts.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      }

      toast.success("Alert deleted");
    } catch {
      toast.error("Could not delete alert");
    } finally {
      setDeletingId(null);
    }
  }

  function handlePageChange(page: number) {
    setRefreshing(true);

    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const query = params.toString();
    router.push(query ? `/dashboard/alerts?${query}` : "/dashboard/alerts", { scroll: false });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl text-foreground">Listing Alerts</h1>
      <p className="max-w-3xl text-sm leading-7 text-(--text-secondary)">
        Save multiple search alerts by suburb, city, keyword, property type, or listing type. Each unique alert becomes its own recommendation feed.
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
          {saving ? "Saving Alert..." : "Save New Alert"}
        </Button>
      </form>

      <section className="rounded-(--radius) border border-(--border) bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Saved Alerts</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              {pagination.totalItems === 0 ? "No saved alerts yet." : `${pagination.totalItems} alert${pagination.totalItems === 1 ? "" : "s"} saved.`}
            </p>
          </div>
        </div>

        {loading || refreshing ? (
          <p className="px-6 py-6 text-sm text-(--text-secondary)">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="px-6 py-6 text-sm text-(--text-secondary)">Your saved alerts will appear here.</p>
        ) : (
          <>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {alerts.map((alert) => (
                <article key={alert.id} className="rounded-[24px] border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(251,248,242,0.95))] p-5 shadow-(--shadow-sm)">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-(--text-muted)">
                        Created {new Date(alert.createdAt).toLocaleDateString("en-ZA")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">
                        {alert.suburb || alert.city || alert.query || "Custom Alert"}
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-(--primary) underline-offset-4 hover:underline disabled:opacity-50"
                      onClick={() => handleDeleteAlert(alert.id)}
                      disabled={deletingId === alert.id}
                    >
                      {deletingId === alert.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-(--text-secondary)">
                    <p><strong className="text-foreground">Keyword:</strong> {formatSavedAlertField(alert.query)}</p>
                    <p><strong className="text-foreground">Suburb:</strong> {formatSavedAlertField(alert.suburb)}</p>
                    <p><strong className="text-foreground">City:</strong> {formatSavedAlertField(alert.city)}</p>
                    <p><strong className="text-foreground">Property Type:</strong> {formatPropertyTypeLabel(alert.propertyType)}</p>
                    <p><strong className="text-foreground">Listing Type:</strong> {formatListingTypeLabel(alert.listingType)}</p>
                    <p>
                      <strong className="text-foreground">Last Email:</strong>{" "}
                      {alert.lastRecommendationSentAt
                        ? new Date(alert.lastRecommendationSentAt).toLocaleString("en-ZA")
                        : "Not sent yet"}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <PaginationControls
              currentPage={pagination.currentPage}
              itemLabel="alerts"
              onPageChange={handlePageChange}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
            />
          </>
        )}
      </section>
    </div>
  );
}
