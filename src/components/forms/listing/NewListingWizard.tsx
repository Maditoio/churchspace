"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/forms/listing/StepProgress";
import { Step1BasicInfo } from "@/components/forms/listing/Step1BasicInfo";
import { Step2Location } from "@/components/forms/listing/Step2Location";
import { Step3Details } from "@/components/forms/listing/Step3Details";
import { Step4Equipment } from "@/components/forms/listing/Step4Equipment";
import { Step5Pricing } from "@/components/forms/listing/Step5Pricing";
import { Step6Photos, type ImageFileWithOrder } from "@/components/forms/listing/Step6Photos";
import { Step7Review } from "@/components/forms/listing/Step7Review";

const steps = [Step1BasicInfo, Step2Location, Step3Details, Step4Equipment, Step5Pricing, Step6Photos, Step7Review];
const UPLOAD_TIMEOUT_MS = 120_000;

type ApiErrorShape = {
  error?:
    | string
    | {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
};

function getApiErrorMessage(payload: ApiErrorShape | null, fallback: string) {
  if (!payload?.error) return fallback;
  if (typeof payload.error === "string") return payload.error;

  const firstFormError = payload.error.formErrors?.find(Boolean);
  if (firstFormError) return firstFormError;

  const firstFieldError = Object.values(payload.error.fieldErrors ?? {})
    .flat()
    .find(Boolean);
  return firstFieldError ?? fallback;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function stringifyErrorDetail(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") return JSON.stringify(error);
  return "Unknown error";
}

async function uploadFileToBlob(file: File) {
  const pathname = `listings/${Date.now()}-${sanitizeFileName(file.name)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      ...(file.type ? { contentType: file.type } : {}),
      multipart: file.size > 5 * 1024 * 1024,
      abortSignal: controller.signal,
    });

    return blob.url;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Upload timed out after 120s");
    }

    if (error instanceof Error && error.message === "Failed to fetch") {
      throw new Error("Blob API request failed (network/CORS or rejected upstream)");
    }

    throw new Error(stringifyErrorDetail(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

export function NewListingWizard() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [imageMetadata, setImageMetadata] = useState<Map<string, ImageFileWithOrder>>(new Map());
  const [uploadedFilesSignature, setUploadedFilesSignature] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, completed: 0, currentFileName: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function getSelectedFiles(form: HTMLFormElement) {
    const formData = new FormData(form);
    return formData
      .getAll("listingFiles")
      .filter((value): value is File => value instanceof File && value.size > 0);
  }

  function buildFilesSignature(files: File[]) {
    return files
      .map((file) => `${file.name}:${file.size}:${file.lastModified}`)
      .join("|");
  }

  function handleImageOrderChanged(images: ImageFileWithOrder[]) {
    // Store the image metadata for later use during submission
    const metadata = new Map<string, ImageFileWithOrder>();
    images.forEach((img) => {
      metadata.set(img.id, img);
    });
    setImageMetadata(metadata);
  }

  function resetUploadedPhotos() {
    setUploadedImageUrls([]);
    setImageMetadata(new Map());
    setUploadedFilesSignature(null);
    setUploadProgress({ total: 0, completed: 0, currentFileName: "" });
  }

  async function uploadPhotosForReview() {
    const form = formRef.current;
    if (!form) return null;

    const filesToUpload = getSelectedFiles(form);
    if (filesToUpload.length === 0) {
      resetUploadedPhotos();
      return [];
    }

    const nextSignature = buildFilesSignature(filesToUpload);
    if (uploadedFilesSignature === nextSignature && uploadedImageUrls.length === filesToUpload.length) {
      return uploadedImageUrls;
    }

    setUploadingPhotos(true);
    setUploadedImageUrls([]);
    setUploadedFilesSignature(null);
    setUploadProgress({ total: filesToUpload.length, completed: 0, currentFileName: "" });

    try {
      const imageUrls: string[] = [];
      const uploadErrors: string[] = [];

      for (const [index, file] of filesToUpload.entries()) {
        setUploadProgress({ total: filesToUpload.length, completed: index, currentFileName: file.name });
        try {
          const uploadedUrl = await uploadFileToBlob(file);
          imageUrls.push(uploadedUrl);
          setUploadProgress({ total: filesToUpload.length, completed: index + 1, currentFileName: file.name });
        } catch (error) {
          const reason = error instanceof Error ? error.message : "Unknown upload error";
          uploadErrors.push(`${file.name}: ${reason}`);
        }
      }

      if (uploadErrors.length > 0) {
        const more = uploadErrors.length > 1 ? ` (+${uploadErrors.length - 1} more)` : "";
        toast.error(`Image upload failed. ${uploadErrors[0]}${more}`);
        return null;
      }

      setUploadedImageUrls(imageUrls);
      setUploadedFilesSignature(nextSignature);
      setUploadProgress({ total: filesToUpload.length, completed: filesToUpload.length, currentFileName: "" });
      toast.success(`${filesToUpload.length} photo${filesToUpload.length > 1 ? "s" : ""} uploaded. Continue to review.`);
      return imageUrls;
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function handleNextStep() {
    if (step === 6) {
      const uploaded = await uploadPhotosForReview();
      if (uploaded) {
        setStep(7);
      }
      return;
    }

    setStep((prev) => Math.min(7, prev + 1));
  }

  function preventEnterSubmit(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      const target = event.target as HTMLElement;
      const isTextArea = target instanceof HTMLTextAreaElement;
      if (!isTextArea) {
        event.preventDefault();
      }
    }
  }

  async function handleSubmitClick() {
    if (step !== 7) return;

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const confirmAccuracy = formData.get("confirmAccuracy");
    if (confirmAccuracy !== "on") {
      toast.error("Please confirm the listing information is accurate before submitting.");
      return;
    }

    const listingType = formData.getAll("listingType").map(String);
    const features = formData.getAll("features").map(String);
    const equipment = formData.getAll("equipment").map(String);
    const filesToUpload = getSelectedFiles(form);

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      videoUrl: String(formData.get("videoUrl") ?? "").trim() || undefined,
      propertyType: String(formData.get("propertyType") ?? "OTHER"),
      listingType,
      address: String(formData.get("address") ?? ""),
      suburb: String(formData.get("suburb") ?? ""),
      city: String(formData.get("city") ?? ""),
      province: String(formData.get("province") ?? ""),
      country: String(formData.get("country") ?? "South Africa"),
      congregationSize: Number(formData.get("congregationSize") || 0) || undefined,
      areaSquareMeters: Number(formData.get("areaSquareMeters") || 0) || undefined,
      parkingSpaces: Number(formData.get("parkingSpaces") || 0) || undefined,
      features,
      equipment,
      rentPricePerHour: Number(formData.get("rentPricePerHour") || 0) || undefined,
      rentPricePerDay: Number(formData.get("rentPricePerDay") || 0) || undefined,
      rentPricePerMonth: Number(formData.get("rentPricePerMonth") || 0) || undefined,
      salePrice: Number(formData.get("salePrice") || 0) || undefined,
      depositAmount: Number(formData.get("depositAmount") || 0) || undefined,
      availabilityType: String(formData.get("availabilityType") ?? "BY_REQUEST"),
      availableFrom: String(formData.get("availableFrom") ?? "") || undefined,
      availableTo: String(formData.get("availableTo") ?? "") || undefined,
    };

    setSubmitting(true);
    try {
      const fileSignature = buildFilesSignature(filesToUpload);
      const hasPreparedUploads = filesToUpload.length === 0 || (uploadedFilesSignature === fileSignature && uploadedImageUrls.length === filesToUpload.length);

      let imageUrls = uploadedImageUrls;
      if (!hasPreparedUploads) {
        const uploaded = await uploadPhotosForReview();
        if (!uploaded) {
          setStep(6);
          return;
        }
        imageUrls = uploaded;
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          images: imageUrls.map((url, index) => {
            // Try to find metadata for this image
            // The imageMetadata map keys are based on file ID (name:lastModified)
            // For now, use the order from metadata or fall back to index
            let isPrimary = false;
            let order = index;
            
            // Find metadata entry for this upload
            for (const metadata of imageMetadata.values()) {
              if (metadata.order === index) {
                isPrimary = metadata.isPrimary;
                order = metadata.order;
                break;
              }
            }
            
            // If no metadata, use first image as primary
            if (imageMetadata.size === 0) {
              isPrimary = index === 0;
            }
            
            return {
              url,
              alt: payload.title,
              isPrimary,
              order,
            };
          }),
        }),
      });

      if (response.status === 401) {
        toast.error("Please sign in before creating a listing.");
        router.push("/signin?callbackUrl=/dashboard/listings/new");
        return;
      }

      if (!response.ok) {
        const responsePayload = (await response.json().catch(() => null)) as ApiErrorShape | null;
        toast.error(getApiErrorMessage(responsePayload, "Could not submit listing for review."));
        return;
      }

      await response.json();


      toast.success("Listing submitted for review. We will notify you once the review is complete.");
      router.push("/dashboard/listings");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--accent-strong)">ChurchSpaces Studio</p>
          <h1 className="font-display text-5xl leading-none text-foreground md:text-6xl">Create a Listing</h1>
          <p className="mt-3 max-w-2xl text-sm text-(--text-secondary)">Present your space with better detail, stronger pricing context, and cleaner visuals before it goes to review.</p>
        </div>
        <div className="rounded-full border border-(--border-strong) bg-white/80 px-4 py-2 text-xs font-medium text-(--text-secondary) shadow-(--shadow-sm)">
          Step {step} of 7
        </div>
      </div>

      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => event.preventDefault()}
        onKeyDown={preventEnterSubmit}
        className="overflow-hidden rounded-xl border border-(--border-strong) bg-white/92 p-5 shadow-(--shadow-lg) backdrop-blur md:p-8"
      >
        <StepProgress step={step} />
        <div className="mt-8 rounded-lg bg-[linear-gradient(180deg,rgba(246,246,241,0.7),rgba(255,255,255,0.96))] p-5 md:p-7">
          {steps.map((StepComponent, index) => {
            const currentStep = index + 1;
            return (
              <div
                key={currentStep}
                className={currentStep === step ? "block" : "hidden"}
                aria-hidden={currentStep === step ? undefined : true}
              >
                {currentStep === 6 ? (
                  <Step6Photos
                    isUploading={uploadingPhotos}
                    uploadCompletedCount={uploadProgress.completed}
                    uploadTotalCount={uploadProgress.total}
                    uploadPercentage={uploadProgress.total > 0 ? Math.round((uploadProgress.completed / uploadProgress.total) * 100) : 0}
                    currentFileName={uploadProgress.currentFileName}
                    uploadedImageUrls={uploadedImageUrls}
                    onFilesChanged={() => {
                      if (uploadedImageUrls.length > 0 || uploadedFilesSignature) {
                        resetUploadedPhotos();
                      }
                    }}
                    onImageOrderChanged={handleImageOrderChanged}
                  />
                ) : currentStep === 7 ? (
                  <Step7Review
                    confirmAccuracy={confirmAccuracy}
                    onConfirmAccuracyChange={setConfirmAccuracy}
                  />
                ) : (
                  <StepComponent />
                )}
              </div>
            );
          })}
        </div>
        {uploadProgress.total > 0 && step !== 6 && (
          <div className="mt-6 rounded-(--radius) border border-(--border) bg-(--surface-raised) px-4 py-3">
            <div className="flex items-center justify-between text-xs font-medium text-(--text-secondary)">
              <span>
                {uploadingPhotos
                  ? `Uploading photos (${uploadProgress.completed}/${uploadProgress.total})`
                  : `Photos uploaded (${uploadProgress.completed}/${uploadProgress.total})`}
              </span>
              <span>{Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--border)">
              <div
                className="h-full rounded-full bg-(--accent) transition-all duration-300"
                style={{ width: `${Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%` }}
              />
            </div>
            {uploadingPhotos && uploadProgress.currentFileName && (
              <p className="mt-2 truncate text-xs text-(--text-muted)">Uploading {uploadProgress.currentFileName}</p>
            )}
          </div>
        )}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-(--border) pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={submitting || uploadingPhotos}
          >
            Back
          </Button>
          {step < 7 ? (
            <Button type="button" variant="accent" onClick={handleNextStep} disabled={submitting || uploadingPhotos}>
              {step === 6
                ? uploadingPhotos
                  ? `Uploading ${uploadProgress.completed}/${uploadProgress.total}...`
                  : "Upload Photos & Continue"
                : "Next Step"}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmitClick} disabled={submitting || uploadingPhotos || !confirmAccuracy}>
              {submitting ? "Submitting listing..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}