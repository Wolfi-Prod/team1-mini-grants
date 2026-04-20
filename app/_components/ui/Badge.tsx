import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type Variant =
  | "default"
  | "inverted"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "signal";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const VARIANT_CLASSES: Record<Variant, string> = {
  default:
    "bg-[var(--color-bg-subtle)] text-[var(--color-fg)] border-[var(--color-border-muted)]",
  inverted:
    "bg-[var(--color-bg-inverted)] text-[var(--color-fg-on-inverted)] border-transparent",
  outline:
    "bg-transparent text-[var(--color-fg-muted)] border-[var(--color-border-muted)]",
  success:
    "bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-[var(--color-success-border)]",
  warning:
    "bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] border-[var(--color-warning-border)]",
  danger:
    "bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] border-[var(--color-danger-border)]",
  info:
    "bg-[var(--color-info-bg)] text-[var(--color-info-fg)] border-[var(--color-info-border)]",
  neutral:
    "bg-[var(--color-neutral-bg)] text-[var(--color-neutral-fg)] border-[var(--color-neutral-border)]",
  signal:
    "bg-[var(--color-signal-bg)] text-[var(--color-signal-fg)] border-[var(--color-signal-border)]",
};

const SIZE_CLASSES = {
  sm: "h-5 px-1.5 text-[11px]",
  md: "h-6 px-2 text-[11px]",
};

export function Badge({
  variant = "default",
  size = "sm",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium uppercase leading-none tracking-[0.08em]",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
