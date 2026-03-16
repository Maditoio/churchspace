import Image from "next/image";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
};

export function Avatar({ src, name, size = 36 }: AvatarProps) {
  const initials = (name ?? "ChurchSpace")
    .split(" ")
    .slice(0, 2)
    .map((v) => v[0])
    .join("")
    .toUpperCase();

  return src ? (
    <Image
      src={src}
      alt={name ?? "Avatar"}
      width={size}
      height={size}
      className="rounded-full border border-[var(--border)] object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-light)] text-xs font-semibold text-[var(--primary)]"
    >
      {initials}
    </div>
  );
}
