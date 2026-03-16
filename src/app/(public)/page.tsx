import Link from "next/link";
import { Church, Tv2, Users, Trees, Building2 } from "lucide-react";
import { SearchBar } from "@/components/listings/SearchBar";
import { PropertyGrid } from "@/components/listings/PropertyGrid";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapListingToCard } from "@/lib/listings";

const CATEGORIES = [
  { label: "Sanctuary", value: "SANCTUARY", Icon: Church },
  { label: "Hall", value: "HALL", Icon: Users },
  { label: "Conference Room", value: "CONFERENCE_ROOM", Icon: Tv2 },
  { label: "Vacant Land", value: "VACANT_LAND", Icon: Trees },
  { label: "Full Premises", value: "FULL_PREMISES", Icon: Building2 },
];

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

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--border) py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(199,119,75,0.18),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(18,49,43,0.16),transparent_32%),linear-gradient(135deg,rgba(255,253,249,0.92),rgba(243,239,231,0.68))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[minmax(0,1.1fr)_420px] md:px-8">
          <div className="py-6">
            <div className="inline-flex rounded-full border border-(--border-strong) bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-(--accent-strong) shadow-(--shadow-sm)">
              Modern church property exchange
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[0.94] text-foreground md:text-8xl">
              Find a space that feels ready before the first service starts.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-(--text-secondary) md:text-lg">
              ChurchSpace connects congregations, ministries, and faith-based organisations to spaces that are practical, dignified, and easy to evaluate.
            </p>
            <div className="mt-8 max-w-3xl"><SearchBar /></div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-(--text-secondary)">
              <span className="rounded-full border border-(--border) bg-white/84 px-4 py-2 shadow-(--shadow-sm)">Premium listing flows</span>
              <span className="rounded-full border border-(--border) bg-white/84 px-4 py-2 shadow-(--shadow-sm)">South Africa focused</span>
              <span className="rounded-full border border-(--border) bg-white/84 px-4 py-2 shadow-(--shadow-sm)">Rental, sale, and sharing</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 top-8 hidden h-32 w-32 rounded-full bg-(--accent-light) blur-2xl md:block" />
            <div className="relative overflow-hidden rounded-(--radius-xl) border border-(--border-strong) bg-[linear-gradient(180deg,rgba(18,49,43,0.96),rgba(11,34,28,0.94))] p-6 text-white shadow-(--shadow-lg)">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/60">Why teams convert faster</p>
              <div className="mt-6 grid gap-4">
                {[
                  ["Better presentation", "Clearer cards, warmer surfaces, stronger hierarchy."],
                  ["Trusted submissions", "Only signed-in users can create and manage listings."],
                  ["Faster screening", "Structured pricing, media, and review flow from day one."],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-(--radius-lg) border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <h3 className="font-display text-2xl">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/72">{copy}</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/listings/new" className="mt-6 inline-block"><Button variant="accent">List Your Space</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Cards */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-(--accent-strong)">Collections</p>
            <h2 className="mt-2 font-display text-4xl text-foreground">Browse by Type</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map(({ label, value, Icon }) => (
            <Link
              key={value}
              href={`/listings?type=${value}`}
              className="group flex flex-col items-center gap-3 rounded-(--radius-lg) border border-(--border) bg-white/88 p-5 shadow-(--shadow-sm) transition-all duration-200 hover:-translate-y-1 hover:border-(--accent) hover:shadow-(--shadow-md)"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-light) text-(--accent-strong) transition-colors group-hover:bg-(--primary) group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-center text-sm font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-4xl text-foreground">Featured Spaces</h2>
        <p className="mt-2 text-(--text-secondary)">Curated listings trusted by faith communities.</p>
        <div className="mt-8"><PropertyGrid listings={listings} /></div>
        <Link href="/listings" className="mt-8 inline-block"><Button variant="secondary">View All Listings</Button></Link>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-4xl text-foreground">How It Works</h2>
        <div className="relative mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "List", copy: "Create your church property listing in minutes with our guided form." },
            { title: "Connect", copy: "Receive enquiries from verified faith communities across South Africa." },
            { title: "Transact", copy: "Coordinate rentals, sales, or shared use with confidence." },
          ].map((step, idx) => (
            <div key={step.title} className="relative rounded-(--radius-lg) border border-(--border) bg-white/86 p-6 shadow-(--shadow-sm)">
              <p className="text-sm font-medium text-(--accent-strong)">Step {idx + 1}</p>
              <h3 className="mt-2 font-display text-3xl text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-(--text-secondary)">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-(--radius-xl) bg-[linear-gradient(135deg,rgba(18,49,43,1),rgba(20,66,58,0.96),rgba(199,119,75,0.86))] px-6 py-12 text-white shadow-(--shadow-lg) md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="font-display text-4xl">List Your Church Space Today</h2>
            <p className="mt-2 text-white/80">Reach trusted faith communities around South Africa.</p>
          </div>
          <Link href="/dashboard/listings/new"><Button variant="accent">Start Listing</Button></Link>
        </div>
      </section>
    </div>
  );
}
