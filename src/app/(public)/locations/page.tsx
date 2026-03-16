import type { Metadata } from "next";
import Link from "next/link";
import { AFRICA_LOCATIONS, FEATURED_COUNTRIES } from "@/lib/locations";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Church Buildings Across Africa",
  description:
    "Browse church buildings to rent or buy, conference spaces, halls, and youth ministry venues across Africa. Find church property in South Africa, Nigeria, Kenya, Ghana and more.",
  alternates: {
    canonical: "/locations",
  },
};

export default function LocationsPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-16 md:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-(--accent-strong)">Locations</p>
        <h1 className="mt-2 font-display text-5xl text-[var(--text-primary)] md:text-6xl">
          Church Buildings Across Africa
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          ChurchSpace serves faith communities across the entire African continent. Browse church buildings for rent or sale, conference venues, and youth
          ministry spaces by country and city. Whether your ministry is in South Africa, Nigeria, Kenya, Ghana, or beyond — find the right space here.
        </p>
      </div>

      <section>
        <h2 className="font-display text-3xl text-[var(--text-primary)]">Featured Countries</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {FEATURED_COUNTRIES.map((country) => (
            <Link
              key={country}
              href={`/locations/${slugify(country)}`}
              className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
            >
              <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-strong)]">{country}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{(AFRICA_LOCATIONS[country] ?? []).length} cities</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl text-[var(--text-primary)]">All Countries</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(AFRICA_LOCATIONS).map(([country, cities]) => (
            <div key={country} className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-5">
              <Link
                href={`/locations/${slugify(country)}`}
                className="font-display text-2xl text-[var(--text-primary)] hover:text-[var(--accent-strong)]"
              >
                {country}
              </Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city}
                    href={`/locations/${slugify(country)}/${slugify(city)}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
        <h2 className="font-display text-3xl text-[var(--text-primary)]">List Your Church Space Anywhere in Africa</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          ChurchSpace welcomes listings from every country in Africa. Whether you manage a church building in Lagos, a conference centre in Nairobi, a
          worship hall in Accra, or a youth venue in Cape Town — publishing your property on ChurchSpace connects you with thousands of
          ministries and congregations searching for space right now.
        </p>
        <Link
          href="/dashboard/listings/new"
          className="mt-4 inline-block rounded-[10px] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          List Your Space
        </Link>
      </section>
    </div>
  );
}
