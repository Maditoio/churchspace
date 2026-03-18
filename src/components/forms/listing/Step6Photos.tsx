"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";

type UploadedFile = { url: string; name: string };

const MAX_FILES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 90_000;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getUploadErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Upload timed out. Please try again with a smaller image or better connection.";
  }

  if (error instanceof Error && error.message === "Failed to fetch") {
    return "Upload request was rejected by Vercel Blob. Please try again in a few seconds.";
  }

  return error instanceof Error ? error.message : "Upload failed";
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
      const uploadedFiles: UploadedFile[] = [];
      const failedFiles: string[] = [];

      for (const file of filesToUpload) {
        const pathname = `listings/${Date.now()}-${sanitizeFileName(file.name)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

        try {
          const blob = await upload(pathname, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            contentType: file.type,
            abortSignal: controller.signal,
          });

          uploadedFiles.push({ url: blob.url, name: file.name });
        } catch (error) {
          failedFiles.push(file.name);
          toast.error(`${file.name}: ${getUploadErrorMessage(error)}`);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      if (uploadedFiles.length > 0) {
        setFiles((prev) => [...prev, ...uploadedFiles].slice(0, MAX_FILES));
        toast.success(`${uploadedFiles.length} photo${uploadedFiles.length > 1 ? "s" : ""} uploaded`);
      }

      if (failedFiles.length > 0 && uploadedFiles.length === 0) {
        toast.error("No photos were uploaded. Please try again.");
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Upload listing photos (up to 20)</p>
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
            <div key={f.url} className="relative aspect-4/3 overflow-hidden rounded-lg border border-(--border)">
              <Image src={f.url} alt={f.name} fill className="object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-(--accent) px-2 py-0.5 text-xs font-semibold text-(--primary)">Cover</span>
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
