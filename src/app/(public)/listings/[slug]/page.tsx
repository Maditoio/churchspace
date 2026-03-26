import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EquipmentBadges } from "@/components/listings/EquipmentBadges";
import { AvailabilityGrid } from "@/components/listings/AvailabilityGrid";
import { ContactAgentCard } from "@/components/listings/ContactAgentCard";
import { ImageGallery } from "@/components/listings/ImageGallery";
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

  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-8">
      <div className="space-y-8">
        <ImageGallery images={listing.images} />
        <section>
          <h1 className="font-display text-5xl text-[var(--text-primary)]">{listing.title}</h1>
          <p className="mt-3 whitespace-pre-line text-[var(--text-secondary)]">{listing.description}</p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">Details</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] p-3">Type: {listing.propertyType.replace(/_/g, " ")}</div>
            <div className="rounded-lg border border-[var(--border)] p-3">Capacity: {listing.congregationSize ?? "-"}</div>
            <div className="rounded-lg border border-[var(--border)] p-3">Parking: {listing.parkingSpaces ?? "-"}</div>
            <div className="rounded-lg border border-[var(--border)] p-3">Area: {listing.areaSquareMeters ?? "-"} m2</div>
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">Equipment</h2>
          <EquipmentBadges items={(listing.equipment as string[]) ?? []} />
        </section>
        <section>
          <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">Availability</h2>
          <AvailabilityGrid slots={schedule} />
        </section>
        {videoEmbedUrl && (
          <section>
            <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">Property Video</h2>
            <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)]" style={{ paddingTop: "56.25%" }}>
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
          <h2 className="mb-3 font-display text-3xl text-[var(--text-primary)]">Map</h2>
          <iframe
            title="Property Location"
            className="h-80 w-full rounded-[var(--radius)] border border-[var(--border)]"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(listing.longitude ?? 28.0) - 0.03}%2C${(listing.latitude ?? -26.1) - 0.03}%2C${(listing.longitude ?? 28.0) + 0.03}%2C${(listing.latitude ?? -26.1) + 0.03}&layer=mapnik&marker=${listing.latitude ?? -26.1}%2C${listing.longitude ?? 28.0}`}
          />
        </section>
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
