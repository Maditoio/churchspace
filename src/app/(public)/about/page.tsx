import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ChurchSpaces",
  description:
    "Learn how ChurchSpaces helps ministries and congregations find church buildings to rent or buy, conference spaces, and youth ministry venues across South Africa.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[980px] space-y-8 px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">About ChurchSpaces</h1>
      <p className="text-[var(--text-secondary)]">
        ChurchSpaces is a purpose-built marketplace for church property. We help ministries and congregations find church buildings to rent,
        list church buildings for sale, and discover conference spaces and youth ministry venues that support real community impact.
      </p>
      <p className="text-[var(--text-secondary)]">
        Our platform is designed for churches that need practical venue options without guesswork. Every listing is structured with details that matter:
        property type, location, images, availability, and contact channels. This makes it easier to compare worship venues, halls, full premises,
        and conference rooms before you commit.
      </p>
      <section className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
        <h2 className="font-display text-3xl text-[var(--text-primary)]">What We Help You Find</h2>
        <ul className="mt-4 space-y-2 text-[var(--text-secondary)]">
          <li>Church buildings for rent for weekly services and events</li>
          <li>Church property for sale for long-term ministry growth</li>
          <li>Conference spaces for leadership, training, and workshops</li>
          <li>Youth-friendly venues for church youth programs and gatherings</li>
        </ul>
      </section>
    </div>
  );
}
