import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TimelineStatus = "completed" | "active" | "upcoming";

interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string;
  status: TimelineStatus;
  icon?: ReactNode;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const DOT_CLASSES: Record<TimelineStatus, string> = {
  completed:
    "bg-[var(--color-primary)] border-[var(--color-primary)]",
  active:
    "bg-[var(--color-bg)] border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20",
  upcoming:
    "bg-[var(--color-bg-subtle)] border-[var(--color-border)]",
};

const LINE_CLASSES: Record<TimelineStatus, string> = {
  completed: "bg-[var(--color-primary)]",
  active: "bg-[var(--color-border-muted)]",
  upcoming: "bg-[var(--color-border-muted)]",
};

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3">
            {/* Vertical line + dot column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full border-2",
                  DOT_CLASSES[step.status],
                )}
              />
              {!isLast ? (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-6",
                    LINE_CLASSES[step.status],
                  )}
                />
              ) : null}
            </div>
            {/* Content */}
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-none -mt-0.5",
                  step.status === "upcoming"
                    ? "text-[var(--color-fg-subtle)]"
                    : "text-[var(--color-fg)]",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                  {step.description}
                </p>
              ) : null}
              {step.timestamp ? (
                <p className="mt-0.5 text-xs text-[var(--color-fg-subtle)]">
                  {step.timestamp}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
