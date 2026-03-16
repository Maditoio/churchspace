export default function ListingsLoading() {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-16 md:grid-cols-[300px_1fr] md:px-8">
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[var(--surface-raised)]" />
        <div className="h-80 animate-pulse rounded-(--radius) bg-[var(--surface-raised)]" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-(--radius) border border-(--border) bg-white shadow-[var(--shadow-sm)]">
            <div className="aspect-[16/9] animate-pulse bg-[var(--surface-raised)]" />
            <div className="space-y-3 p-4">
              <div className="flex gap-2">
                <div className="h-5 w-12 animate-pulse rounded-full bg-[var(--surface-raised)]" />
                <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--surface-raised)]" />
              </div>
              <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--surface-raised)]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--surface-raised)]" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-[var(--surface-raised)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
