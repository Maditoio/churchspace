import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ChurchSpaces",
  description:
    "Contact ChurchSpaces for help finding a church building to rent or buy, listing church property, or sourcing conference and youth ministry spaces.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-20 md:px-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Get in Touch</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
        We are here to help you find or list church spaces across South Africa. Reach us through any of the channels below.
      </p>

      <div className="mt-12 space-y-10">
        {/* General enquiries */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">General Enquiries</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">Email</span>
              <a href="mailto:hello@churchspaces.church" className="text-sm text-[var(--primary)] hover:underline">hello@churchspaces.church</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">Phone</span>
              <a href="tel:+27766767752" className="text-sm text-[var(--text-primary)]">+27 76 676 7752</a>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)]" />

        {/* Support */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Support</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">Email</span>
              <a href="mailto:support@churchspaces.church" className="text-sm text-[var(--primary)] hover:underline">support@churchspaces.church</a>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-16 shrink-0 text-xs text-[var(--text-muted)]">Hours</span>
              <p className="text-sm text-[var(--text-secondary)]">Monday – Friday, 08:00 – 17:00 SAST</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)]" />

        {/* Address */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Head Office</p>
          <div className="mt-4">
            <p className="text-sm text-[var(--text-primary)]">Craddock Square, Rosebank</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">169 Oxford Road, Rosebank</p>
            <p className="text-sm text-[var(--text-secondary)]">Johannesburg, 2196</p>
            <p className="text-sm text-[var(--text-secondary)]">South Africa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
