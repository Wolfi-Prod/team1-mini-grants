import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/layout/DashboardShell";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { findOrgBySlug, isOrgMember } from "@/lib/mock/orgs";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboardLayout({ children, params }: LayoutProps) {
  const { orgSlug } = await params;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/dashboard/${orgSlug}`));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/dashboard/${orgSlug}`));

  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  // Access: platform admin always; otherwise the viewer must be a member of this org.
  const admitted = user.isPlatformAdmin || isOrgMember(user.id, org.id);
  if (!admitted) notFound();

  const base = `/dashboard/${org.slug}`;
  const sidebarLinks = [
    { href: base, label: "Overview" },
    { href: `${base}/analytics`, label: "Analytics" },
    { href: `${base}/grants`, label: "Grants", group: "Grants" },
    { href: `${base}/grants/new`, label: "New grant", group: "Grants" },
    { href: `${base}/grants/templates`, label: "Templates", group: "Grants" },
    { href: `${base}/members`, label: "Members", group: "Org" },
    { href: `${base}/settings`, label: "Settings", group: "Org" },
    { href: `${base}/digest`, label: "Email digest", group: "Integrations" },
    { href: `${base}/webhooks`, label: "Webhooks", group: "Integrations" },
    { href: `${base}/api-keys`, label: "API keys", group: "Integrations" },
  ];

  return (
    <DashboardShell
      sidebarTitle={
        <div className="flex flex-col gap-0.5">
          <span>{org.name}</span>
          <span className="text-[10px] font-normal normal-case tracking-widest text-[var(--color-fg-muted)]">
            org · {org.slug}
          </span>
        </div>
      }
      sidebarLinks={sidebarLinks}
    >
      {children}
    </DashboardShell>
  );
}
