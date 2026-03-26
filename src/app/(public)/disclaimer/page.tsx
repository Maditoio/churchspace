import Link from "next/link";

export const metadata = {
  title: "Disclaimer | ChurchSpaces",
  description:
    "Read ChurchSpaces legal disclaimers on listing performance, no-result guarantees, listing accuracy responsibility, and platform rights.",
};

const sections = [
  {
    title: "1. Marketplace Role",
    body: [
      "ChurchSpaces is a listing and marketplace platform for church-related property advertising and discovery.",
      "ChurchSpaces is not a property broker, rental guarantor, legal adviser, or escrow provider for rental agreements.",
    ],
  },
  {
    title: "2. No Performance Guarantee",
    body: [
      "ChurchSpaces does not guarantee views, leads, enquiries, bookings, occupancy, conversions, or revenue from listings.",
      "Any examples, analytics, trends, or visibility metrics are informational and do not create guaranteed outcomes.",
    ],
  },
  {
    title: "3. Listing Accuracy Responsibility",
    body: [
      "Agents and listing owners are solely responsible for the accuracy, legality, and completeness of listing content.",
      "Users should independently verify all property details before making financial or operational decisions.",
    ],
  },
  {
    title: "4. Moderation and Removal Rights",
    body: [
      "ChurchSpaces may review, restrict, suspend, unpublish, or remove listings that breach policy, legal requirements, or safety standards.",
      "Where permitted by law and policy, policy-enforcement actions may occur without refund.",
    ],
  },
  {
    title: "5. Third-Party Services",
    body: [
      "Payments, hosting, and communications may involve third-party providers. ChurchSpaces is not liable for third-party outages, delays, or provider-side failures outside our reasonable control.",
    ],
  },
  {
    title: "6. Limitation",
    body: [
      "To the extent permitted by law, ChurchSpaces disclaims liability for indirect or consequential losses arising from listing performance expectations, user conduct, listing inaccuracies, or third-party provider behavior.",
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <main className="bg-[var(--background)] py-16 md:py-20">
      <section className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Disclaimer</p>
          <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Important platform disclaimers</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
            These disclaimers clarify ChurchSpaces&apos; platform role, limits, and responsibilities.
          </p>
          <div className="mt-6 rounded-[24px] bg-[var(--surface-raised)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Last updated:</strong> 26 March 2026</p>
          </div>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{section.title}</h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text-secondary)] md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-[var(--border)] pt-8">
            <Link href="/refund-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read Refund Policy
            </Link>
            <Link href="/user-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read User Policy
            </Link>
            <Link href="/support" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}