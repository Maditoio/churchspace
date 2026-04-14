"use client";

import { useMemo, useState } from "react";
import { PromotionType } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type PromotionItem = {
  id: string;
  name: string;
  description: string | null;
  type: PromotionType;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  maxFreeListings: number | null;
  freeListingsUsed: number;
  maxUsesPerUser: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
};

type PromotionDraft = Omit<PromotionItem, "id" | "usedCount" | "freeListingsUsed">;

const defaultDraft: PromotionDraft = {
  name: "",
  description: "",
  type: PromotionType.PERCENTAGE,
  discountValue: 0,
  maxUses: null,
  maxFreeListings: null,
  maxUsesPerUser: null,
  validFrom: new Date().toISOString().slice(0, 16),
  validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  isActive: true,
};

function toNullableNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function toDatetimeLocal(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }

  return date.toISOString().slice(0, 16);
}

function normalizePayload(item: PromotionDraft | PromotionItem) {
  return {
    name: item.name,
    description: item.description ?? "",
    type: item.type,
    discountValue: Number(item.discountValue),
    maxUses: item.maxUses,
    maxFreeListings: item.maxFreeListings,
    maxUsesPerUser: item.maxUsesPerUser,
    validFrom: new Date(item.validFrom).toISOString(),
    validUntil: new Date(item.validUntil).toISOString(),
    isActive: item.isActive,
  };
}

