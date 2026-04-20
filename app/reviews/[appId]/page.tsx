import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  findApplicationById,
  findAnswersByApplication,
} from "@/lib/mock/applications";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import {
  findAssignmentsForApplication,
  findReviewByReviewer,
} from "@/lib/mock/reviews";
import { ReviewForm } from "./_components/ReviewForm";
import type { ApplicationStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ appId: string }>;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "New",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function ReviewDetailPage({ params }: PageProps) {
  const { appId } = await params;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/reviews/${appId}`));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/reviews/${appId}`));

  const application = findApplicationById(appId);
  if (!application) notFound();
  if (application.status === "DRAFT") notFound();

  // Access: must be assigned to review this application, OR be a platform admin.
  const assignments = findAssignmentsForApplication(application.id);
  const isAssigned = assignments.some((a) => a.reviewerId === user.id);
  if (!isAssigned && !user.isPlatformAdmin) notFound();

  const project = findProjectById(application.projectId);
  const applicant = project ? findUserById(project.userId) : null;
  const grant = findGrantById(application.grantId);
  if (!grant) notFound();
  const questions = findQuestionsByGrant(grant.id);
  const answers = findAnswersByApplication(application.id);
  const answerByQid = new Map(answers.map((a) => [a.questionId, a.answer]));
  const existingReview = findReviewByReviewer(application.id, user.id) ?? null;
  const myAssignment = assignments.find((a) => a.reviewerId === user.id) ?? null;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={project?.name ?? "Unknown project"}
        description={
          <>
            Reviewing for <span className="font-semibold">{grant.title}</span>.{" "}
            {applicant ? (
              <>
                Submitted by{" "}
                <Link
                  href={`/u/${applicant.handle}`}
                  className="font-semibold underline underline-offset-2"
                >
                  {applicant.name ?? applicant.handle}
                </Link>
                .
              </>
            ) : null}
          </>
        }
        breadcrumbs={
          <Link href="/reviews" className="text-xs underline underline-offset-2">
            ← My reviews
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant={application.status === "ACCEPTED" ? "inverted" : "default"}
            >
              {STATUS_LABEL[application.status]}
            </Badge>
            {existingReview ? (
              <Badge variant="inverted">Review submitted</Badge>
            ) : (
              <Badge variant="default">Your review pending</Badge>
            )}
          </div>
        }
      />

      <section className="px-6 py-6">
        <div className="flex flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/applications/${application.id}`,
              `GET /api/applications/${application.id}/answers`,
              `GET /api/reviews?applicationId=${application.id}&reviewerId=me`,
              `POST /api/reviews`,
              `PATCH /api/reviews/:id`,
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
                  {myAssignment?.dueDate ? (
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest">
                        Your review due
                      </dt>
                      <dd className="mt-0.5 text-sm">
                        {new Date(myAssignment.dueDate).toLocaleDateString()}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </Card>

              <ReviewForm
                applicationId={application.id}
                existingReview={existingReview}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
