import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  title,
  description,
  actions,
  footer,
  children,
  className,
  ...rest
}: CardProps) {
  const hasHeader = title != null || description != null || actions != null;
  return (
    <div
      className={cn(
        "flex flex-col border border-[var(--color-border-muted)] bg-[var(--color-bg)]",
        className,
      )}
      {...rest}
    >
      {hasHeader ? (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border-muted)] px-5 py-4">
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 className="text-[15px] font-medium leading-snug tracking-tight text-[var(--color-fg)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="flex-1 px-5 py-5">{children}</div>
      {footer ? (
        <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border-muted)] px-5 py-3">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
