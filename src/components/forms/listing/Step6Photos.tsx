"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

type Step6PhotosProps = {
  isUploading?: boolean;
  uploadCompletedCount?: number;
  uploadTotalCount?: number;
  uploadPercentage?: number;
  currentFileName?: string;
  uploadedImageUrls?: string[];
  onFilesChanged?: () => void;
};

export function Step6Photos({
  isUploading = false,
  uploadCompletedCount = 0,
  uploadTotalCount = 0,
  uploadPercentage = 0,
  currentFileName = "",
  uploadedImageUrls = [],
  onFilesChanged,
}: Step6PhotosProps) {
  const [files, setFiles] = useState<File[]>([]);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => files.map((file) => ({ id: `${file.name}-${file.lastModified}`, file, previewUrl: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previews]);

  function syncInputFiles(nextFiles: File[]) {
    const input = formInputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  }

  function remove(index: number) {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(nextFiles);
    syncInputFiles(nextFiles);
    onFilesChanged?.();
  }

  function onSelectFiles(event: React.ChangeEvent<HTMLInputElement>) {
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

    const filesToKeep = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > filesToKeep.length) {
      toast.error(`Only ${remainingSlots} more photo${remainingSlots > 1 ? "s" : ""} can be added.`);
    }

    const mergedFiles = [...files, ...filesToKeep].slice(0, MAX_FILES);
    setFiles(mergedFiles);
    syncInputFiles(mergedFiles);
    onFilesChanged?.();
    event.target.value = "";

    toast.success(`${filesToKeep.length} photo${filesToKeep.length > 1 ? "s" : ""} added. Upload starts when you continue.`);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Select listing photos and upload them before your final review step.</p>
      <div className="rounded-(--radius) border border-dashed border-(--border) bg-(--surface-raised) p-8 text-center">
        <input
          ref={pickerInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
        <input ref={formInputRef} type="file" name="listingFiles" multiple className="hidden" tabIndex={-1} aria-hidden />
        <button
          type="button"
          className="h-11 rounded-[10px] bg-(--primary) px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => pickerInputRef.current?.click()}
          disabled={files.length >= MAX_FILES || isUploading}
        >
          {files.length >= MAX_FILES ? "Photo Limit Reached" : "Choose Photos"}
        </button>
        <p className="mt-2 text-xs text-(--text-muted)">PNG, JPG, WEBP up to 8MB each. Maximum 20 photos.</p>
      </div>

      {uploadTotalCount > 0 && (
        <div className="rounded-(--radius) border border-(--border) bg-white p-3">
          <div className="flex items-center justify-between text-xs text-(--text-secondary)">
            <span>{isUploading ? `Uploading photos (${uploadCompletedCount}/${uploadTotalCount})` : `Upload complete (${uploadCompletedCount}/${uploadTotalCount})`}</span>
            <span>{uploadPercentage}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--border)">
            <div className="h-full rounded-full bg-(--accent) transition-all duration-300" style={{ width: `${uploadPercentage}%` }} />
          </div>
          {isUploading && currentFileName && <p className="mt-2 truncate text-xs text-(--text-muted)">Uploading {currentFileName}</p>}
        </div>
      )}

      {uploadedImageUrls.length > 0 && (
        <div className="rounded-(--radius) border border-(--border) bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)">Uploaded Image URLs</p>
          <div className="mt-3 space-y-2">
            {uploadedImageUrls.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-xs text-(--primary) underline"
              >
                {index + 1}. {url}
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-(--text-muted)">These URLs will be stored in the ListingImage table when the listing is submitted.</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((item, idx) => (
            <div key={item.id} className="relative aspect-4/3 overflow-hidden rounded-lg border border-(--border)">
              <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-(--accent) px-2 py-0.5 text-xs font-semibold text-(--primary)">Cover</span>
              )}
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => remove(idx)}
                disabled={isUploading}
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
