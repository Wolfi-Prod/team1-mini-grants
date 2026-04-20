import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { mockOrgs } from "@/lib/mock/orgs";
import { mockGrants } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import { mockUsers, findUserById } from "@/lib/mock/users";
import { mockAuditLog } from "@/lib/mock/auditLog";

export default function PlatformDashboardPage() {
  const liveOrgs = mockOrgs.filter((o) => !o.deletedAt);
  const liveGrants = mockGrants.filter((g) => !g.deletedAt);
  const openGrants = liveGrants.filter((g) => g.status === "OPEN");
  const visibleApps = mockApplications.filter((a) => a.status !== "DRAFT");
  const acceptedApps = mockApplications.filter((a) => a.status === "ACCEPTED");
  const liveUsers = mockUsers.filter((u) => !u.deletedAt);
  const admins = liveUsers.filter((u) => u.isPlatformAdmin);

  const recentAudit = [...mockAuditLog]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Platform overview"
        description="Aggregate counts across every org. You can only land here with user.isPlatformAdmin = true."
        actions={
          <Link href="/admin/audit-log">
            <Button variant="secondary">View full audit log</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/admin/overview",
              "GET /api/admin/audit-log?limit=5",
            ]}
          />

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Organizations" value={liveOrgs.length} hint="non-deleted" />
            <StatCard label="Users" value={liveUsers.length} hint={`${admins.length} platform admin${admins.length === 1 ? "" : "s"}`} />
            <StatCard
              label="Live grants"
              value={liveGrants.length}
              hint={`${openGrants.length} open · ${liveGrants.length - openGrants.length} other`}
            />
            <StatCard
              label="Applications"
              value={visibleApps.length}
              hint={`${acceptedApps.length} accepted`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <Card
              title="Recent audit trail"
              actions={
                <Link href="/admin/audit-log">
                  <Button size="sm" variant="secondary">
                    All entries
                  </Button>
                </Link>
              }
            >
              {recentAudit.length === 0 ? (
                <EmptyState
                  title="No audit entries yet"
                  description="Every state-changing operation writes to the audit log. This surface populates as the app gets used."
                />
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                  {recentAudit.map((entry) => {
                    const actor = findUserById(entry.actorId);
                    return (
                      <li key={entry.id} className="flex flex-col gap-0.5 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{entry.action}</Badge>
                          <span className="text-xs font-semibold">
                            {entry.resourceType}/{entry.resourceId}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {actor?.name ?? entry.actorId} ·{" "}
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <div className="flex flex-col gap-4">
              <Card title="Quick actions">
                <ul className="flex flex-col gap-2 text-sm">
                  <li>
                    <Link
                      href="/admin/organizations"
                      className="underline underline-offset-2"
                    >
                      → Browse organizations
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/users" className="underline underline-offset-2">
                      → Browse users
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/audit-log"
                      className="underline underline-offset-2"
                    >
                      → Audit log
                    </Link>
                  </li>
                </ul>
              </Card>

              <Card title="System health">
                <ul className="flex flex-col gap-1 text-xs">
                  <li className="flex items-center justify-between">
                    <span>Mock API</span>
                    <Badge variant="inverted">LIVE</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Real backend</span>
                    <Badge>PENDING</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>BuilderHub SSO</span>
                    <Badge>MOCK</Badge>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{value}</span>
      {hint ? (
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
