import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { findProjectById } from "@/lib/mock/projects";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import { findOrgById } from "@/lib/mock/orgs";
import {
  findApplicationById,
  findAnswersByApplication,
} from "@/lib/mock/applications";
import type { ApplicationStatus } from "@/lib/types";
import { ApplicationActions } from "./_components/ApplicationActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const TIMELINE_ORDER: ApplicationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "ACCEPTED",
];

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/applications/${id}`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/applications/${id}`));

  const application = findApplicationById(id);
  if (!application) notFound();

  const project = findProjectById(application.projectId);
  // Access: only the applicant who owns the underlying project can view.
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) notFound();

  const grant = findGrantById(application.grantId);
  const org = grant ? findOrgById(grant.organizationId) : null;
  const questions = grant ? findQuestionsByGrant(grant.id) : [];
  const answers = findAnswersByApplication(application.id);
  const answerByQid = new Map(answers.map((a) => [a.questionId, a.answer]));

  const isDraft = application.status === "DRAFT";
  const isDecided =
    application.status === "ACCEPTED" ||
    application.status === "REJECTED" ||
    application.status === "WITHDRAWN";

  const reachedStatuses = new Set<ApplicationStatus>();
  if (application.status === "DRAFT") {
    reachedStatuses.add("DRAFT");
  } else if (application.status === "SUBMITTED") {
    reachedStatuses.add("DRAFT").add("SUBMITTED");
  } else if (application.status === "IN_REVIEW") {
    reachedStatuses.add("DRAFT").add("SUBMITTED").add("IN_REVIEW");
  } else if (application.status === "ACCEPTED") {
    reachedStatuses.add("DRAFT").add("SUBMITTED").add("IN_REVIEW").add("ACCEPTED");
  } else if (application.status === "REJECTED") {
    reachedStatuses.add("DRAFT").add("SUBMITTED").add("IN_REVIEW");
  } else if (application.status === "WITHDRAWN") {
    reachedStatuses.add("DRAFT").add("SUBMITTED");
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={grant ? grant.title : "Application"}
        description={
          <>
            {project ? (
              <>
                Applied with <span className="font-semibold">{project.name}</span>
                {org ? (
                  <>
                    {" "}
                    to <span className="font-semibold">{org.name}</span>
                  </>
                ) : null}
              </>
            ) : (
              "Application detail"
            )}
          </>
        }
        breadcrumbs={
          <Link href="/applications" className="underline underline-offset-2">
            ← My applications
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={application.status === "ACCEPTED" ? "inverted" : "default"}>
              {STATUS_LABEL[application.status]}
            </Badge>
            <ApplicationActions
              applicationId={application.id}
              status={application.status}
              grantId={application.grantId}
            />
          </div>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/applications/${application.id}`,
              `GET /api/applications/${application.id}/answers`,
              `GET /api/grants/${application.grantId}/questions`,
              "PATCH /api/applications/:id  (status: WITHDRAWN)",
            ]}
          />

          <Card title="Summary">
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest">
                  Project
                </dt>
                <dd className="mt-0.5 text-sm">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    {project.name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest">
                  Grant
                </dt>
                <dd className="mt-0.5 text-sm">
                  {grant ? (
                    <Link
                      href={`/discover/grants/${grant.id}`}
                      className="font-semibold underline underline-offset-2"
                    >
                      {grant.title}
                    </Link>
                  ) : (
                    <span className="text-[var(--color-fg-subtle)]">Unknown grant</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest">
                  Funding requested
                </dt>
                <dd className="mt-0.5 font-mono text-sm">
                  {application.fundingRequested != null
                    ? `$${application.fundingRequested.toLocaleString()} ${grant?.currency ?? ""}`
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
                    : "Not yet submitted"}
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
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest">
                  Last updated
                </dt>
                <dd className="mt-0.5 text-sm">
                  {new Date(application.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Cover note">
            {application.coverNote ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {application.coverNote}
              </p>
            ) : (
              <p className="text-sm text-[var(--color-fg-subtle)]">
                No cover note was provided.
              </p>
            )}
          </Card>

          <Card title="Answers">
            {!grant ? (
              <p className="text-sm text-[var(--color-fg-subtle)]">
                The grant for this application is no longer available.
              </p>
            ) : questions.length === 0 ? (
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
                        <Badge variant="default">{q.type.replace("_", " ")}</Badge>
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
                          {isDraft ? "Not answered yet." : "No answer recorded."}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card title="Timeline">
            <ol className="flex flex-col gap-3">
              {TIMELINE_ORDER.map((step, idx) => {
                const reached = reachedStatuses.has(step);
                const current = application.status === step;
                return (
                  <li
                    key={step}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={
                        reached
                          ? "flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] text-[10px] font-bold text-[var(--color-fg-on-inverted)]"
                          : "flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg)] text-[10px] font-bold text-[var(--color-fg-subtle)]"
                      }
                      aria-hidden
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={
                        reached
                          ? "font-semibold uppercase tracking-wide"
                          : "uppercase tracking-wide text-[var(--color-fg-subtle)]"
                      }
                    >
                      {STATUS_LABEL[step]}
                    </span>
                    {current ? (
                      <Badge variant="inverted">Current</Badge>
                    ) : null}
                  </li>
                );
              })}
              {application.status === "REJECTED" ? (
                <li className="flex items-center gap-3 text-sm">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] text-[10px] font-bold text-[var(--color-fg-on-inverted)]"
                    aria-hidden
                  >
                    X
                  </span>
                  <span className="font-semibold uppercase tracking-wide">Rejected</span>
                  <Badge variant="inverted">Current</Badge>
                </li>
              ) : null}
              {application.status === "WITHDRAWN" ? (
                <li className="flex items-center gap-3 text-sm">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] text-[10px] font-bold text-[var(--color-fg-on-inverted)]"
                    aria-hidden
                  >
                    W
                  </span>
                  <span className="font-semibold uppercase tracking-wide">Withdrawn</span>
                  <Badge variant="inverted">Current</Badge>
                </li>
              ) : null}
            </ol>
            {isDecided ? (
              <p className="mt-4 border-t border-[var(--color-border-muted)] pt-3 text-xs text-[var(--color-fg-muted)]">
                This application is no longer active. You can reapply with the same
                project by starting the flow from{" "}
                <Link href="/discover" className="underline underline-offset-2">
                  Discover
                </Link>
                .
              </p>
            ) : null}
          </Card>

          {!grant ? (
            <EmptyState
              title="Grant unavailable"
              description="The grant this application was made to is no longer published. Your record is preserved above."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
