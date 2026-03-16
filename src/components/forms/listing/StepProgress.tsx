const labels = ["Basic", "Location", "Details", "Equipment", "Pricing", "Photos", "Review"];

export function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-8 grid grid-cols-7 gap-2">
      {labels.map((label, index) => {
        const state = index + 1;
        return (
          <div key={label} className="text-center">
            <div
              className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                step > state
                  ? "bg-[var(--accent)] text-[var(--primary)]"
                  : step === state
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-raised)] text-[var(--text-muted)]"
              }`}
            >
              {state}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
