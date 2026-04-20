import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  findAssignmentsForReviewer,
  isAssignmentComplete,
  mockReviews,
} from "@/lib/mock/reviews";
import { findApplicationById } from "@/lib/mock/applications";
import { findGrantById } from "@/lib/mock/grants";
import { findProjectById } from "@/lib/mock/projects";

export default async function ReviewerDashboardPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/reviews/dashboard"));
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/reviews/dashboard"));

  const assignments = findAssignmentsForReviewer(user.id);
  const myReviews = mockReviews.filter((r) => r.reviewerId === user.id);

  const pending = assignments.filter((a) => !isAssignmentComplete(a));
  const completed = assignments.filter((a) => isAssignmentComplete(a));

  // Decision distribution across this reviewer's submitted reviews.
  const decisionCounts = { APPROVE: 0, REJECT: 0, REQUEST_CHANGES: 0 } as Record<
    string,
    number
  >;
  for (const r of myReviews) decisionCounts[r.decision] = (decisionCounts[r.decision] ?? 0) + 1;

  const scores = myReviews.map((r) => r.score).filter((s): s is number => typeof s === "number");
  const avgScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  // Decision latency: assignedAt → review createdAt, in days. Only meaningful for
  // completed assignments where we can join. Mock data may not have all pairs.
  const latencies: number[] = [];
  for (const a of assignments) {
    const review = mockReviews.find(
      (r) => r.applicationId === a.applicationId && r.reviewerId === a.reviewerId,
    );
    if (!review) continue;
    const delta =
      (new Date(review.createdAt).getTime() - new Date(a.assignedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (Number.isFinite(delta)) latencies.push(delta);
  }
  const avgLatencyDays =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

  const overdue = pending.filter((a) => {
    if (!a.dueDate) return false;
    return new Date(a.dueDate).getTime() < Date.now();
  });

  const upcomingQueue = [...pending]
    .sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    })
    .slice(0, 5);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Reviewer dashboard"
        description={`Your review queue + performance at a glance. Aggregates over every grant you've ever reviewed on.`}
        actions={
          <Link href="/reviews">
            <Button variant="secondary">Open queue</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/me/reviewer-stats",
              "GET /api/me/reviewer-assignments?status=pending",
            ]}
          />

          {assignments.length === 0 ? (
            <Card>
              <EmptyState
                title="You're not on any review panels yet"
                description="When an org admin assigns you to a grant's application, it lands in your queue + shows up here."
              />
            </Card>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <StatCard
                  label="Pending"
                  value={pending.length}
                  hint={
                    overdue.length > 0
                      ? `${overdue.length} overdue`
                      : "on time"
                  }
                />
                <StatCard label="Completed" value={completed.length} hint="all-time" />
                <StatCard
                  label="Avg score"
                  value={avgScore !== null ? avgScore.toFixed(1) : "—"}
                  hint={
                    scores.length > 0
                      ? `across ${scores.length} review${scores.length === 1 ? "" : "s"}`
                      : "no scored reviews yet"
                  }
                />
                <StatCard
                  label="Avg turnaround"
                  value={avgLatencyDays !== null ? `${avgLatencyDays.toFixed(1)}d` : "—"}
                  hint="assign → submit"
                />
              </div>

              <Card title="Decision distribution">
                {myReviews.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    No reviews yet — submit your first one from the queue.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {(
                      [
                        ["APPROVE", "Approve"],
                        ["REJECT", "Reject"],
                        ["REQUEST_CHANGES", "Request changes"],
                      ] as const
                    ).map(([key, label]) => {
                      const count = decisionCounts[key] ?? 0;
                      const pct =
                        myReviews.length > 0 ? Math.round((count / myReviews.length) * 100) : 0;
                      return (
                        <li key={key} className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold uppercase tracking-widest">
                            {label}
                          </span>
                          <div className="flex flex-1 items-center gap-2">
                            <div className="h-2 flex-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
                              <div
                                className="h-full bg-[var(--color-bg-inverted)]"
                                style={{ width: `${pct}%` }}
                                aria-hidden
                              />
                            </div>
                            <span className="w-14 text-right text-xs font-mono">
                              {count} · {pct}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card
                title={`Upcoming queue · ${upcomingQueue.length}`}
                actions={
                  pending.length > 0 ? (
                    <Link href="/reviews">
                      <Button size="sm" variant="secondary">
                        All pending ({pending.length})
                      </Button>
                    </Link>
                  ) : null
                }
              >
                {upcomingQueue.length === 0 ? (
                  <EmptyState
                    title="Queue clear"
                    description="No pending assignments. Nice."
                  />
                ) : (
                  <ul className="flex flex-col divide-y divide-black">
                    {upcomingQueue.map((a) => {
                      const app = findApplicationById(a.applicationId);
                      const grant = app ? findGrantById(app.grantId) ?? null : null;
                      const project = app
                        ? findProjectById(app.projectId) ?? null
                        : null;
                      const overdue =
                        a.dueDate && new Date(a.dueDate).getTime() < Date.now();
                      return (
                        <li
                          key={a.id}
                          className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <Link
                              href={`/reviews/${a.applicationId}`}
                              className="text-sm font-bold underline underline-offset-2"
                            >
                              {project?.name ?? "Unknown project"}
                            </Link>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                              {grant?.title ?? "Unknown grant"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {overdue ? (
                              <Badge variant="inverted">OVERDUE</Badge>
                            ) : a.dueDate ? (
                              <Badge>
                                Due {new Date(a.dueDate).toLocaleDateString()}
                              </Badge>
                            ) : (
                              <Badge>No due date</Badge>
                            )}
                            <Link href={`/reviews/${a.applicationId}`}>
                              <Button size="sm" variant="primary">
                                Start
                              </Button>
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </>
          )}
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
