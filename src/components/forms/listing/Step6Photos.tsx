"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";

type UploadedFile = { url: string; name: string };

export function Step6Photos() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function remove(url: string) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[var(--text-primary)]">Upload listing photos (up to 20)</p>
      <div className="rounded-(--radius) border border-dashed border-(--border) bg-(--surface-raised) p-8 text-center">
        <UploadButton<OurFileRouter, "listingImageUploader">
          endpoint="listingImageUploader"
          onClientUploadComplete={(res) => {
            const newFiles = res.map((f) => ({ url: f.ufsUrl ?? f.url, name: f.name }));
            setFiles((prev) => [...prev, ...newFiles].slice(0, 20));
            toast.success(`${res.length} photo${res.length > 1 ? "s" : ""} uploaded`);
          }}
          onUploadError={(err) => { toast.error(err.message ?? "Upload failed"); }}
          appearance={{
            button: "bg-[var(--primary)] text-white rounded-[10px] px-5 h-11 text-sm font-medium",
            allowedContent: "text-xs text-[var(--text-muted)] mt-2",
          }}
        />
      </div>

      {/* Hidden inputs so parent form can read URLs */}
      {files.map((f, idx) => (
        <input key={f.url} type="hidden" name={idx === 0 ? "primaryImageUrl" : "imageUrls"} value={f.url} />
      ))}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((f, idx) => (
            <div key={f.url} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-(--border)">
              <Image src={f.url} alt={f.name} fill className="object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">Cover</span>
              )}
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white"
                onClick={() => remove(f.url)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
