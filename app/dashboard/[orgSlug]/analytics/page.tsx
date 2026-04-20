import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import { mockDisbursements } from "@/lib/mock/disbursements";
import { findProjectById } from "@/lib/mock/projects";
import type { ApplicationStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const FUNNEL_ORDER: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export default async function OrgAnalyticsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grants = findGrantsByOrg(org.id).filter((g) => !g.deletedAt);
  const grantIds = new Set(grants.map((g) => g.id));
  const apps = mockApplications.filter((a) => grantIds.has(a.grantId));

  const funnel: Record<ApplicationStatus, number> = {
    DRAFT: 0,
    SUBMITTED: 0,
    IN_REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const a of apps) funnel[a.status]++;

  const categoryCounts = new Map<string, number>();
  for (const a of apps) {
    const project = findProjectById(a.projectId);
    const cat = project?.categories[0] ?? "Other";
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }

  const disbursed = mockDisbursements
    .filter((d) => d.status === "COMPLETED")
    .filter((d) => apps.some((a) => a.id === d.applicationId))
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPool = grants.reduce((sum, g) => sum + (g.fundingPool ?? 0), 0);

  const decisionLatencies = apps
    .filter((a) => a.submittedAt && a.decidedAt)
    .map(
      (a) =>
        (new Date(a.decidedAt!).getTime() - new Date(a.submittedAt!).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  const avgDecisionDays =
    decisionLatencies.length > 0
      ? decisionLatencies.reduce((a, b) => a + b, 0) / decisionLatencies.length
      : null;

  const perGrantRows = grants
    .map((g) => {
      const gApps = apps.filter((a) => a.grantId === g.id);
      return {
        grant: g,
        total: gApps.length,
        accepted: gApps.filter((a) => a.status === "ACCEPTED").length,
        pending: gApps.filter(
          (a) => a.status === "SUBMITTED" || a.status === "IN_REVIEW",
        ).length,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Analytics — ${org.name}`}
        description="Rolled-up view across every grant this org runs."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}`}
            className="underline underline-offset-2"
          >
            ← Dashboard
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[`GET /api/organizations/${org.id}/analytics`]}
          />

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Active grants" value={grants.length} />
            <StatCard label="Applications" value={apps.length} />
            <StatCard
              label="Disbursed"
              value={`USD ${disbursed.toLocaleString()}`}
              hint={`of ${org.name} · pool USD ${totalPool.toLocaleString()}`}
            />
            <StatCard
              label="Avg decision time"
              value={avgDecisionDays !== null ? `${avgDecisionDays.toFixed(1)}d` : "—"}
              hint="submit → decided"
            />
          </div>

          <Card title="Funnel (all grants)">
            {apps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Funnel populates as applicants submit to any of your grants."
              />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {FUNNEL_ORDER.map((s) => {
                  const count = funnel[s];
                  const pct =
                    apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
                  return (
                    <li key={s} className="flex items-center gap-3">
                      <span className="w-32 text-[10px] font-semibold uppercase tracking-widest">
                        {s.replace("_", " ")}
                      </span>
                      <div className="h-3 flex-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
                        <div
                          className="h-full bg-[var(--color-bg-inverted)]"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                      <span className="w-20 text-right font-mono text-xs">
                        {count} · {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Categories">
            {categoryCounts.size === 0 ? (
              <p className="text-sm text-[var(--color-fg-muted)]">No categories to chart yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {[...categoryCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => {
                    const pct =
                      apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
                    return (
                      <li key={cat} className="flex items-center gap-3">
                        <span className="w-32 text-[10px] font-semibold uppercase tracking-widest">
                          {cat}
                        </span>
                        <div className="h-2 flex-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
                          <div
                            className="h-full bg-[var(--color-bg-inverted)]"
                            style={{ width: `${pct}%` }}
                            aria-hidden
                          />
                        </div>
                        <span className="w-20 text-right font-mono text-xs">
                          {count} · {pct}%
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </Card>

          <Card title="Per-grant leaderboard">
            {perGrantRows.length === 0 ? (
              <EmptyState
                title="No grants yet"
                description="Create a grant to start collecting applications."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {perGrantRows.map((row) => (
                  <li
                    key={row.grant.id}
                    className="flex flex-col gap-0.5 py-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link
                        href={`/dashboard/${org.slug}/grants/${row.grant.id}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {row.grant.title}
                      </Link>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {row.grant.status} · pool USD{" "}
                        {(row.grant.fundingPool ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span>
                        Apps: <span className="font-bold">{row.total}</span>
                      </span>
                      <span>
                        Accepted: <span className="font-bold">{row.accepted}</span>
                      </span>
                      <span>
                        Pending: <span className="font-bold">{row.pending}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
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
      <span className="text-2xl font-bold">{value}</span>
      {hint ? (
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
