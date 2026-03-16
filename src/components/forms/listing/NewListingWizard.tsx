"use client";

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

export function NewListingWizard() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const listingType = formData.getAll("listingType").map(String);
    const features = formData.getAll("features").map(String);
    const equipment = formData.getAll("equipment").map(String);
    const primaryImageUrl = String(formData.get("primaryImageUrl") ?? "").trim();
    const additionalImageUrls = formData
      .getAll("imageUrls")
      .map(String)
      .map((value) => value.trim())
      .filter(Boolean);
    const imageUrls = [primaryImageUrl, ...additionalImageUrls].filter(Boolean);

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
        toast.error("Could not submit listing for review.");
        return;
      }

      const { listing } = await response.json();

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
          toast.error("Listing was created, but photos could not be attached.");
          return;
        }
      }

      toast.success("Listing submitted for review.");
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

      <form noValidate onSubmit={submit} className="overflow-hidden rounded-(--radius-xl) border border-(--border-strong) bg-white/92 p-5 shadow-(--shadow-lg) backdrop-blur md:p-8">
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