import Link from "next/link";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface-raised)] p-10 text-center">
      <div className="mx-auto mb-4 h-10 w-10 rounded-full border border-[var(--accent)] bg-[var(--accent-light)] text-lg leading-10 text-[var(--accent)]">
        ✝
      </div>
      <h3 className="font-display text-3xl text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-secondary)]">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="mt-6 inline-block">
          <Button variant="accent">{ctaLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
