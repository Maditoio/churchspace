"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type QueryValue = string | number | null | undefined;

type PaginationControlsProps = {
  basePath?: string;
  className?: string;
  currentPage: number;
  itemLabel: string;
  onPageChange?: (page: number) => void;
  pageParam?: string;
  pageSize: number;
  query?: Record<string, QueryValue>;
  totalItems: number;
  totalPages: number;
};

function buildPageSequence(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const orderedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const sequence: Array<number | "ellipsis"> = [];

  orderedPages.forEach((page, index) => {
    const previousPage = orderedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      sequence.push("ellipsis");
    }

    sequence.push(page);
  });

  return sequence;
}

export function PaginationControls({
  basePath,
  className,
  currentPage,
  itemLabel,
  onPageChange,
  pageParam = "page",
  pageSize,
  query,
  totalItems,
  totalPages,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const sequence = buildPageSequence(currentPage, totalPages);
  const isInteractive = typeof onPageChange === "function" || Boolean(basePath);

  function createHref(targetPage: number) {
    const params = new URLSearchParams();

    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      params.set(key, String(value));
    });

    if (targetPage > 1) {
      params.set(pageParam, String(targetPage));
    } else {
      params.delete(pageParam);
    }

    const search = params.toString();
    return `${basePath ?? "#"}${search ? `?${search}` : ""}`;
  }

  function renderControl(targetPage: number, label: string, disabled = false, isActive = false, icon?: "left" | "right") {
    const controlClassName = cn(
      "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors",
      isActive
        ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
        : "border-[var(--border)] bg-white text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--surface-raised)]",
      disabled && "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-raised)]",
    );

    const content = (
      <>
        {icon === "left" ? <ChevronLeft className="mr-1 h-4 w-4" /> : null}
        <span>{label}</span>
        {icon === "right" ? <ChevronRight className="ml-1 h-4 w-4" /> : null}
      </>
    );

    if (!isInteractive || disabled) {
      return (
        <span aria-disabled={disabled} className={controlClassName}>
          {content}
        </span>
      );
    }

    if (onPageChange) {
      return (
        <button
          type="button"
          className={controlClassName}
          onClick={() => onPageChange(targetPage)}
          aria-current={isActive ? "page" : undefined}
        >
          {content}
        </button>
      );
    }

    return (
      <Link href={createHref(targetPage)} className={controlClassName} aria-current={isActive ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 border-t border-[var(--border-subtle)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-sm text-[var(--text-secondary)]">
        Showing <span className="font-semibold text-[var(--text-primary)]">{startItem}-{endItem}</span> of{" "}
        <span className="font-semibold text-[var(--text-primary)]">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {renderControl(currentPage - 1, "Previous", currentPage === 1, false, "left")}
        {sequence.map((entry, index) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--text-muted)]">
              ...
            </span>
          ) : (
            <span key={entry}>{renderControl(entry, String(entry), false, currentPage === entry)}</span>
          ),
        )}
        {renderControl(currentPage + 1, "Next", currentPage === totalPages, false, "right")}
      </div>
    </div>
  );
}
