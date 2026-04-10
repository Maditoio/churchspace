import type { Metadata } from "next";
import Link from "next/link";
import { SearchBar } from "@/components/listings/SearchBar";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://churchspaces.co.za";

export const metadata: Metadata = {
  title: "Church Buildings to Rent or Buy in South Africa",
  description:
    "Search church buildings to rent or buy, conference spaces, halls, and youth ministry venues on ChurchSpaces. Find verified church property listings across South Africa.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const session = await auth();
  const now = new Date();

  const featured = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      paymentStatus: "PAID",
      paymentExpiresAt: { gte: now },
      isTaken: false,
    },
    include: {
      images: true,
      agent: true,
      savedBy: session?.user?.id ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
    take: 6,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const listings = featured.map(mapListingToCard);
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ChurchSpaces",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ChurchSpaces",
    url: siteUrl,
    description:
      "ChurchSpaces helps churches and ministries find church buildings for rent or sale, conference venues, and youth ministry spaces.",
    areaServed: "South Africa",
    email: "hello@churchspaces.church",
    telephone: "+27 76 676 7752",
    address: {
      "@type": "PostalAddress",
      streetAddress: "169 Oxford Road, Rosebank, Craddock Square",
      addressLocality: "Johannesburg",
      postalCode: "2196",
      addressCountry: "ZA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@churchspaces.church",
      telephone: "+27 76 676 7752",
      areaServed: "ZA",
      availableLanguage: ["en"],
    },
  };

  return (
    <div className="space-y-20 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--border) py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(199,119,75,0.14),transparent_30%),linear-gradient(140deg,rgba(255,253,249,0.92),rgba(243,239,231,0.68))]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-[minmax(0,1.05fr)_380px] md:px-8">
          <div>
            <div className="inline-flex rounded-full border border-(--border) bg-white/86 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">
              ChurchSpaces
            </div>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.96] text-foreground md:text-7xl">
              Find the right worship and ministry space without the noise.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-(--text-secondary)">
              Search verified church buildings, halls, conference spaces, and full premises across South Africa.
            </p>
            <div className="mt-8 max-w-3xl">
              <SearchBar />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/listings"><Button variant="secondary">Browse Listings</Button></Link>
              <Link href="/dashboard/listings/new"><Button variant="outlineAccent">List Your Space</Button></Link>
            </div>
          </div>
          <aside className="rounded-xl border border-(--border) bg-white/90 p-6 shadow-(--shadow-sm)">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">Why ChurchSpaces</p>
            <div className="mt-5 space-y-4">
              {[
                ["Verified listings", "Structured details, clear photos, and direct contact channels."],
                ["Faith-focused", "Built for ministries, congregations, and sacred spaces."],
                ["Fast decisions", "Compare options quickly and connect with confidence."],
              ].map(([title, copy]) => (
                <div key={title} className="border-t border-(--border) pt-4">
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-(--text-secondary)">{copy}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl text-foreground">Featured Spaces</h2>
            <p className="mt-2 text-(--text-secondary)">A focused shortlist of active listings.</p>
          </div>
          <Link href="/listings" className="text-sm font-medium text-(--primary) hover:underline">View All Listings</Link>
        </div>
        <div className="mt-8"><PropertyGrid listings={listings} /></div>
      </section>

      {/* Simple Process */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-4xl text-foreground">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Search", copy: "Filter by location, property type, and listing purpose." },
            { title: "Connect", copy: "Send enquiries directly to listing owners in minutes." },
            { title: "Secure", copy: "Coordinate viewing, terms, and next steps with clarity." },
          ].map((step, idx) => (
            <article key={step.title} className="rounded-lg border border-(--border) bg-white/86 p-6 shadow-(--shadow-sm)">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--accent-strong)">Step {idx + 1}</p>
              <h3 className="mt-3 font-display text-3xl text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-(--text-secondary)">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-xl bg-[linear-gradient(135deg,rgba(18,49,43,1),rgba(20,66,58,0.96),rgba(199,119,75,0.78))] px-6 py-12 text-white shadow-(--shadow-lg) md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="font-display text-4xl">Ready to List Your Space?</h2>
            <p className="mt-2 text-white/80">Reach ministries, churches, and organisations looking for trusted venues.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/listings/new"><Button variant="accent">Start Listing</Button></Link>
            <Link href="/contact"><Button variant="secondary">Talk to Support</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
