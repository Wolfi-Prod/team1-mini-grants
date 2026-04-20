import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <header
      className="flex flex-col gap-3 border-b px-6 py-6"
      style={{
        borderColor: "var(--subtle-border)",
        background: "var(--ink)",
      }}
    >
      {breadcrumbs ? (
        <div
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono-display)" }}
        >
          {breadcrumbs}
        </div>
      ) : null}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-1.5">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color: "var(--text)",
            }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="max-w-2xl"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                lineHeight: 1.5,
                color: "var(--text-muted)",
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
