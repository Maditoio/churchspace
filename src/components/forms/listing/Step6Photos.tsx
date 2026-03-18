"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function Step6Photos() {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const input = inputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  }

  function remove(index: number) {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(nextFiles);
    syncInputFiles(nextFiles);
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
    event.target.value = "";

    toast.success(`${filesToKeep.length} photo${filesToKeep.length > 1 ? "s" : ""} ready for upload on submit`);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">Select listing photos (upload happens after you click Submit)</p>
      <div className="rounded-(--radius) border border-dashed border-(--border) bg-(--surface-raised) p-8 text-center">
        <input
          ref={inputRef}
          type="file"
          name="listingFiles"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
        <button
          type="button"
          className="h-11 rounded-[10px] bg-[var(--primary)] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= MAX_FILES}
        >
          {files.length >= MAX_FILES ? "Photo Limit Reached" : "Choose Photos"}
        </button>
        <p className="mt-2 text-xs text-[var(--text-muted)]">PNG, JPG, WEBP up to 8MB each. Maximum 20 photos. Upload starts only after final submit.</p>
      </div>

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
                className="absolute right-1 top-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white"
                onClick={() => remove(idx)}
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
