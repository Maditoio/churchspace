import { Card } from "@/components/ui/Card";

type StatsCardProps = { label: string; value: string | number; hint?: string };

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-(--text-muted)">{label}</p>
      <p className="truncate font-display text-3xl text-(--primary)">{value}</p>
      {hint ? <p className="text-xs text-(--text-secondary)">{hint}</p> : null}
    </Card>
  );
}
