import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Users, Car, Ruler, Clock, CalendarRange } from "lucide-react";
import { EquipmentBadges } from "@/components/listings/EquipmentBadges";
import { AvailabilityGrid } from "@/components/listings/AvailabilityGrid";
import { ContactAgentCard } from "@/components/listings/ContactAgentCard";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ReportListingButton } from "@/components/listings/ReportListingButton";
import { Avatar } from "@/components/ui/Avatar";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspaces.co.za";

function getYouTubeEmbedUrl(url: string | null | undefined) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("/")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const now = new Date();
  const listing = await prisma.listing.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
    },
    include: { images: true },
  });
  if (!listing) return { title: "Listing Not Found | ChurchSpaces" };
  const description = listing.description.slice(0, 160);
  const listingUrl = `${siteUrl}/listings/${listing.slug}`;
  const title = `${listing.title} | ChurchSpaces`;

  return {
    title,
    description,
    keywords: [
      "church building to rent",
      "church property for sale",
      "conference space",
      "youth ministry venue",
      listing.city,
      listing.suburb,
      listing.propertyType.replace(/_/g, " "),
    ],
    alternates: {
      canonical: listingUrl,
    },
    openGraph: {
      title,
      description,
      url: listingUrl,
      type: "article",
      images: listing.images[0]?.url ? [listing.images[0].url] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const now = new Date();
  const listing = await prisma.listing.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
    },
    include: { images: true, agent: true },
  });

  if (!listing) notFound();

  const schedule = Array.isArray(listing.sharingSchedule)
    ? (listing.sharingSchedule as { day: string; startTime: string; endTime: string; isAvailable: boolean }[])
    : [];
  const videoEmbedUrl = getYouTubeEmbedUrl(listing.videoUrl);
  const equipment = (listing.equipment as string[]) ?? [];

  const propertyTypeLabel = listing.propertyType.replace(/_/g, " ");

  const availabilityLabel =
    listing.availabilityType === "ALWAYS"
      ? "Always Available"
      : listing.availabilityType === "SCHEDULED"
        ? "Scheduled Availability"
        : "By Request";
  const availabilityColor =
    listing.availabilityType === "ALWAYS"
      ? "text-(--success) bg-(--success-light)"
      : listing.availabilityType === "SCHEDULED"
        ? "text-(--warning) bg-(--warning-light)"
        : "text-(--text-secondary) bg-(--surface-raised)";

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-8">
      <div className="space-y-8">
        <ImageGallery images={listing.images} />
        <section>
          <h1 className="font-display text-5xl text-foreground">{listing.title}</h1>
          {/* Agent byline */}
          <div className="mt-3 flex items-center gap-2">
            <Avatar src={listing.agent.avatarThumb ?? listing.agent.avatar} name={listing.agent.name} size={30} />
            <span className="text-sm text-(--text-secondary)">
              Listed by <span className="font-medium text-foreground">{listing.agent.name ?? "Agent"}</span>
              {listing.agent.churchName ? ` · ${listing.agent.churchName}` : ""}
            </span>
          </div>
          <p className="mt-4 whitespace-pre-line text-(--text-secondary)">{listing.description}</p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-3xl text-foreground">Details</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-(--border) p-3">
              <Building2 className="h-4 w-4 shrink-0 text-(--text-muted)" />
              <span className="text-sm"><span className="text-(--text-muted)">Type: </span>{propertyTypeLabel}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-(--border) p-3">
              <Users className="h-4 w-4 shrink-0 text-(--text-muted)" />
              <span className="text-sm"><span className="text-(--text-muted)">Capacity: </span>{listing.congregationSize ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-(--border) p-3">
              <Car className="h-4 w-4 shrink-0 text-(--text-muted)" />
              <span className="text-sm"><span className="text-(--text-muted)">Parking: </span>{listing.parkingSpaces ?? "—"}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-(--border) p-3">
              <Ruler className="h-4 w-4 shrink-0 text-(--text-muted)" />
              <span className="text-sm"><span className="text-(--text-muted)">Area: </span>{listing.areaSquareMeters ? `${listing.areaSquareMeters} m²` : "—"}</span>
            </div>
          </div>
        </section>

        {equipment.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-3xl text-foreground">Equipment</h2>
            <EquipmentBadges items={equipment} />
          </section>
        )}

        <section>
          <h2 className="mb-3 font-display text-3xl text-foreground">Availability</h2>
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${availabilityColor}`}>
            {listing.availabilityType === "ALWAYS" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CalendarRange className="h-4 w-4" />
            )}
            {availabilityLabel}
          </div>
          {listing.availableFrom || listing.availableTo ? (
            <p className="mb-3 text-sm text-(--text-secondary)">
              {listing.availableFrom && (
                <span>From {new Date(listing.availableFrom).toLocaleDateString("en-ZA", { dateStyle: "medium" })}</span>
              )}
              {listing.availableFrom && listing.availableTo && " — "}
              {listing.availableTo && (
                <span>Until {new Date(listing.availableTo).toLocaleDateString("en-ZA", { dateStyle: "medium" })}</span>
              )}
            </p>
          ) : null}
          <AvailabilityGrid slots={schedule} />
        </section>

        {videoEmbedUrl && (
          <section>
            <h2 className="mb-3 font-display text-3xl text-foreground">Property Video</h2>
            <div className="relative overflow-hidden rounded-(--radius) border border-(--border)" style={{ paddingTop: "56.25%" }}>
              <iframe
                title="Property Video"
                className="absolute inset-0 h-full w-full"
                src={videoEmbedUrl}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        )}
        <section>
          <h2 className="mb-3 font-display text-3xl text-foreground">Map</h2>
          <iframe
            title="Property Location"
            className="h-80 w-full rounded-(--radius) border border-(--border)"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(listing.longitude ?? 28.0) - 0.03}%2C${(listing.latitude ?? -26.1) - 0.03}%2C${(listing.longitude ?? 28.0) + 0.03}%2C${(listing.latitude ?? -26.1) + 0.03}&layer=mapnik&marker=${listing.latitude ?? -26.1}%2C${listing.longitude ?? 28.0}`}
          />
        </section>

        <div className="border-t border-(--border) pt-4">
          <ReportListingButton listingId={listing.id} />
        </div>
      </div>
      <ContactAgentCard
        listing={{ id: listing.id, title: listing.title, slug: listing.slug, suburb: listing.suburb, city: listing.city }}
        agent={{
          name: listing.agent.name,
          churchName: listing.agent.churchName,
          denomination: listing.agent.denomination,
          email: listing.agent.email,
          whatsapp: listing.agent.whatsapp,
          avatar: listing.agent.avatarThumb ?? listing.agent.avatar,
        }}
      />
    </div>
  );
}
