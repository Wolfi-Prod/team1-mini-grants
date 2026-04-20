import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/layout/DashboardShell";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/admin"));

  const user = await getServerUser();
  if (!user || !user.isPlatformAdmin) {
    // Silent 404 — never leak the existence of /admin/* to non-admins.
    // (using `notFound()` would also work; redirect to `/` keeps it terser.)
    redirect("/");
  }

  const sidebarLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/organizations", label: "Organizations", group: "Directory" },
    { href: "/admin/users", label: "Users", group: "Directory" },
    { href: "/admin/reviewers", label: "Reviewers", group: "Compliance" },
    { href: "/admin/audit-log", label: "Audit log", group: "Compliance" },
  ];

  return (
    <DashboardShell
      sidebarTitle={
        <div className="flex flex-col gap-0.5">
          <span>Platform</span>
          <span className="text-[10px] font-normal normal-case tracking-widest text-[var(--color-fg-muted)]">
            admin · {user.name ?? user.email}
          </span>
        </div>
      }
      sidebarLinks={sidebarLinks}
    >
      {children}
    </DashboardShell>
  );
}
