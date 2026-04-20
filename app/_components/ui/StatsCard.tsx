import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: ReactNode;
  change?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ label, value, change, icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-5 py-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          {label}
        </span>
        {icon ? (
          <span className="text-[var(--color-fg-subtle)]">{icon}</span>
        ) : null}
      </div>
      <span className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
        {value}
      </span>
      {change ? (
        <span className="text-xs text-[var(--color-fg-muted)]">{change}</span>
      ) : null}
    </div>
  );
}
