import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function nameToColor(name: string): string {
  const colors = [
    "bg-[var(--color-primary-bg)] text-[var(--color-primary-fg)]",
    "bg-[var(--color-accent-bg)] text-[var(--color-accent-fg)]",
    "bg-[var(--color-success-bg)] text-[var(--color-success-fg)]",
    "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]",
    "bg-[var(--color-info-bg)] text-[var(--color-info-fg)]",
    "bg-[var(--color-tertiary-bg)] text-[var(--color-tertiary-fg)]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const displayName = name ?? alt;
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "shrink-0 rounded-full object-cover",
          SIZE_CLASSES[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-label={alt}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        SIZE_CLASSES[size],
        nameToColor(displayName),
        className,
      )}
    >
      {getInitials(displayName)}
    </span>
  );
}
