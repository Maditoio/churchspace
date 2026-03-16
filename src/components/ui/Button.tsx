import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-12 min-w-36 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-(--primary) text-(--text-inverse) shadow-(--shadow-sm) hover:-translate-y-0.5 hover:bg-(--primary-hover) hover:shadow-(--shadow-md)",
        secondary: "border border-(--border-strong) bg-white/88 text-(--primary) shadow-(--shadow-sm) hover:-translate-y-0.5 hover:border-(--primary) hover:bg-(--primary-soft)",
        accent: "bg-(--accent) text-white shadow-(--shadow-sm) hover:-translate-y-0.5 hover:bg-(--accent-hover) hover:shadow-(--shadow-md)",
        ghost: "text-(--primary) hover:bg-(--primary-soft)",
        danger: "bg-(--destructive) text-white shadow-(--shadow-sm) hover:-translate-y-0.5 hover:opacity-95",
        outlineAccent: "border border-(--accent) bg-white/72 text-(--accent-strong) hover:-translate-y-0.5 hover:bg-(--accent-light)",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
