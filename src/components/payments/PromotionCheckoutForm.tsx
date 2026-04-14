"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type PromotionCheckoutFormProps = {
  listingId: string;
  listingFeeLabel: string;
};

export function PromotionCheckoutForm({ listingId, listingFeeLabel }: PromotionCheckoutFormProps) {
  const router = useRouter();
  const [promotionCode, setPromotionCode] = useState("");
  const [loading, setLoading] = useState<"apply" | "skip" | null>(null);

  async function sendCheckoutRequest(payload: { promotionCode?: string; skipPromotionEntry?: boolean }) {
    const response = await fetch(`/api/listings/${listingId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(body?.error ?? "Unable to process checkout");
    }

    if (body?.freeApplied) {
      toast.success("Promotion applied. Your listing is now active.");
      router.push(`/dashboard/payments?payment=success&reference=${encodeURIComponent(body?.payment?.reference ?? "")}`);
      return;
    }

    if (body?.authorizationUrl) {
      window.location.href = body.authorizationUrl;
      return;
    }

    throw new Error("Unexpected checkout response");
  }

  async function applyPromotion(event: FormEvent) {
    event.preventDefault();
    const code = promotionCode.trim();
    if (!code) {
      toast.error("Enter a promotion code first.");
      return;
    }

    setLoading("apply");
    try {
      await sendCheckoutRequest({ promotionCode: code });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to apply promotion");
    } finally {
      setLoading(null);
    }
  }

  async function continueWithoutCode() {
    setLoading("skip");
    try {
      await sendCheckoutRequest({ skipPromotionEntry: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to continue to payment");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4 rounded-(--radius) border border-(--border) bg-white p-6">
      <div>
        <h2 className="font-display text-3xl text-foreground">Apply Voucher</h2>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Listing fee is <strong>{listingFeeLabel}</strong>. Enter a promotion code to claim discounts or a free listing.
        </p>
      </div>

      <form onSubmit={applyPromotion} className="space-y-3">
        <Input
          value={promotionCode}
          onChange={(event) => setPromotionCode(event.target.value)}
          placeholder="e.g. CHURCH2026"
          autoComplete="off"
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading !== null}>
            {loading === "apply" ? "Applying..." : "Apply Promotion"}
          </Button>
          <Button type="button" variant="secondary" disabled={loading !== null} onClick={continueWithoutCode}>
            {loading === "skip" ? "Preparing checkout..." : "Continue Without Code"}
          </Button>
        </div>
      </form>
    </div>
  );
}
