"use client";

import Image from "next/image";

const PLACEHOLDER_LISTING_IMAGE_URL = "/window.svg";

export function Step6Photos() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Listing photos are temporarily disabled</p>
      <div className="rounded-(--radius) border border-dashed border-(--border) bg-(--surface-raised) p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="relative h-40 w-full overflow-hidden rounded-lg border border-(--border) bg-white md:w-56">
            <Image src={PLACEHOLDER_LISTING_IMAGE_URL} alt="Placeholder listing image" fill className="object-contain p-5" />
          </div>
          <div className="space-y-2 text-sm text-(--text-secondary)">
            <p>A placeholder image will be attached automatically when you submit this listing.</p>
            <p>This temporarily bypasses Blob uploads so we can confirm whether image storage is the only issue in the create-listing flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
