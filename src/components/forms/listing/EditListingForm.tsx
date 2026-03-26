"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Listing = {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  address: string;
  suburb: string;
  city: string;
  province: string;
  country: string;
  congregationSize: number | null;
  areaSquareMeters: number | null;
  parkingSpaces: number | null;
  rentPricePerHour: unknown;
  rentPricePerDay: unknown;
  rentPricePerMonth: unknown;
  salePrice: unknown;
  depositAmount: unknown;
};

export function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      videoUrl: String(form.get("videoUrl") ?? "").trim() || undefined,
      address: form.get("address"),
      suburb: form.get("suburb"),
      city: form.get("city"),
      province: form.get("province"),
      country: form.get("country"),
      congregationSize: Number(form.get("congregationSize") ?? "") || undefined,
      areaSquareMeters: Number(form.get("areaSquareMeters") ?? "") || undefined,
      parkingSpaces: Number(form.get("parkingSpaces") ?? "") || undefined,
      rentPricePerHour: Number(form.get("rentPricePerHour") ?? "") || undefined,
      rentPricePerDay: Number(form.get("rentPricePerDay") ?? "") || undefined,
      rentPricePerMonth: Number(form.get("rentPricePerMonth") ?? "") || undefined,
      salePrice: Number(form.get("salePrice") ?? "") || undefined,
      depositAmount: Number(form.get("depositAmount") ?? "") || undefined,
    };

    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (res.ok) {
      toast.success("Listing updated");
      router.push("/dashboard/listings");
      router.refresh();
    } else {
      toast.error("Failed to update listing");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-(--radius) border border-(--border) bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Title</label>
          <Input name="title" defaultValue={listing.title} required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Description</label>
          <textarea name="description" defaultValue={listing.description} className="min-h-40 w-full rounded-[8px] border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">YouTube Video URL</label>
          <Input name="videoUrl" type="url" defaultValue={listing.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Address</label>
          <Input name="address" defaultValue={listing.address} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Suburb</label>
          <Input name="suburb" defaultValue={listing.suburb} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">City</label>
          <Input name="city" defaultValue={listing.city} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Province</label>
          <Input name="province" defaultValue={listing.province} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Country</label>
          <Input name="country" defaultValue={listing.country} />
        </div>
      </div>

      <fieldset className="rounded-(--radius-sm) border border-(--border) p-4">
        <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Property Details</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <Input name="congregationSize" type="number" min="0" defaultValue={listing.congregationSize ?? ""} placeholder="Capacity" />
          <Input name="areaSquareMeters" type="number" min="0" defaultValue={listing.areaSquareMeters ?? ""} placeholder="Area (m²)" />
          <Input name="parkingSpaces" type="number" min="0" defaultValue={listing.parkingSpaces ?? ""} placeholder="Parking spaces" />
        </div>
      </fieldset>

      <fieldset className="rounded-(--radius-sm) border border-(--border) p-4">
        <legend className="px-2 text-sm font-semibold text-[var(--text-primary)]">Pricing</legend>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <Input name="rentPricePerHour" type="number" min="0" defaultValue={String(listing.rentPricePerHour ?? "")} placeholder="Rent per hour (R)" />
          <Input name="rentPricePerDay" type="number" min="0" defaultValue={String(listing.rentPricePerDay ?? "")} placeholder="Rent per day (R)" />
          <Input name="rentPricePerMonth" type="number" min="0" defaultValue={String(listing.rentPricePerMonth ?? "")} placeholder="Rent per month (R)" />
          <Input name="salePrice" type="number" min="0" defaultValue={String(listing.salePrice ?? "")} placeholder="Sale price (R)" />
          <Input name="depositAmount" type="number" min="0" defaultValue={String(listing.depositAmount ?? "")} placeholder="Deposit (R)" />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="accent" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}
