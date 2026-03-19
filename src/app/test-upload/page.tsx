"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function TestUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setStatus("idle");
    setProgress(0);
    setUploadedUrl(null);
    setErrorMessage(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage("Only image files are supported.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 8 MB.`);
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setFileName(file.name);
    setUploadedUrl(null);
    setErrorMessage(null);

    const pathname = `listings/test-upload-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;

    try {
      const simulateProgress = setInterval(() => {
        setProgress((prev) => Math.min(prev + 8, 85));
      }, 300);

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        multipart: file.size > 5 * 1024 * 1024,
      });

      clearInterval(simulateProgress);
      setProgress(100);
      setUploadedUrl(blob.url);
      setStatus("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--accent-strong)">Dev Tool</p>
        <h1 className="font-display text-4xl text-foreground">Test Image Upload</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Upload a single image to Vercel Blob and preview the result. Requires you to be signed in.
        </p>
      </div>

      <div className="rounded-xl border border-(--border-strong) bg-white/92 p-6 shadow-(--shadow-lg) backdrop-blur">
        {/* Drop zone / trigger */}
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-(--border) bg-(--surface-raised) px-6 py-12 text-center transition hover:border-(--primary) hover:bg-(--primary-soft)"
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-3xl">🖼️</span>
          <p className="text-sm font-medium text-(--text-secondary)">Click to choose an image</p>
          <p className="text-xs text-(--text-muted)">PNG, JPG, WEBP, GIF — up to 8 MB</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Progress bar */}
        {(status === "uploading" || status === "success") && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-medium text-(--text-secondary)">
              <span>
                {status === "uploading" ? `Uploading ${fileName ?? ""}…` : "Upload complete"}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--border)">
              <div
                className="h-full rounded-full bg-(--accent) transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Success result */}
        {status === "success" && uploadedUrl && (
          <div className="mt-5 space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-(--border)">
              <Image src={uploadedUrl} alt="Uploaded" fill className="object-contain" />
            </div>
            <div className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">Blob URL</p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs text-(--primary) underline"
              >
                {uploadedUrl}
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          {status !== "uploading" && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 rounded-[10px] bg-(--primary) px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "success" ? "Upload Another" : "Choose File"}
            </button>
          )}
          {status !== "idle" && status !== "uploading" && (
            <button
              type="button"
              onClick={reset}
              className="rounded-[10px] border border-(--border) bg-white px-4 py-2.5 text-sm font-medium text-(--text-secondary) hover:bg-(--surface-raised)"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
