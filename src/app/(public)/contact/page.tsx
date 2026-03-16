import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Contact ChurchSpace",
  description:
    "Contact ChurchSpace for help finding a church building to rent or buy, listing church property, or sourcing conference and youth ministry spaces.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Contact ChurchSpace</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
        Need help finding a church building to rent, buying church property, or shortlisting conference and youth ministry venues? Send us a message and
        our team will help you move faster.
      </p>
      <form className="mt-8 space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-white p-6">
        <Input placeholder="Your name" />
        <Input type="email" placeholder="Email" />
        <Input placeholder="Subject" />
        <textarea className="min-h-36 w-full rounded-[8px] border border-[var(--border)] p-3" placeholder="How can we help?" />
        <Button variant="accent">Send Message</Button>
      </form>
    </div>
  );
}
