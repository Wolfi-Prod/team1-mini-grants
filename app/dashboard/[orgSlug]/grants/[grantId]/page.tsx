import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import { findApplicationsByGrant } from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import {
  findReviewAssignmentsByGrant,
  isAssignmentComplete,
} from "@/lib/mock/reviews";
import type { ApplicationStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

const STATUS_ORDER: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export default async function GrantDashboardPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const applications = findApplicationsByGrant(grantId);
  const visible = applications.filter((a) => a.status !== "DRAFT");
  const questions = findQuestionsByGrant(grantId);
  const assignments = findReviewAssignmentsByGrant(grantId);

  const pipeline: Record<ApplicationStatus, number> = {
    DRAFT: 0,
    SUBMITTED: 0,
    IN_REVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const a of applications) pipeline[a.status]++;

  const fundingRequested = applications.reduce(
    (sum, a) => sum + (a.fundingRequested ?? 0),
    0,
  );
  const fundingCommitted = applications
    .filter((a) => a.status === "ACCEPTED")
    .reduce((sum, a) => sum + (a.fundingRequested ?? 0), 0);

  const recent = [...visible]
    .sort((a, b) => {
      const at = a.submittedAt ?? a.createdAt;
      const bt = b.submittedAt ?? b.createdAt;
      return new Date(bt).getTime() - new Date(at).getTime();
    })
    .slice(0, 5);

  const base = `/dashboard/${org.slug}/grants/${grant.id}`;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={grant.title}
        description={`Dashboard · ${applications.length} application${applications.length === 1 ? "" : "s"} · pool ${grant.currency} ${(grant.fundingPool ?? 0).toLocaleString()}`}
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants`}
              className="underline underline-offset-2"
            >
              ← Grants
            </Link>
            {" · "}
            <Badge variant={grant.status === "OPEN" ? "inverted" : "default"}>
              {grant.status}
            </Badge>
            {!grant.isPublic ? (
              <>
                {" · "}
                <Badge>Private</Badge>
              </>
            ) : null}
          </span>
        }
        actions={
          <>
            <Link href={`${base}/analytics`}>
              <Button variant="secondary">Analytics</Button>
            </Link>
            <Link href={`${base}/embed`}>
              <Button variant="secondary">Embed</Button>
            </Link>
            <Link href={`${base}/applications`}>
              <Button variant="secondary">View applications</Button>
            </Link>
            <Link href={`${base}/edit`}>
              <Button variant="primary">Edit grant</Button>
            </Link>
          </>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/organizations/${org.id}/grants/${grant.id}`,
              `GET /api/organizations/${org.id}/grants/${grant.id}/applications?include=stats`,
              `GET /api/organizations/${org.id}/grants/${grant.id}/reviewer-assignments`,
            ]}
          />

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Total applications" value={applications.length} />
            <StatCard label="Submitted / in review" value={pipeline.SUBMITTED + pipeline.IN_REVIEW} />
            <StatCard label="Accepted" value={pipeline.ACCEPTED} />
            <StatCard
              label="Funding committed"
              value={`${grant.currency} ${fundingCommitted.toLocaleString()}`}
              hint={`of ${grant.currency} ${(grant.fundingPool ?? 0).toLocaleString()} pool`}
            />
          </div>

          <Card title="Pipeline">
            <ul className="flex flex-col divide-y divide-black">
              {STATUS_ORDER.map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {s.replace("_", " ")}
                  </span>
                  <span className="font-bold">{pipeline[s]}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Recent applications"
            actions={
              applications.length > 0 ? (
                <Link href={`${base}/applications`}>
                  <Button size="sm" variant="secondary">
                    All {visible.length}
                  </Button>
                </Link>
              ) : null
            }
          >
            {recent.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="The pipeline fills up once applicants submit."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {recent.map((app) => {
                  const project = findProjectById(app.projectId);
                  const applicant = project ? findUserById(project.userId) : null;
                  return (
                    <li
                      key={app.id}
                      className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`${base}/applications/${app.id}`}
                          className="text-sm font-bold underline underline-offset-2"
                        >
                          {project?.name ?? "Unknown project"}
                        </Link>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {applicant?.name ?? "Unknown applicant"}
                          {app.submittedAt
                            ? ` · ${new Date(app.submittedAt).toLocaleDateString()}`
                            : " · draft"}
                          {app.fundingRequested
                            ? ` · ${grant.currency} ${app.fundingRequested.toLocaleString()}`
                            : ""}
                        </span>
                      </div>
                      <Badge variant={app.status === "ACCEPTED" ? "inverted" : "default"}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              title="Questions"
              actions={
                <Link href={`${base}/questions`}>
                  <Button size="sm" variant="secondary">
                    Manage
                  </Button>
                </Link>
              }
            >
              <p className="text-sm">
                <span className="font-bold">{questions.length}</span> question
                {questions.length === 1 ? "" : "s"} configured.
                {questions.filter((q) => q.isRequired).length > 0
                  ? ` ${questions.filter((q) => q.isRequired).length} required.`
                  : ""}
              </p>
            </Card>

            <Card
              title="Reviewers"
              actions={
                <Link href={`${base}/reviewers`}>
                  <Button size="sm" variant="secondary">
                    Manage
                  </Button>
                </Link>
              }
            >
              <p className="text-sm">
                <span className="font-bold">{assignments.length}</span> assignment
                {assignments.length === 1 ? "" : "s"} across{" "}
                <span className="font-bold">
                  {new Set(assignments.map((a) => a.reviewerId)).size}
                </span>{" "}
                reviewer{new Set(assignments.map((a) => a.reviewerId)).size === 1 ? "" : "s"}.
                {assignments.filter((a) => !isAssignmentComplete(a)).length > 0
                  ? ` ${assignments.filter((a) => !isAssignmentComplete(a)).length} pending.`
                  : ""}
              </p>
            </Card>
          </div>

          <Card title="Grant summary">
            <dl className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  Deadline
                </dt>
                <dd className="mt-0.5">
                  {grant.deadline
                    ? new Date(grant.deadline).toLocaleDateString()
                    : "Rolling"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  Visibility
                </dt>
                <dd className="mt-0.5">
                  {grant.isPublic ? "Public" : "Private"}
                  {grant.isFlagship ? " · Flagship" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  Funding requested (sum)
                </dt>
                <dd className="mt-0.5">
                  {grant.currency} {fundingRequested.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  Created
                </dt>
                <dd className="mt-0.5">
                  {new Date(grant.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
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
