import { Input } from "@/components/ui/Input";

const countries = [
  "South Africa",
  "Botswana",
  "Namibia",
  "Zimbabwe",
  "Mozambique",
  "Zambia",
  "Kenya",
  "Nigeria",
  "Ghana",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "Brazil",
  "India",
  "Singapore",
  "United Arab Emirates",
];

export function Step2Location() {
  return (
    <div className="space-y-4">
      <Input name="address" placeholder="Street address" required />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="suburb" placeholder="Suburb" required />
        <Input name="city" placeholder="City" required />
        <Input name="province" placeholder="Province" required />
        <select
          name="country"
          defaultValue="South Africa"
          required
          className="h-11 w-full rounded-[8px] border border-[var(--border)] px-3"
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-raised)] p-6 text-sm text-[var(--text-secondary)]">Map preview will appear here after geocoding.</div>
    </div>
  );
}
