import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {icon ? (
        <div className="mb-1 text-[var(--color-fg-subtle)]">{icon}</div>
      ) : null}
      <p className="text-[15px] font-medium leading-snug text-[var(--color-fg)]">
        {title}
      </p>
      {description ? (
        <p className="max-w-sm text-sm text-[var(--color-fg-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
