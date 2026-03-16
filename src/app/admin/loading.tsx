export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--surface-raised)]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-(--radius) border border-(--border) bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-(--radius) border border-(--border) bg-white" />
    </div>
  );
}
