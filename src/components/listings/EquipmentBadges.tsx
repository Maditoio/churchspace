import { Badge } from "@/components/ui/Badge";

export function EquipmentBadges({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item.replace(/_/g, " ")}</Badge>
      ))}
    </div>
  );
}
