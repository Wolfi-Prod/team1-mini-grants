import Link from "next/link";

type Active = "profile" | "account" | "notifications";

const LINKS: { id: Active; label: string; href: string }[] = [
  { id: "profile", label: "Profile", href: "/settings/profile" },
  { id: "account", label: "Account", href: "/settings/account" },
  { id: "notifications", label: "Notifications", href: "/settings/notifications" },
];

export function SettingsSidebar({ active }: { active: Active }) {
  return (
    <aside className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-3">
      <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest">Settings</h2>
      {LINKS.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          aria-current={active === l.id ? "page" : undefined}
          className={
            active === l.id
              ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-on-inverted)]"
              : "border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-[var(--color-border-muted)]"
          }
        >
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
