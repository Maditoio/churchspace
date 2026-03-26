import { AlertTriangle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "File a Dispute | ChurchSpaces",
  description:
    "Report a listing issue, payment problem, or user conduct concern to the ChurchSpaces team. We investigate all disputes within 2–3 business days.",
};

const disputeTypes = [
  {
    value: "listing",
    label: "Listing Dispute",
    description: "Inaccurate description, misleading images, fraudulent or unavailable listing",
  },
  {
    value: "payment",
    label: "Payment Dispute",
    description: "Double charge, payment not reflected, fee discrepancy, or billing error",
  },
  {
    value: "conduct",
    label: "User Conduct",
    description: "Harassment, spam, impersonation, or misuse of enquiry tools",
  },
  {
    value: "content",
    label: "Inappropriate Content",
    description: "Offensive, illegal, or misleading content in a listing or profile",
  },
  {
    value: "other",
    label: "Other",
    description: "Any other concern not covered by the categories above",
  },
];

const steps = [
  {
    number: "01",
    title: "Submit this form",
    description: "Describe the issue in as much detail as possible, including listing URLs, reference numbers, or screenshots where available.",
  },
  {
    number: "02",
    title: "We acknowledge receipt",
    description: "You will receive a confirmation email at the address you provide within 1 business day.",
  },
  {
    number: "03",
    title: "Investigation begins",
    description: "Our team reviews the dispute, may contact involved parties, and gathers relevant platform records.",
  },
  {
    number: "04",
    title: "Resolution communicated",
    description: "We aim to resolve disputes within 2–3 business days and will notify you of the outcome via email.",
  },
];

export default function DisputesPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] md:text-5xl">File a Dispute</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            Our team investigates all disputes fairly and aims to resolve them within 2&ndash;3 business days.
            Use the form or contact us directly.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            For payment disputes, requests should be submitted within 7 days of payment. Listing fees are non-refundable once approved and published.
          </p>
        </div>

        {/* Direct contact bar */}
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-[20px] border border-[var(--border)] bg-white p-5 text-sm shadow-[var(--shadow-sm)]">
          <p className="font-medium text-[var(--text-primary)]">Prefer to contact us directly?</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:hello@churchspaces.church?subject=Dispute%20-%20ChurchSpaces"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              <Mail className="h-4 w-4" />
              hello@churchspaces.church
            </a>
            <a
              href="tel:+27766767752"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-2 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
            >
              <Phone className="h-4 w-4" />
              +27 76 676 7752
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
              <h2 className="mb-6 text-xl font-semibold text-[var(--text-primary)]">Dispute Details</h2>
              <form
                action="mailto:hello@churchspaces.church"
                method="GET"
                className="space-y-5"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Your Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Full name"
                      className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Phone / WhatsApp (optional)</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+27 xx xxx xxxx"
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Dispute Type</label>
                  <select
                    name="type"
                    required
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  >
                    <option value="">Select a category</option>
                    {disputeTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Listing URL or Reference Number <span className="font-normal text-[var(--text-tertiary)]">(if applicable)</span>
                  </label>
                  <input
                    name="reference"
                    type="text"
                    placeholder="e.g. https://churchspaces.co.za/listings/... or PAYSTACK-abc123"
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Describe the Issue</label>
                  <textarea
                    name="body"
                    required
                    rows={6}
                    placeholder="Please describe what happened in as much detail as possible. Include dates, amounts, screenshots if available, and any steps you have already taken to resolve this."
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
                  />
                </div>

                <div className="rounded-[12px] bg-[var(--surface-raised)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
                  By submitting this form you agree that ChurchSpaces may contact the parties involved to investigate your dispute in accordance with our <Link href="/user-policy" className="font-medium text-[var(--primary)] hover:underline">User Policy</Link> and <Link href="/privacy-policy" className="font-medium text-[var(--primary)] hover:underline">Privacy Policy</Link>.
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
                >
                  Submit Dispute
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Process */}
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <h3 className="mb-5 text-base font-semibold text-[var(--text-primary)]">How it works</h3>
              <ol className="space-y-5">
                {steps.map((step) => (
                  <li key={step.number} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                      {step.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Dispute types */}
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">What can be disputed?</h3>
              <p className="mb-4 text-xs leading-5 text-[var(--text-secondary)]">Office location: Johannesburg, Craddock Square Rosebank, 169 Oxford Road, Rosebank, Craddock Square, Johannesburg, 2196.</p>
              <ul className="space-y-3">
                {disputeTypes.map((t) => (
                  <li key={t.value}>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{t.label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t.description}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom nav */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/support" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
            ← Back to Support
          </Link>
          <Link href="/refund-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
            Refund Policy
          </Link>
          <Link href="/disclaimer" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
            Disclaimer
          </Link>
          <Link href="/user-policy" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]">
            User Policy
          </Link>
        </div>

      </div>
    </main>
  );
}
