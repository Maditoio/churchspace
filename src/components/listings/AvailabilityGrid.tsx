type Slot = { day: string; startTime: string; endTime: string; isAvailable: boolean };

export function AvailabilityGrid({ slots }: { slots: Slot[] }) {
  if (!slots?.length) {
    return <p className="text-sm text-[var(--text-muted)]">Availability is by request.</p>;
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {slots.map((slot) => (
        <div key={`${slot.day}-${slot.startTime}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
          <p className="font-medium text-[var(--text-primary)]">{slot.day}</p>
          <p className="text-[var(--text-secondary)]">{slot.startTime} - {slot.endTime}</p>
          <p className={slot.isAvailable ? "text-[var(--success)]" : "text-[var(--destructive)]"}>
            {slot.isAvailable ? "Available" : "Booked"}
          </p>
        </div>
      ))}
    </div>
  );
}
