"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";

type UploadedFile = { url: string; name: string };

const MAX_FILES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function Step6Photos() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function remove(url: string) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  async function onSelectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots = MAX_FILES - files.length;
    if (remainingSlots <= 0) {
      toast.error(`You can upload up to ${MAX_FILES} photos.`);
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      toast.error(`${oversized.name} is larger than 8MB.`);
      event.target.value = "";
      return;
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > filesToUpload.length) {
      toast.error(`Only ${remainingSlots} more photo${remainingSlots > 1 ? "s" : ""} can be added.`);
    }

    setUploading(true);

    try {
      const uploadedFiles = await Promise.all(
        filesToUpload.map(async (file) => {
          const pathname = `listings/${Date.now()}-${sanitizeFileName(file.name)}`;
          const blob = await upload(pathname, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            multipart: true,
          });

          return {
            url: blob.url,
            name: file.name,
          };
        }),
      );

      setFiles((prev) => [...prev, ...uploadedFiles].slice(0, MAX_FILES));
      toast.success(`${uploadedFiles.length} photo${uploadedFiles.length > 1 ? "s" : ""} uploaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[var(--text-primary)]">Upload listing photos (up to 20)</p>
      <div className="rounded-(--radius) border border-dashed border-(--border) bg-(--surface-raised) p-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
        <button
          type="button"
          className="h-11 rounded-[10px] bg-[var(--primary)] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || files.length >= MAX_FILES}
        >
          {uploading ? "Uploading..." : files.length >= MAX_FILES ? "Photo Limit Reached" : "Choose Photos"}
        </button>
        <p className="mt-2 text-xs text-[var(--text-muted)]">PNG, JPG, WEBP up to 8MB each. Maximum 20 photos.</p>
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
