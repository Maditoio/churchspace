import Link from "next/link";

export const metadata = {
  title: "Refund Policy | ChurchSpaces",
  description:
    "Understand ChurchSpaces listing fee refund rules, including non-refundable published listings, exceptional refund cases, and dispute time windows.",
};

const sections = [
  {
    title: "1. Service Model",
    body: [
      "ChurchSpaces sells listing and advertising exposure services on the platform. We do not process rental escrow between property users and listing agents.",
      "Listing fees pay for listing publication, marketplace visibility, and related platform operations.",
    ],
  },
  {
    title: "2. Core Refund Rule",
    body: [
      "Listing fees are non-refundable once a listing has been approved and published on ChurchSpaces.",
      "By paying a listing fee, you acknowledge and accept this default non-refundable rule.",
    ],
  },
  {
    title: "3. Cases Where Refunds May Be Considered",
    body: [
      "A full refund may be considered if payment was taken but the listing was never published.",
      "A full refund may be considered if a duplicate charge is confirmed.",
      "A full refund may be considered if a listing is rejected by ChurchSpaces review after payment and publication never occurred.",
    ],
  },
  {
    title: "4. Cases Where Refunds Are Not Offered",
    body: [
      "No refund is offered for low views, low enquiries, low conversion, or no bookings/leads.",
      "No refund is offered where the agent changes their mind after publication.",
      "No refund is offered where the listing expires according to paid duration.",
      "No refund is offered for inaccurate information entered by the agent.",
      "No refund is offered where listings are removed or restricted due to policy or legal violations.",
    ],
  },
  {
    title: "5. Dispute Window",
    body: [
      "Payment disputes should be raised within 7 days of payment through the dashboard dispute tools or support channels.",
      "Submitting outside this window may result in rejection, except where required otherwise by applicable law.",
    ],
  },
  {
    title: "6. Decision Authority",
    body: [
      "Refund and dispute outcomes are determined by ChurchSpaces based on platform records, payment records, listing status logs, and policy compliance.",
      "Where legally permitted, final refund decisions are made at the sole discretion of ChurchSpaces.",
    ],
  },
  {
    title: "7. No Performance Guarantee",
    body: [
      "ChurchSpaces does not guarantee listing views, enquiries, bookings, occupancy, or revenue.",
      "Listing performance depends on market demand, listing quality, location, pricing, seasonality, and user behavior factors outside our control.",
    ],
  },
  {
    title: "8. Contact",
    body: [
      "For refund and payment dispute questions, contact hello@churchspaces.church or use the in-app dispute flow from your payment history.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="bg-[var(--background)] py-16 md:py-20">
      <section className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">Refund Policy</p>
          <h1 className="mt-4 font-display text-4xl text-[var(--text-primary)] md:text-5xl">Listing fee refund rules</h1>
          <p className="mt-5 text-base leading-7 text-[var(--text-secondary)] md:text-lg">
            This policy explains when listing fee refunds are and are not available on ChurchSpaces.
          </p>
          <div className="mt-6 rounded-[24px] bg-[var(--surface-raised)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
            <p><strong className="text-[var(--text-primary)]">Last updated:</strong> 26 March 2026</p>
            <p className="mt-2"><strong className="text-[var(--text-primary)]">Key rule:</strong> Once a listing is approved and published, the listing fee is non-refundable.</p>
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
            <Link href="/user-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read User Policy
            </Link>
            <Link href="/disclaimer" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
              Read Disclaimer
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