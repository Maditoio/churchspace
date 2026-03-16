"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,46,0.55)] px-4" onClick={onClose}>
      <div
        className={cn("w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-lg)]")}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-display text-3xl text-[var(--text-primary)]">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
