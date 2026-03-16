const items = [
  "microphones",
  "pa_system",
  "speakers",
  "piano_keyboard",
  "drum_kit",
  "guitar_amps",
  "projector",
  "led_screen",
  "mixing_desk",
  "stage_lighting",
  "video_camera",
  "live_streaming_equipment",
];

export function Step4Equipment() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <label key={item} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
          <input type="checkbox" name="equipment" value={item} className="mr-2" />
          {item.replace(/_/g, " ")}
        </label>
      ))}
    </div>
  );
}
