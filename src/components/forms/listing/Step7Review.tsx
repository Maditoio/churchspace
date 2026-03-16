export function Step7Review() {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">Review all listing details before submission.</p>
      <label className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
        <input type="checkbox" name="confirmAccuracy" required />
        I confirm this information is accurate.
      </label>
      <p className="text-xs text-[var(--text-muted)]">Your listing will be reviewed within 24 hours.</p>
    </div>
  );
}
