"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  href: string;
  label: string;
  group?: string;
}

interface DashboardShellProps {
  sidebarTitle?: ReactNode;
  sidebarLinks: SidebarLink[];
  children: ReactNode;
}

function SidebarNav({
  links,
  pathname,
  onNavigate,
}: {
  links: SidebarLink[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const grouped = links.reduce<Record<string, SidebarLink[]>>((acc, link) => {
    const key = link.group ?? "";
    (acc[key] ??= []).push(link);
    return acc;
  }, {});

  function isActive(href: string) {
    if (href === pathname) return true;
    if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
    return false;
  }

  return (
    <nav className="flex flex-col py-2">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="flex flex-col">
          {group ? (
            <p
              className="mt-3 px-4 pb-1 text-[9px] uppercase tracking-[0.14em]"
              style={{ color: "var(--text-dim)", fontFamily: "var(--font-pixel)" }}
            >
              {group}
            </p>
          ) : null}
          {items.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-l-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em]",
                  active
                    ? "border-[var(--color-fg)] bg-[var(--color-bg-inverted)] text-[var(--color-fg-on-inverted)]"
                    : "border-transparent text-[var(--color-fg-muted)] hover:border-[var(--color-fg)] hover:text-[var(--color-fg)]",
                )}
                style={{ fontFamily: "var(--font-mono-display)" }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function DashboardShell({
  sidebarTitle,
  sidebarLinks,
  children,
}: DashboardShellProps) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Desktop sidebar */}
      <aside
        className="hidden w-60 shrink-0 border-r md:block"
        style={{ borderColor: "var(--subtle-border)", background: "var(--ink)" }}
      >
        {sidebarTitle ? (
          <div
            className="border-b px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{
              borderColor: "var(--subtle-border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono-display)",
            }}
          >
            {sidebarTitle}
          </div>
        ) : null}
        <SidebarNav links={sidebarLinks} pathname={pathname} />
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center border md:hidden"
        style={{
          borderColor: "var(--subtle-border)",
          background: "var(--ink)",
          color: "var(--text)",
        }}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto border-r md:hidden"
            style={{ borderColor: "var(--subtle-border)", background: "var(--ink)" }}
          >
            {sidebarTitle ? (
              <div
                className="border-b px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                  borderColor: "var(--subtle-border)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono-display)",
                }}
              >
                {sidebarTitle}
              </div>
            ) : null}
            <SidebarNav
              links={sidebarLinks}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </>
      ) : null}

      <div className="flex-1" style={{ background: "var(--ink)" }}>{children}</div>
    </div>
  );
}
