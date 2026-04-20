import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  mockOrgs,
  mockOrgMembers,
  findOrgsForUser,
  findOrgMembership,
} from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";

export default async function MyOrganizationsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/organizations"));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/organizations"));

  // Platform admins see every non-deleted org; everyone else sees only ones they belong to.
  const orgs = user.isPlatformAdmin
    ? mockOrgs.filter((o) => !o.deletedAt)
    : findOrgsForUser(user.id);

  const rows = orgs.map((org) => {
    const membership = findOrgMembership(user.id, org.id);
    const memberCount = mockOrgMembers.filter(
      (m) => m.organizationId === org.id,
    ).length;
    const grants = findGrantsByOrg(org.id);
    const openGrants = grants.filter((g) => g.status === "OPEN").length;
    return { org, membership, memberCount, grants, openGrants };
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My organizations"
        description={
          user.isPlatformAdmin
            ? "All organizations on the platform (platform admin view)."
            : "Organizations you own, manage, or collaborate on."
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/me/organizations",
              "GET /api/organizations  (platform admin only)",
            ]}
          />

          {rows.length === 0 ? (
            <Card>
              <EmptyState
                title="You don't belong to any organizations yet"
                description="Organizations are invite-only. Once you accept an invite you'll see the org here."
                action={
                  <Link href="/invitations">
                    <Button variant="secondary">Check invitations</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card title={`Organizations · ${rows.length}`}>
              <Table
                dense
                rows={rows}
                getRowKey={(r) => r.org.id}
                empty="No organizations"
                columns={[
                  {
                    key: "org",
                    header: "Organization",
                    render: (r) => (
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`/dashboard/${r.org.slug}`}
                          className="font-bold underline underline-offset-2"
                        >
                          {r.org.name}
                        </Link>
                        {r.org.description ? (
                          <p className="line-clamp-1 text-xs text-[var(--color-fg-muted)]">
                            {r.org.description}
                          </p>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    key: "role",
                    header: "Role",
                    render: (r) =>
                      r.membership ? (
                        <Badge
                          variant={r.membership.role === "OWNER" ? "inverted" : "default"}
                        >
                          {r.membership.role}
                        </Badge>
                      ) : user.isPlatformAdmin ? (
                        <Badge>ADMIN VIEW</Badge>
                      ) : null,
                  },
                  {
                    key: "members",
                    header: "Members",
                    numeric: true,
                    render: (r) => r.memberCount,
                  },
                  {
                    key: "grants",
                    header: "Grants",
                    numeric: true,
                    render: (r) => (
                      <span>
                        {r.grants.length}
                        {r.openGrants > 0 ? (
                          <span className="ml-1 text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                            · {r.openGrants} open
                          </span>
                        ) : null}
                      </span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (r) => (
                      <Link href={`/dashboard/${r.org.slug}`}>
                        <Button size="sm" variant="primary">
                          Open
                        </Button>
                      </Link>
                    ),
                  },
                ]}
              />
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
