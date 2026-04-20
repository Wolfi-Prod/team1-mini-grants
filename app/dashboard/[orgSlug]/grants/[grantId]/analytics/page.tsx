import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findApplicationsByGrant } from "@/lib/mock/applications";
import {
  findReviewAssignmentsByGrant,
  mockReviews,
  isAssignmentComplete,
} from "@/lib/mock/reviews";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import type { ApplicationStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

const FUNNEL_ORDER: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export default async function GrantAnalyticsPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();
  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const applications = findApplicationsByGrant(grantId);
  const assignments = findReviewAssignmentsByGrant(grantId);

  const funnel: Record<ApplicationStatus, number> = {
    DRAFT: 0,
    SUBMITTED: 0,
    IN_REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const a of applications) funnel[a.status]++;

  const totalNonDraft =
    applications.length - funnel.DRAFT;
  const acceptRate =
    funnel.ACCEPTED + funnel.REJECTED > 0
      ? funnel.ACCEPTED / (funnel.ACCEPTED + funnel.REJECTED)
      : null;

  // Category breakdown — group by the first category of each applied project.
  const categoryCounts = new Map<string, number>();
  for (const a of applications) {
    const project = findProjectById(a.projectId);
    const cat = project?.categories[0] ?? "Other";
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const categoryRows = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  // Reviewer performance: count assignments + reviews + avg turnaround per reviewer for
  // this grant specifically.
  const reviewerStats = new Map<
    string,
    { reviewerId: string; assigned: number; completed: number; scores: number[]; latencies: number[] }
  >();
  for (const a of assignments) {
    const slot =
      reviewerStats.get(a.reviewerId) ??
      { reviewerId: a.reviewerId, assigned: 0, completed: 0, scores: [], latencies: [] };
    slot.assigned++;
    if (isAssignmentComplete(a)) slot.completed++;
    const review = mockReviews.find(
      (r) => r.applicationId === a.applicationId && r.reviewerId === a.reviewerId,
    );
    if (review) {
      if (typeof review.score === "number") slot.scores.push(review.score);
      const delta =
        (new Date(review.createdAt).getTime() - new Date(a.assignedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (Number.isFinite(delta)) slot.latencies.push(delta);
    }
    reviewerStats.set(a.reviewerId, slot);
  }
  const reviewerRows = [...reviewerStats.values()]
    .map((s) => ({
      ...s,
      avgScore:
        s.scores.length > 0 ? s.scores.reduce((a, b) => a + b, 0) / s.scores.length : null,
      avgLatencyDays:
        s.latencies.length > 0
          ? s.latencies.reduce((a, b) => a + b, 0) / s.latencies.length
          : null,
    }))
    .sort((a, b) => b.completed - a.completed || b.assigned - a.assigned);

  // Time-to-decision — for decided apps, days from submittedAt → decidedAt.
  const decisionLatencies = applications
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

  const base = `/dashboard/${org.slug}/grants/${grant.id}`;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Analytics — ${grant.title}`}
        description="Funnel, category distribution, reviewer performance, and time-to-decision for this grant."
        breadcrumbs={
          <Link href={`${base}`} className="underline underline-offset-2">
            ← Dashboard
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/organizations/${org.id}/grants/${grant.id}/analytics`,
            ]}
          />

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Applications" value={applications.length} />
            <StatCard
              label="Accept rate"
              value={acceptRate !== null ? `${Math.round(acceptRate * 100)}%` : "—"}
              hint={
                acceptRate !== null
                  ? `of ${funnel.ACCEPTED + funnel.REJECTED} decided`
                  : "no decisions yet"
              }
            />
            <StatCard
              label="Avg decision time"
              value={avgDecisionDays !== null ? `${avgDecisionDays.toFixed(1)}d` : "—"}
              hint="submit → decided"
            />
            <StatCard label="Reviewers assigned" value={reviewerRows.length} />
          </div>

          <Card title="Funnel">
            <ul className="flex flex-col gap-2 text-sm">
              {FUNNEL_ORDER.map((s) => {
                const count = funnel[s];
                const denom = Math.max(totalNonDraft, 1);
                const pct =
                  s === "DRAFT"
                    ? applications.length > 0
                      ? Math.round((count / applications.length) * 100)
                      : 0
                    : Math.round((count / denom) * 100);
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
            <p className="mt-3 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
              DRAFT is % of all apps including drafts; every other row is % of non-draft apps.
            </p>
          </Card>

          <Card title="Categories">
            {categoryRows.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Category distribution lights up as applications come in."
              />
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {categoryRows.map(([cat, count]) => {
                  const pct =
                    applications.length > 0
                      ? Math.round((count / applications.length) * 100)
                      : 0;
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

          <Card title="Reviewer performance">
            {reviewerRows.length === 0 ? (
              <EmptyState
                title="No reviewers assigned yet"
                description="Pick reviewers from the Reviewers page to see their stats here."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {reviewerRows.map((row) => {
                  const reviewer = findUserById(row.reviewerId);
                  return (
                    <li
                      key={row.reviewerId}
                      className="flex flex-col gap-0.5 py-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold">
                          {reviewer?.name ?? row.reviewerId}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {reviewer?.email ?? "—"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span>
                          Assigned: <span className="font-bold">{row.assigned}</span>
                        </span>
                        <span>
                          Completed: <span className="font-bold">{row.completed}</span>
                        </span>
                        <span>
                          Avg score:{" "}
                          <span className="font-bold">
                            {row.avgScore !== null ? row.avgScore.toFixed(1) : "—"}
                          </span>
                        </span>
                        <span>
                          Turnaround:{" "}
                          <span className="font-bold">
                            {row.avgLatencyDays !== null
                              ? `${row.avgLatencyDays.toFixed(1)}d`
                              : "—"}
                          </span>
                        </span>
                      </div>
                    </li>
                  );
                })}
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
