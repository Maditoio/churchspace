import { Input } from "@/components/ui/Input";

const features = [
  "wheelchair_accessible",
  "air_conditioning",
  "kitchen",
  "toilets",
  "wifi",
  "projector_screen",
  "streaming_setup",
  "baby_room",
  "ablution_facilities",
  "security_guard",
  "cctv",
];

export function Step3Details() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input name="congregationSize" type="number" placeholder="Congregation capacity" />
        <Input name="areaSquareMeters" type="number" placeholder="Area (m2)" />
        <Input name="parkingSpaces" type="number" placeholder="Parking spaces" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {features.map((feature) => (
          <label key={feature} className="rounded-lg border border-[var(--border)] p-3 text-sm">
            <input type="checkbox" name="features" value={feature} className="mr-2" />
            {feature.replace(/_/g, " ")}
          </label>
        ))}
      </div>
    </div>
  );
}
