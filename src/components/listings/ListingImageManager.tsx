"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, GripVertical, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ListingImage = {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
};

type ListingImageManagerProps = {
  listingId: string;
  listingStatus: string;
  onImageCountChange?: (count: number) => void;
};

export function ListingImageManager({
  listingId,
  listingStatus,
  onImageCountChange,
}: ListingImageManagerProps) {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const isReadOnly = listingStatus === "PENDING_REVIEW";

  const loadImagesCallback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}/images`);
      if (!response.ok) throw new Error("Failed to load images");
      const data = await response.json();
      setImages(data.images || []);
      onImageCountChange?.(data.images?.length || 0);
    } catch (error) {
      toast.error("Failed to load images");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [listingId, onImageCountChange]);

  useEffect(() => {
    loadImagesCallback();
  }, [loadImagesCallback]);



  async function setAsCover(imageId: string) {
    try {
      setUpdating(true);
      const updates = images.map((img) => ({
        id: img.id,
        isPrimary: img.id === imageId,
      }));

      const response = await fetch(`/api/listings/${listingId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUpdates: updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update cover");
      }

      const data = await response.json();
      setImages(data.images || []);
      toast.success("Cover photo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update cover");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  async function deleteImage(imageId: string) {
    try {
      setUpdating(true);
      const response = await fetch(`/api/listings/${listingId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete image");
      }

      const data = await response.json();
      setImages(data.images || []);
      onImageCountChange?.(data.images?.length || 0);
      toast.success("Image removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete image");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  async function reorderImages(sourceIndex: number, targetIndex: number) {
    if (sourceIndex === targetIndex || isReadOnly) return;

    try {
      setUpdating(true);
      const nextImages = [...images];
      const [movedImage] = nextImages.splice(sourceIndex, 1);
      nextImages.splice(targetIndex, 0, movedImage);

      // Rebuild order
      const updates = nextImages.map((img, idx) => ({
        id: img.id,
        order: idx,
      }));

      const response = await fetch(`/api/listings/${listingId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUpdates: updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder images");
      }

      const data = await response.json();
      setImages(data.images || []);
      toast.success("Images reordered");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reorder images");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    if (isReadOnly) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent) {
    if (isReadOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    if (isReadOnly) return;
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(sourceIndex)) {
      reorderImages(sourceIndex, targetIndex);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-(--text-muted)" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="rounded-(--radius) border border-(--border) bg-white px-4 py-6 text-center">
        <p className="text-sm text-(--text-muted)">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isReadOnly && (
        <div className="rounded-(--radius) border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          &⏳ Image editing is disabled while this listing is under review. Changes will be available once it&apos;s approved.
        </div>
      )}

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, idx) => (
          <div
            key={image.id}
            draggable={!isReadOnly}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            onDragLeave={() => setDraggedOver(null)}
            className={`relative aspect-square overflow-hidden rounded-lg border transition-all ${
              draggedOver === idx ? "border-2 border-(--accent)" : "border-(--border)"
            } ${!isReadOnly ? "cursor-move" : ""}`}
          >
            <Image src={image.url} alt={image.alt || "Listing photo"} fill className="object-cover" />

            {/* Cover badge */}
            {image.isPrimary && (
              <div className="absolute left-1 top-1 rounded-full bg-(--accent) px-2 py-0.5 text-xs font-semibold text-(--primary) flex items-center gap-1 z-10">
                <Star className="h-3 w-3 fill-current" /> Cover
              </div>
            )}

            {/* Drag handle */}
            {!isReadOnly && images.length > 1 && (
              <button
                type="button"
                className="absolute left-1 bottom-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white hover:bg-[rgba(0,0,0,0.75)] z-20"
                title="Drag to reorder"
                tabIndex={-1}
              >
                <GripVertical className="h-3 w-3" />
              </button>
            )}

            {/* Set as cover button */}
            {!isReadOnly && !image.isPrimary && (
              <button
                type="button"
                onClick={() => setAsCover(image.id)}
                disabled={updating}
                className="absolute right-1 bottom-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1.5 text-white hover:bg-[rgba(0,0,0,0.75)] disabled:opacity-60 z-20"
                title="Set as cover photo"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Delete button */}
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => deleteImage(image.id)}
                disabled={updating}
                className="absolute right-1 top-1 rounded-full bg-[rgba(0,0,0,0.55)] p-1 text-white hover:bg-[rgba(0,0,0,0.75)] disabled:opacity-60 z-20"
                title="Delete image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
