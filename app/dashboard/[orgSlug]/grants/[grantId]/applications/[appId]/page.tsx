import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import {
  findApplicationById,
  findAnswersByApplication,
} from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import {
  findAssignmentsForApplication,
  findReviewsByApplication,
} from "@/lib/mock/reviews";
import { DecisionPanel } from "./_components/DecisionPanel";
import type { ApplicationStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string; appId: string }>;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "New",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function OrgApplicationReviewPage({ params }: PageProps) {
  const { orgSlug, grantId, appId } = await params;

  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const application = findApplicationById(appId);
  if (!application) notFound();
  if (application.grantId !== grant.id) notFound();
  if (application.status === "DRAFT") notFound(); // drafts never surface to orgs

  const project = findProjectById(application.projectId);
  const applicant = project ? findUserById(project.userId) : null;
  const questions = findQuestionsByGrant(grant.id);
  const answers = findAnswersByApplication(application.id);
  const answerByQid = new Map(answers.map((a) => [a.questionId, a.answer]));
  const assignments = findAssignmentsForApplication(application.id);
  const reviews = findReviewsByApplication(application.id);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={project?.name ?? "Unknown project"}
        description={
          <>
            Applied by{" "}
            {applicant ? (
              <Link
                href={`/u/${applicant.handle}`}
                className="font-semibold underline underline-offset-2"
              >
                {applicant.name ?? applicant.handle}
              </Link>
            ) : (
              "Unknown applicant"
            )}
            {" to "}
            <span className="font-semibold">{grant.title}</span>.
          </>
        }
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants/${grant.id}/applications`}
              className="underline underline-offset-2"
            >
              ← Applications
            </Link>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/${org.slug}/grants/${grant.id}/applications/${application.id}/cross-grants`}
            >
              <Button size="sm" variant="secondary">
                Cross-grants
              </Button>
            </Link>
            <Link
              href={`/applications/${application.id}/versions`}
            >
              <Button size="sm" variant="secondary">
                Versions
              </Button>
            </Link>
            <Badge
              variant={application.status === "ACCEPTED" ? "inverted" : "default"}
            >
              {STATUS_LABEL[application.status]}
            </Badge>
          </div>
        }
      />

      <section className="px-6 py-6">
        <div className="flex flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/applications/${application.id}`,
              `GET /api/applications/${application.id}/answers`,
              `GET /api/applications/${application.id}/reviewers`,
              `GET /api/applications/${application.id}/reviews`,
              `PATCH /api/applications/${application.id}  (decision)`,
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="flex flex-col gap-6">
              <Card title="Cover note">
                {application.coverNote ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {application.coverNote}
                  </p>
                ) : (
                  <p className="text-sm text-[var(--color-fg-subtle)]">No cover note provided.</p>
                )}
              </Card>

              <Card title="Answers">
                {questions.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    This grant didn&apos;t ask any custom questions.
                  </p>
                ) : (
                  <ol className="flex flex-col divide-y divide-black">
                    {questions.map((q, idx) => {
                      const answer = answerByQid.get(q.id);
                      return (
                        <li
                          key={q.id}
                          className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="text-sm font-semibold">
                              {idx + 1}. {q.label}
                              {q.isRequired ? (
                                <span aria-hidden className="ml-1">*</span>
                              ) : null}
                            </h4>
                            <Badge variant="default">
                              {q.type.replace("_", " ")}
                            </Badge>
                          </div>
                          {q.description ? (
                            <p className="text-xs text-[var(--color-fg-muted)]">{q.description}</p>
                          ) : null}
                          {answer ? (
                            <p className="mt-1 whitespace-pre-wrap border border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-sm leading-relaxed">
                              {answer}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs italic text-[var(--color-fg-subtle)]">
                              Not answered.
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>

              <Card title="Reviews">
                {reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews yet"
                    description="Assigned reviewers haven't submitted yet."
                  />
                ) : (
                  <ul className="flex flex-col divide-y divide-black">
                    {reviews.map((r) => {
                      const reviewer = findUserById(r.reviewerId);
                      return (
                        <li
                          key={r.id}
                          className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold">
                                {reviewer?.name ?? reviewer?.handle ?? "Unknown"}
                              </span>
                              <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                                {new Date(r.createdAt).toLocaleDateString()}
                                {r.score != null ? ` · Score ${r.score}/10` : ""}
                              </span>
                            </div>
                            <Badge
                              variant={
                                r.decision === "APPROVE" ? "inverted" : "default"
                              }
                            >
                              {r.decision.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {r.feedback}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card title="Summary">
                <dl className="flex flex-col gap-3">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Project
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {project ? (
                        <Link
                          href={`/discover/projects/${project.id}`}
                          className="font-semibold underline underline-offset-2"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-fg-subtle)]">Unknown</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Applicant
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {applicant ? (
                        <Link
                          href={`/u/${applicant.handle}`}
                          className="underline underline-offset-2"
                        >
                          {applicant.name ?? applicant.handle}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-fg-subtle)]">Unknown</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Funding requested
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm">
                      {application.fundingRequested != null
                        ? `$${application.fundingRequested.toLocaleString()} ${grant.currency}`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Submitted
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                  {application.decidedAt ? (
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest">
                        Decided
                      </dt>
                      <dd className="mt-0.5 text-sm">
                        {new Date(application.decidedAt).toLocaleString()}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </Card>

              <Card title={`Assigned reviewers (${assignments.length})`}>
                {assignments.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-subtle)]">
                    No reviewers assigned yet.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-black">
                    {assignments.map((a) => {
                      const reviewer = findUserById(a.reviewerId);
                      const submitted = reviews.some(
                        (r) => r.reviewerId === a.reviewerId,
                      );
                      return (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">
                              {reviewer?.name ?? reviewer?.handle ?? "Unknown"}
                            </span>
                            {a.dueDate ? (
                              <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                                Due {new Date(a.dueDate).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                          <Badge variant={submitted ? "inverted" : "default"}>
                            {submitted ? "Submitted" : "Pending"}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <DecisionPanel
                applicationId={application.id}
                currentStatus={application.status}
                orgSlug={org.slug}
                grantId={grant.id}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
