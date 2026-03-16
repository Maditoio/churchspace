import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 md:px-8">
      <h1 className="font-display text-5xl text-[var(--text-primary)]">Contact ChurchSpace</h1>
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
