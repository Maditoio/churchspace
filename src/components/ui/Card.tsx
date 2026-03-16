import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-(--radius) border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,253,249,0.9))] shadow-(--shadow-sm) backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
