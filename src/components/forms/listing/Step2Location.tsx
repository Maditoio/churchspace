import { Input } from "@/components/ui/Input";

export function Step2Location() {
  return (
    <div className="space-y-4">
      <Input name="address" placeholder="Street address" required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="suburb" placeholder="Suburb" required />
        <Input name="city" placeholder="City" required />
        <Input name="province" placeholder="Province" required />
        <Input name="country" defaultValue="South Africa" required />
      </div>
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] p-6 text-sm text-[var(--text-secondary)]">Map preview will appear here after geocoding.</div>
    </div>
  );
}
