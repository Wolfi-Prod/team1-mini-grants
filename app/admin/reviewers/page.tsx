import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Table } from "@/app/_components/ui/Table";
import { mockReviewerAssignments, mockReviews, isAssignmentComplete } from "@/lib/mock/reviews";
import { findApplicationById } from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import { findGrantById } from "@/lib/mock/grants";
import { mockOrgMembers } from "@/lib/mock/orgs";

interface ReviewerSummary {
  reviewerId: string;
  name: string;
  email: string;
  handle: string;
  assigned: number;
  completed: number;
  avgScore: number | null;
  avgLatencyDays: number | null;
  coiFlags: CoiFlag[];
}

interface CoiFlag {
  kind: "APPLICANT_IS_SELF" | "SAME_ORG_AS_APPLICANT";
  applicationId: string;
  detail: string;
}

export default function AdminReviewersAuditPage() {
  const byReviewer = new Map<string, ReviewerSummary>();

  for (const a of mockReviewerAssignments) {
    const reviewer = findUserById(a.reviewerId);
    const name = reviewer?.name ?? reviewer?.handle ?? a.reviewerId;
    const existing =
      byReviewer.get(a.reviewerId) ??
      ({
        reviewerId: a.reviewerId,
        name,
        email: reviewer?.email ?? "—",
        handle: reviewer?.handle ?? a.reviewerId,
        assigned: 0,
        completed: 0,
        avgScore: null,
        avgLatencyDays: null,
        coiFlags: [],
      } satisfies ReviewerSummary);

    existing.assigned++;
    if (isAssignmentComplete(a)) existing.completed++;

    // COI detection — mock rules we'd pair with the backend's canAssignReviewer guard
    // (Phase 5C). Reviewer is the applicant themselves, or reviewer shares an org with
    // the applicant (same-org is a soft warning, not a block).
    const app = findApplicationById(a.applicationId);
    const project = app ? findProjectById(app.projectId) ?? null : null;
    const applicantId = project?.userId ?? null;
    if (applicantId && applicantId === a.reviewerId) {
      existing.coiFlags.push({
        kind: "APPLICANT_IS_SELF",
        applicationId: a.applicationId,
        detail: `reviewer is the applicant on ${app?.id ?? "?"}`,
      });
    } else if (applicantId) {
      const reviewerOrgs = mockOrgMembers
        .filter((m) => m.userId === a.reviewerId)
        .map((m) => m.organizationId);
      const applicantOrgs = mockOrgMembers
        .filter((m) => m.userId === applicantId)
        .map((m) => m.organizationId);
      const shared = reviewerOrgs.find((orgId) => applicantOrgs.includes(orgId));
      if (shared) {
        existing.coiFlags.push({
          kind: "SAME_ORG_AS_APPLICANT",
          applicationId: a.applicationId,
          detail: `both belong to org ${shared}`,
        });
      }
    }

    byReviewer.set(a.reviewerId, existing);
  }

  // Now enrich score + latency per reviewer.
  for (const summary of byReviewer.values()) {
    const myReviews = mockReviews.filter((r) => r.reviewerId === summary.reviewerId);
    const scores = myReviews
      .map((r) => r.score)
      .filter((s): s is number => typeof s === "number");
    summary.avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const latencies: number[] = [];
    for (const a of mockReviewerAssignments.filter((x) => x.reviewerId === summary.reviewerId)) {
      const review = myReviews.find((r) => r.applicationId === a.applicationId);
      if (!review) continue;
      const delta =
        (new Date(review.createdAt).getTime() - new Date(a.assignedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (Number.isFinite(delta)) latencies.push(delta);
    }
    summary.avgLatencyDays =
      latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null;
  }

  const rows = [...byReviewer.values()].sort((a, b) => {
    if (b.coiFlags.length !== a.coiFlags.length)
      return b.coiFlags.length - a.coiFlags.length;
    return b.assigned - a.assigned;
  });

  const totalCoiFlags = rows.reduce((sum, r) => sum + r.coiFlags.length, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Reviewer audit"
        description="Every reviewer across every grant, with COI flags surfaced up top. Self-COI (reviewer is the applicant) and same-org COI (reviewer + applicant share an org) are the only mock rules — backend will add more (family, past employer, etc)."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/admin/reviewers",
              "GET /api/admin/reviewers/:reviewerId/coi-signals",
            ]}
          />

          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Reviewers" value={rows.length} />
            <StatCard
              label="Active assignments"
              value={rows.reduce((sum, r) => sum + (r.assigned - r.completed), 0)}
              hint="pending review"
            />
            <StatCard
              label="COI flags"
              value={totalCoiFlags}
              hint={totalCoiFlags > 0 ? "investigate" : "all clear"}
            />
          </div>

          <Card title={`Reviewers · ${rows.length} · sorted by COI count`}>
            <div className="flex flex-col gap-3">
              <Table
                dense
                rows={rows}
                getRowKey={(r) => r.reviewerId}
                empty="No reviewers on any grant yet"
                columns={[
                  {
                    key: "reviewer",
                    header: "Reviewer",
                    render: (row) => (
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`/u/${row.handle}`}
                          className="font-bold underline underline-offset-2"
                        >
                          {row.name}
                        </Link>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          @{row.handle}
                        </span>
                        <span className="break-all text-xs text-[var(--color-fg-muted)]">
                          {row.email}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "assigned",
                    header: "Assigned",
                    numeric: true,
                    render: (row) => row.assigned,
                  },
                  {
                    key: "completed",
                    header: "Completed",
                    numeric: true,
                    render: (row) => row.completed,
                  },
                  {
                    key: "score",
                    header: "Avg score",
                    numeric: true,
                    render: (row) =>
                      row.avgScore !== null ? row.avgScore.toFixed(1) : "—",
                  },
                  {
                    key: "turnaround",
                    header: "Turnaround",
                    numeric: true,
                    render: (row) =>
                      row.avgLatencyDays !== null
                        ? `${row.avgLatencyDays.toFixed(1)}d`
                        : "—",
                  },
                  {
                    key: "coi",
                    header: "COI",
                    render: (row) =>
                      row.coiFlags.length === 0 ? (
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                          clear
                        </span>
                      ) : (
                        <details>
                          <summary className="cursor-pointer">
                            <Badge variant="outline">
                              {row.coiFlags.length} flag
                              {row.coiFlags.length === 1 ? "" : "s"}
                            </Badge>
                          </summary>
                          <ul className="mt-2 flex flex-col gap-1 border-l-2 border-[var(--color-border-muted)] pl-3 text-xs">
                            {row.coiFlags.map((f, i) => {
                              const app = findApplicationById(f.applicationId);
                              const project = app
                                ? findProjectById(app.projectId) ?? null
                                : null;
                              const grant = app
                                ? findGrantById(app.grantId) ?? null
                                : null;
                              return (
                                <li key={i} className="flex flex-col gap-0.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge variant="inverted">{f.kind}</Badge>
                                    <span className="break-all">
                                      {project?.name ?? f.applicationId}
                                      {grant ? ` · ${grant.title}` : ""}
                                    </span>
                                  </div>
                                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                                    {f.detail}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      ),
                  },
                  {
                    key: "actions",
                    header: "",
                    className: "text-right",
                    render: (row) => (
                      <Link href={`/u/${row.handle}`}>
                        <Button size="sm" variant="secondary">
                          Profile
                        </Button>
                      </Link>
                    ),
                  },
                ]}
              />
            </div>
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
      <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{value}</span>
      {hint ? (
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
