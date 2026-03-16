import { Card } from "@/components/ui/Card";

type StatsCardProps = { label: string; value: string | number; hint?: string };

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="font-display text-5xl text-[var(--primary)]">{value}</p>
      {hint ? <p className="text-xs text-[var(--text-secondary)]">{hint}</p> : null}
    </Card>
  );
}
