"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.id === activeId);
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (idx + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (idx - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = tabs.length - 1;
    } else {
      return;
    }
    onChange(tabs[next].id);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn("flex gap-0 border-b border-[var(--color-border-muted)]", className)}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg)] focus-visible:ring-offset-2",
              active
                ? "border-b-2 border-[var(--color-fg)] text-[var(--color-fg)]"
                : "border-b-2 border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border)]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  tabId,
  activeId,
  children,
}: {
  tabId: string;
  activeId: string;
  children: ReactNode;
}) {
  if (tabId !== activeId) return null;
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
