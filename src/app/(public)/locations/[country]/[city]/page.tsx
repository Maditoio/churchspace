import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { AFRICA_LOCATIONS, allCityParams, slugToLabel } from "@/lib/locations";
import { slugify } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspace.co.za";

export async function generateStaticParams() {
  return allCityParams();
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; city: string }> }): Promise<Metadata> {
  const { country, city } = await params;
  const countryLabel = slugToLabel(country);
  const cityLabel = slugToLabel(city);
  return {
    title: `Church Buildings to Rent and Buy in ${cityLabel}, ${countryLabel}`,
    description: `Find church buildings for rent or sale, conference spaces, and youth venues in ${cityLabel}. Browse ChurchSpace listings for church property in ${cityLabel}, ${countryLabel}.`,
    keywords: [
      `church building to rent ${cityLabel}`,
      `church property for sale ${cityLabel}`,
      `conference space ${cityLabel}`,
      `youth ministry venue ${cityLabel}`,
      `church hall ${cityLabel}`,
      `worship venue ${cityLabel}`,
    ],
    alternates: { canonical: `/locations/${country}/${city}` },
    openGraph: {
      title: `Church Buildings in ${cityLabel} | ChurchSpace`,
      description: `Browse church property listings, conference rooms, and youth spaces in ${cityLabel}, ${countryLabel}.`,
      url: `${siteUrl}/locations/${country}/${city}`,
      type: "website",
    },
  };
}

export default async function CityPage({ params }: { params: Promise<{ country: string; city: string }> }) {
  const { country, city } = await params;
  const countryLabel = slugToLabel(country);
  const cityLabel = slugToLabel(city);
  const session = await auth();
  const now = new Date();

  const knownCountry = Object.keys(AFRICA_LOCATIONS).find(
    (c) => c.toLowerCase() === countryLabel.toLowerCase(),
  );
  if (!knownCountry) notFound();

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
      city: { contains: cityLabel, mode: "insensitive" },
      country: { equals: knownCountry, mode: "insensitive" },
    },
    include: {
      images: true,
      agent: true,
      savedBy: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Church Buildings in ${cityLabel}`,
    description: `Church buildings to rent, buy, and share in ${cityLabel}, ${knownCountry}.`,
    url: `${siteUrl}/locations/${country}/${city}`,
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-16 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Link href="/locations" className="hover:underline">Africa</Link>
        <span>/</span>
        <Link href={`/locations/${country}`} className="hover:underline">{knownCountry}</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{cityLabel}</span>
      </nav>

      <div>
        <h1 className="font-display text-5xl text-[var(--text-primary)] md:text-6xl">
          Church Buildings in {cityLabel}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          Search church buildings to rent, buy, or share in {cityLabel}, {knownCountry}. All listings include property details, photos, pricing, and direct
          contact with verified ministry agents. Browse sanctuaries, halls, conference rooms, vacant land, and full premises.
        </p>
      </div>

      <section>
        <h2 className="font-display text-3xl text-[var(--text-primary)]">
          {listings.length > 0
            ? `${listings.length} Church Listing${listings.length !== 1 ? "s" : ""} in ${cityLabel}`
            : `Church Spaces in ${cityLabel}`}
        </h2>
        <div className="mt-6">
          <PropertyGrid listings={listings.map(mapListingToCard)} />
          {listings.length === 0 && (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              No active listings in {cityLabel} yet.{" "}
              <Link href="/dashboard/listings/new" className="underline">
                Be the first to list your space.
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
        <h2 className="font-display text-3xl text-[var(--text-primary)]">Rent or Buy a Church Building in {cityLabel}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          ChurchSpace is the go-to platform for finding church property in {cityLabel}. Whether you need a weekly rental space for your congregation, a
          conference hall for ministry leadership events, a youth-friendly venue for church programs, or a church building to purchase — ChurchSpace connects
          you with trusted agents and ministry representatives across {knownCountry} and the rest of Africa.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/locations/${country}`}
            className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            More in {knownCountry}
          </Link>
          <Link
            href="/listings"
            className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Browse All Listings
          </Link>
          <Link
            href="/locations"
            className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            All Africa Locations
          </Link>
        </div>
      </section>
    </div>
  );
}
