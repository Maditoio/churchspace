type Step7ReviewProps = {
  confirmAccuracy: boolean;
  onConfirmAccuracyChange: (checked: boolean) => void;
};

export function Step7Review({ confirmAccuracy, onConfirmAccuracyChange }: Step7ReviewProps) {
  return (
    <div className="space-y-4 rounded-(--radius) border border-(--border) p-4">
      <p className="text-sm text-(--text-secondary)">Review all listing details before submission.</p>
      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="confirmAccuracy"
          checked={confirmAccuracy}
          onChange={(event) => onConfirmAccuracyChange(event.target.checked)}
          required
        />
        I confirm this information is accurate.
      </label>
      <p className="text-xs text-(--text-muted)">Your listing will be reviewed within 24 hours.</p>
    </div>
  );
}
