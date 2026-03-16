import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { AFRICA_LOCATIONS, allCountryParams, slugToLabel } from "@/lib/locations";
import { slugify } from "@/lib/utils";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspace.co.za";

export async function generateStaticParams() {
  return allCountryParams();
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const countryLabel = slugToLabel(country);
  return {
    title: `Church Buildings to Rent and Buy in ${countryLabel}`,
    description: `Find church buildings for rent or sale, conference spaces, church halls, and youth ministry venues in ${countryLabel}. Browse verified church property listings on ChurchSpace.`,
    keywords: [
      `church building to rent in ${countryLabel}`,
      `church buildings for sale ${countryLabel}`,
      `church property ${countryLabel}`,
      `conference space church ${countryLabel}`,
      `youth ministry venue ${countryLabel}`,
    ],
    alternates: { canonical: `/locations/${country}` },
    openGraph: {
      title: `Church Buildings for Rent and Sale in ${countryLabel} | ChurchSpace`,
      description: `Browse church buildings, conference spaces, and youth ministry venues across ${countryLabel}.`,
    },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const countryLabel = slugToLabel(country);
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

  const cityCounts = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.city] = (acc[l.city] ?? 0) + 1;
    return acc;
  }, {});

  // Merge DB cities with known cities from AFRICA_LOCATIONS so links always exist
  const knownCities = AFRICA_LOCATIONS[knownCountry] ?? [];
  const allCities = Array.from(new Set([...Object.keys(cityCounts), ...knownCities]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Church Buildings in ${knownCountry}`,
    description: `Find church buildings for rent, sale, and ministry use in ${knownCountry}.`,
    url: `${siteUrl}/locations/${country}`,
  };

  return (
    <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-16 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <Link href="/locations" className="hover:underline">Africa</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">{knownCountry}</span>
      </nav>

      <div>
        <h1 className="font-display text-5xl text-[var(--text-primary)] md:text-6xl">
          Church Buildings in {knownCountry}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          Discover church buildings to rent or buy, conference spaces, church halls, and youth ministry venues across {knownCountry}. Browse verified
          listings from registered agents and ministry representatives on ChurchSpace.
        </p>
      </div>

      <section>
        <h2 className="font-display text-3xl text-[var(--text-primary)]">Browse Cities in {knownCountry}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {allCities.map((city) => (
            <Link
              key={city}
              href={`/locations/${country}/${slugify(city)}`}
              className="rounded-full border border-[var(--border)] bg-white px-5 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            >
              {city}
              {cityCounts[city] ? (
                <span className="ml-1 text-xs text-[var(--text-secondary)]">({cityCounts[city]})</span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl text-[var(--text-primary)]">
          {listings.length > 0
            ? `${listings.length} Listing${listings.length !== 1 ? "s" : ""} in ${knownCountry}`
            : `Church Spaces in ${knownCountry}`}
        </h2>
        <div className="mt-6">
          <PropertyGrid listings={listings.map(mapListingToCard)} />
          {listings.length === 0 && (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              No listings in {knownCountry} yet.{" "}
              <Link href="/dashboard/listings/new" className="underline">
                Be the first to list your space.
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
        <h2 className="font-display text-3xl text-[var(--text-primary)]">
          Looking for a Church Space in {knownCountry}?
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          ChurchSpace is the go-to platform for church property in {knownCountry}. Whether you need a weekly rental space for your congregation, a
          conference hall for ministry leadership events, a youth-friendly venue for your programs, or a church building to purchase outright — ChurchSpace
          connects you with trusted agents and ministries across {knownCountry} and the rest of Africa.
        </p>
      </section>
    </div>
  );
}
