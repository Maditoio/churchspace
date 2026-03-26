"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, GripVertical, Star, Info } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export type ImageFileWithOrder = {
  id: string;
  file: File;
  previewUrl: string;
  order: number;
  isPrimary: boolean;
};

type Step6PhotosProps = {
  isUploading?: boolean;
  uploadCompletedCount?: number;
  uploadTotalCount?: number;
  uploadPercentage?: number;
  currentFileName?: string;
  uploadedImageUrls?: string[];
  onFilesChanged?: () => void;
  onImageOrderChanged?: (images: ImageFileWithOrder[]) => void;
};

export function Step6Photos({
  isUploading = false,
  uploadCompletedCount = 0,
  uploadTotalCount = 0,
  uploadPercentage = 0,
  currentFileName = "",
  uploadedImageUrls = [],
  onFilesChanged,
  onImageOrderChanged,
}: Step6PhotosProps) {
  const [files, setFiles] = useState<ImageFileWithOrder[]>([]);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const previews = useMemo(
    () =>
      files.map((item, idx) => ({
        ...item,
        previewUrl: item.previewUrl || URL.createObjectURL(item.file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [previews]);

  function syncInputFiles(nextFiles: ImageFileWithOrder[]) {
    const input = formInputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    nextFiles.forEach((item) => dataTransfer.items.add(item.file));
    input.files = dataTransfer.files;
    
    // Notify parent about reordered files with metadata
    onImageOrderChanged?.(nextFiles);
  }

  function remove(index: number) {
    const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
    
    // Rebuild primary: if removed was primary, make first image primary
    if (files[index].isPrimary && nextFiles.length > 0) {
      nextFiles[0].isPrimary = true;
    }
    
    // Reset order values
    const reordered = nextFiles.map((item, idx) => ({ ...item, order: idx }));
    
    setFiles(reordered);
    syncInputFiles(reordered);
    onFilesChanged?.();
  }

  function setAsCover(index: number) {
    const nextFiles = files.map((item, idx) => ({
      ...item,
      isPrimary: idx === index,
    }));
    setFiles(nextFiles);
    syncInputFiles(nextFiles);
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOver(targetIndex);
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    setDraggedOver(null);
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;

    const nextFiles = [...files];
    const [movedItem] = nextFiles.splice(sourceIndex, 1);
    nextFiles.splice(targetIndex, 0, movedItem);

    // Update order values
    const reordered = nextFiles.map((item, idx) => ({ ...item, order: idx }));
    
    setFiles(reordered);
    syncInputFiles(reordered);
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

    const newImages: ImageFileWithOrder[] = filesToKeep.map((file, idx) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      order: files.length + idx,
      isPrimary: files.length === 0 && idx === 0, // First image is primary
    }));

    const mergedFiles = [...files, ...newImages].slice(0, MAX_FILES);
    setFiles(mergedFiles);
    syncInputFiles(mergedFiles);
    onFilesChanged?.();
    event.target.value = "";

    toast.success(`${filesToKeep.length} photo${filesToKeep.length > 1 ? "s" : ""} added. Upload starts when you continue.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-full border border-(--border) bg-white px-3 py-1 text-xs font-semibold text-(--text-secondary)">
          {files.length} / {MAX_FILES} Selected
        </div>
        <button
          type="button"
          onClick={() => setShowInfoDialog(true)}
          className="p-1.5 text-(--text-secondary) hover:text-(--accent) transition-colors"
          title="View photo upload information"
          aria-label="View photo upload information"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Info Dialog */}
      {showInfoDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-(--radius) bg-white p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Photo Upload Requirements</h3>
              <button
                type="button"
                onClick={() => setShowInfoDialog(false)}
                className="p-1 text-(--text-secondary) hover:text-(--text-primary)"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-foreground">
              <div>
                <p className="font-medium text-(--text-primary)">Maximum Photos</p>
                <p className="text-(--text-secondary)">{MAX_FILES} photos total</p>
              </div>
              <div>
                <p className="font-medium text-(--text-primary)">File Size</p>
                <p className="text-(--text-secondary)">8MB maximum per photo</p>
              </div>
              <div>
                <p className="font-medium text-(--text-primary)">Accepted Formats</p>
                <p className="text-(--text-secondary)">PNG, JPG, WEBP</p>
              </div>
              <div>
                <p className="font-medium text-(--text-primary)">Important</p>
                <p className="text-(--text-secondary)">Photos cannot be changed after submitting for review. Please confirm your order and cover image before continuing.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoDialog(false)}
              className="mt-4 w-full rounded-(--radius) bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="rounded-(--radius) border border-dashed border-(--border) bg-[radial-gradient(circle_at_top,rgba(206,138,60,0.10),transparent_65%),var(--surface-raised)] p-8 text-center">
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
      </div>

      {uploadTotalCount > 0 && (
        <div className="rounded-(--radius) border border-(--border) bg-white p-4">
          <div className="flex items-center justify-between text-xs text-(--text-secondary)">
            <span className="font-semibold">{isUploading ? `Uploading photos (${uploadCompletedCount}/${uploadTotalCount})` : `Upload complete (${uploadCompletedCount}/${uploadTotalCount})`}</span>
            <span>{uploadPercentage}%</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-(--border)">
            <div className="h-full rounded-full bg-(--accent) transition-all duration-300" style={{ width: `${uploadPercentage}%` }} />
          </div>
          {isUploading && currentFileName && <p className="mt-2 truncate text-xs text-(--text-muted)">Uploading {currentFileName}</p>}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((item, idx) => (
            <div
              key={item.id}
              draggable={!isUploading}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragLeave={() => setDraggedOver(null)}
              className={`relative aspect-4/3 overflow-hidden rounded-lg border transition-all ${
                draggedOver === idx ? "border-2 border-(--accent) bg-(--surface-raised)" : "border-(--border)"
              } ${!isUploading ? "cursor-move" : ""}`}
            >
              <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />

              {/* Cover badge */}
              {item.isPrimary && (
                <div className="absolute left-1 top-1 rounded-full bg-(--accent) px-2 py-0.5 text-xs font-semibold text-(--primary) flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> Cover
                </div>
              )}

              {/* Upload status badge */}
              {isUploading && idx >= uploadCompletedCount && (
                <div className="absolute inset-x-0 bottom-1 mx-1 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold text-white">
                  {idx === uploadCompletedCount ? "Uploading" : "Queued"}
                </div>
              )}
              {!isUploading && uploadTotalCount > 0 && idx < uploadCompletedCount && (
                <div className="absolute inset-x-0 bottom-1 mx-1 rounded bg-emerald-600/85 px-2 py-1 text-[10px] font-semibold text-white">
                  Uploaded
                </div>
              )}

              {/* Drag handle - visible when not uploading */}
              {!isUploading && files.length > 1 && (
                <button
                  type="button"
                  className="absolute left-1 bottom-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white hover:bg-[rgba(0,0,0,0.75)]"
                  title="Drag to reorder"
                  tabIndex={-1}
                >
                  <GripVertical className="h-3 w-3" />
                </button>
              )}

              {/* Set as cover button - visible when not uploading and not already cover */}
              {!isUploading && !item.isPrimary && (
                <button
                  type="button"
                  onClick={() => setAsCover(idx)}
                  className="absolute right-1 bottom-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1.5 text-white hover:bg-[rgba(0,0,0,0.75)] transition-colors"
                  title="Set as cover photo"
                  aria-label="Set as cover photo"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Remove button */}
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[rgba(0,0,0,0.75)] transition-colors"
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