export function AdminPromotionsManager({ initialPromotions }: { initialPromotions: PromotionItem[] }) {
  const [promotions, setPromotions] = useState<PromotionItem[]>(initialPromotions);
  const [draft, setDraft] = useState<PromotionDraft>(defaultDraft);
  const [saving, setSaving] = useState<string | null>(null);

  const totalUsage = useMemo(
    () => promotions.reduce((sum, promotion) => sum + promotion.usedCount, 0),
    [promotions],
  );

  function updatePromotion(id: string, patch: Partial<PromotionItem>) {
    setPromotions((prev) => prev.map((promotion) => (promotion.id === id ? { ...promotion, ...patch } : promotion)));
  }

  async function createPromotion() {
    if (!draft.name.trim()) {
      toast.error("Promotion code is required.");
      return;
    }

    setSaving("new");
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizePayload(draft)),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? "Unable to create promotion");
      }

      setPromotions((prev) => [
        {
          ...payload.promotion,
          discountValue: Number(payload.promotion.discountValue),
          validFrom: toDatetimeLocal(payload.promotion.validFrom),
          validUntil: toDatetimeLocal(payload.promotion.validUntil),
          usedCount: payload.promotion.usedCount ?? 0,
          freeListingsUsed: payload.promotion.freeListingsUsed ?? 0,
        },
        ...prev,
      ]);
      setDraft(defaultDraft);
      toast.success("Promotion created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create promotion");
    } finally {
      setSaving(null);
    }
  }

  async function savePromotion(item: PromotionItem) {
    setSaving(item.id);
    try {
      const res = await fetch(`/api/admin/promotions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizePayload(item)),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? "Unable to save promotion");
      }

      toast.success("Promotion updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save promotion");
    } finally {
      setSaving(null);
    }
  }

  async function deletePromotion(id: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error ?? "Unable to delete promotion");
      }

      setPromotions((prev) => prev.filter((promotion) => promotion.id !== id));
      toast.success("Promotion deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete promotion");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-(--radius) border border-(--border) bg-white p-4 text-sm text-(--text-secondary)">
        Active promo usage events recorded: <strong>{totalUsage}</strong>
      </div>

      <section className="space-y-3 rounded-(--radius) border border-(--border) bg-white p-6">
        <h2 className="font-display text-3xl text-foreground">Create Promotion</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="CHURCH2026" />
          <select
            value={draft.type}
            onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as PromotionType }))}
            className="h-11 w-full rounded-lg border border-(--border) bg-white px-3 text-sm text-foreground outline-none"
          >
            <option value={PromotionType.PERCENTAGE}>Percentage</option>
            <option value={PromotionType.FIXED}>Fixed amount</option>
            <option value={PromotionType.FREE_LISTING}>Free listing</option>
          </select>
          <Input
            value={draft.discountValue}
            onChange={(event) => setDraft((prev) => ({ ...prev, discountValue: Number(event.target.value) || 0 }))}
            type="number"
            min={0}
            step="0.01"
            placeholder="Discount value"
          />
          <Input
            value={draft.maxUses ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, maxUses: toNullableNumber(event.target.value) }))}
            type="number"
            min={1}
            placeholder="Max uses (optional)"
          />
          <Input
            value={draft.maxFreeListings ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, maxFreeListings: toNullableNumber(event.target.value) }))}
            type="number"
            min={1}
            placeholder="Max free listings (optional)"
          />
          <Input
            value={draft.maxUsesPerUser ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, maxUsesPerUser: toNullableNumber(event.target.value) }))}
            type="number"
            min={1}
            placeholder="Max uses per user (optional)"
          />
          <Input
            value={draft.validFrom}
            onChange={(event) => setDraft((prev) => ({ ...prev, validFrom: event.target.value }))}
            type="datetime-local"
          />
          <Input
            value={draft.validUntil}
            onChange={(event) => setDraft((prev) => ({ ...prev, validUntil: event.target.value }))}
            type="datetime-local"
          />
          <Input
            value={draft.description ?? ""}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description (optional)"
            className="md:col-span-2"
          />
        </div>
        <Button type="button" onClick={createPromotion} disabled={saving !== null}>
          {saving === "new" ? "Creating..." : "Create Promotion"}
        </Button>
      </section>

      <section className="space-y-3 rounded-(--radius) border border-(--border) bg-white p-6">
        <h2 className="font-display text-3xl text-foreground">Manage Promotions</h2>
        {promotions.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">No promotions created yet.</p>
        ) : (
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="space-y-3 rounded-xl border border-(--border) p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={promotion.name} onChange={(event) => updatePromotion(promotion.id, { name: event.target.value })} />
                  <select
                    value={promotion.type}
                    onChange={(event) => updatePromotion(promotion.id, { type: event.target.value as PromotionType })}
                    className="h-11 w-full rounded-lg border border-(--border) bg-white px-3 text-sm text-foreground outline-none"
                  >
                    <option value={PromotionType.PERCENTAGE}>Percentage</option>
                    <option value={PromotionType.FIXED}>Fixed amount</option>
                    <option value={PromotionType.FREE_LISTING}>Free listing</option>
                  </select>
                  <Input
                    value={promotion.discountValue}
                    onChange={(event) => updatePromotion(promotion.id, { discountValue: Number(event.target.value) || 0 })}
                    type="number"
                    min={0}
                    step="0.01"
                  />
                  <Input
                    value={promotion.maxUses ?? ""}
                    onChange={(event) => updatePromotion(promotion.id, { maxUses: toNullableNumber(event.target.value) })}
                    type="number"
                    min={1}
                    placeholder="Max uses"
                  />
                  <Input
                    value={promotion.maxFreeListings ?? ""}
                    onChange={(event) => updatePromotion(promotion.id, { maxFreeListings: toNullableNumber(event.target.value) })}
                    type="number"
                    min={1}
                    placeholder="Max free listings"
                  />
                  <Input
                    value={promotion.maxUsesPerUser ?? ""}
                    onChange={(event) => updatePromotion(promotion.id, { maxUsesPerUser: toNullableNumber(event.target.value) })}
                    type="number"
                    min={1}
                    placeholder="Max uses per user"
                  />
                  <Input
                    value={toDatetimeLocal(promotion.validFrom)}
                    onChange={(event) => updatePromotion(promotion.id, { validFrom: event.target.value })}
                    type="datetime-local"
                  />
                  <Input
                    value={toDatetimeLocal(promotion.validUntil)}
                    onChange={(event) => updatePromotion(promotion.id, { validUntil: event.target.value })}
                    type="datetime-local"
                  />
                  <Input
                    value={promotion.description ?? ""}
                    onChange={(event) => updatePromotion(promotion.id, { description: event.target.value })}
                    placeholder="Description"
                    className="md:col-span-2"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-(--text-secondary)">
                  <span>
                    Used {promotion.usedCount}
                    {promotion.maxUses ? ` / ${promotion.maxUses}` : " times"} · Free {promotion.freeListingsUsed}
                    {promotion.maxFreeListings ? ` / ${promotion.maxFreeListings}` : ""}
                  </span>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={promotion.isActive}
                      onChange={(event) => updatePromotion(promotion.id, { isActive: event.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => savePromotion(promotion)} disabled={saving !== null}>
                    {saving === promotion.id ? "Saving..." : "Save"}
                  </Button>
                  <Button type="button" variant="danger" onClick={() => deletePromotion(promotion.id)} disabled={saving !== null}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
