import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-[var(--color-fg)] text-[var(--color-bg)] border-transparent hover:opacity-85 active:opacity-75 active:scale-[0.98]",
  secondary:
    "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border-muted)] hover:bg-[var(--color-bg-muted)] active:bg-[var(--color-bg-subtle)]",
  ghost:
    "bg-transparent text-[var(--color-fg)] border-transparent hover:bg-[var(--color-bg-muted)]",
  danger:
    "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)] hover:bg-[var(--color-fg)] hover:text-[var(--color-bg)] hover:border-transparent active:opacity-85 active:scale-[0.98]",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 px-3 text-[11px] gap-1.5",
  md: "h-9 px-4 text-[11px] gap-2",
  lg: "h-11 px-5 text-[11px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center border font-medium uppercase tracking-[0.08em] select-none",
          "transition-all duration-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg)] focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-40",
          VARIANT[variant],
          SIZE[size],
          className,
        )}
        {...rest}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  },
);
