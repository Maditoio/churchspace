"use client";

import { put } from "@vercel/blob/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/forms/listing/StepProgress";
import { Step1BasicInfo } from "@/components/forms/listing/Step1BasicInfo";
import { Step2Location } from "@/components/forms/listing/Step2Location";
import { Step3Details } from "@/components/forms/listing/Step3Details";
import { Step4Equipment } from "@/components/forms/listing/Step4Equipment";
import { Step5Pricing } from "@/components/forms/listing/Step5Pricing";
import { Step6Photos } from "@/components/forms/listing/Step6Photos";
import { Step7Review } from "@/components/forms/listing/Step7Review";

const steps = [Step1BasicInfo, Step2Location, Step3Details, Step4Equipment, Step5Pricing, Step6Photos, Step7Review];
const UPLOAD_TIMEOUT_MS = 120_000;

type UploadTokenResponse = {
  clientToken?: string;
  error?: unknown;
};

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

async function getClientToken(pathname: string) {
  const response = await fetch("/api/blob/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: {
        pathname,
        clientPayload: null,
        multipart: false,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as UploadTokenResponse | null;

  if (!response.ok || !data?.clientToken) {
    const detail = data?.error ? stringifyErrorDetail(data.error) : `HTTP ${response.status}`;
    throw new Error(`Token generation failed: ${detail}`);
  }

  return data.clientToken;
}

async function uploadFileToBlob(file: File) {
  const pathname = `listings/${Date.now()}-${sanitizeFileName(file.name)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const clientToken = await getClientToken(pathname);
    const blob = await put(pathname, file, {
      access: "public",
      token: clientToken,
      ...(file.type ? { contentType: file.type } : {}),
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
  const router = useRouter();

  function preventEnterSubmit(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter") {
      const target = event.target as HTMLElement;
      const isTextArea = target instanceof HTMLTextAreaElement;
      if (!isTextArea) {
        event.preventDefault();
      }
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < 7) {
      setStep(7);
      toast.info("Please review your listing, then click Submit for Review.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const listingType = formData.getAll("listingType").map(String);
    const features = formData.getAll("features").map(String);
    const equipment = formData.getAll("equipment").map(String);
    const filesToUpload = formData
      .getAll("listingFiles")
      .filter((value): value is File => value instanceof File && value.size > 0);

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
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
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("Please sign in before creating a listing.");
        router.push("/signin?callbackUrl=/dashboard/listings/new");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiErrorShape | null;
        toast.error(getApiErrorMessage(payload, "Could not submit listing for review."));
        return;
      }

      const { listing } = await response.json();

      const imageUrls: string[] = [];
      const uploadErrors: string[] = [];

      if (filesToUpload.length > 0) {
        for (const file of filesToUpload) {
          try {
            const uploadedUrl = await uploadFileToBlob(file);
            imageUrls.push(uploadedUrl);
          } catch (error) {
            const reason = error instanceof Error ? error.message : "Unknown upload error";
            uploadErrors.push(`${file.name}: ${reason}`);
          }
        }

        if (uploadErrors.length > 0) {
          const more = uploadErrors.length > 1 ? ` (+${uploadErrors.length - 1} more)` : "";
          toast.error(`Image upload failed. ${uploadErrors[0]}${more}`);
        }
      }

      if (listing?.id && imageUrls.length > 0) {
        const imagesResponse = await fetch(`/api/listings/${listing.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: imageUrls.map((url, index) => ({
              url,
              isPrimary: index === 0,
              order: index,
            })),
          }),
        });

        if (!imagesResponse.ok) {
          const payload = (await imagesResponse.json().catch(() => null)) as ApiErrorShape | null;
          toast.error(getApiErrorMessage(payload, "Listing was created, but uploaded photos could not be attached to this listing."));
          return;
        }
      }

      if (uploadErrors.length > 0) {
        toast.success("Listing submitted for review, but some images failed to upload.");
      } else {
        toast.success("Listing submitted for review.");
      }
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--accent-strong)">ChurchSpace Studio</p>
          <h1 className="font-display text-5xl leading-none text-foreground md:text-6xl">Create a Listing</h1>
          <p className="mt-3 max-w-2xl text-sm text-(--text-secondary)">Present your space with better detail, stronger pricing context, and cleaner visuals before it goes to review.</p>
        </div>
        <div className="rounded-full border border-(--border-strong) bg-white/80 px-4 py-2 text-xs font-medium text-(--text-secondary) shadow-(--shadow-sm)">
          Step {step} of 7
        </div>
      </div>

      <form
        noValidate
        onSubmit={submit}
        onKeyDown={preventEnterSubmit}
        className="overflow-hidden rounded-(--radius-xl) border border-(--border-strong) bg-white/92 p-5 shadow-(--shadow-lg) backdrop-blur md:p-8"
      >
        <StepProgress step={step} />
        <div className="mt-8 rounded-(--radius-lg) bg-[linear-gradient(180deg,rgba(246,246,241,0.7),rgba(255,255,255,0.96))] p-5 md:p-7">
          {steps.map((StepComponent, index) => {
            const currentStep = index + 1;
            return (
              <div
                key={currentStep}
                className={currentStep === step ? "block" : "hidden"}
                aria-hidden={currentStep === step ? undefined : true}
              >
                <StepComponent />
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-(--border) pt-6">
          <Button type="button" variant="secondary" onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
            Back
          </Button>
          {step < 7 ? (
            <Button type="button" variant="accent" onClick={() => setStep((prev) => Math.min(7, prev + 1))}>
              Next Step
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}