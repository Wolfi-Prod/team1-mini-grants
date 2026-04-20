import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  findApplicationById,
  findVersionsByApplication,
} from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import { findUserById } from "@/lib/mock/users";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationVersionsPage({ params }: PageProps) {
  const { id } = await params;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/applications/${id}/versions`));
  const viewer = await getServerUser();
  if (!viewer) redirect(loginRedirectUrl(`/applications/${id}/versions`));

  const application = findApplicationById(id);
  if (!application) notFound();

  const project = findProjectById(application.projectId);
  const grant = findGrantById(application.grantId);
  if (!project || !grant) notFound();

  // Access rule: applicant (project owner) always. Platform admin always. Org owner/member
  // of the grant-running org. Everyone else 404.
  const viewerOrg = role === "org" ? await getServerOrg() : null;
  const isOwner = project.userId === viewer.id;
  const isOrgScoped = viewerOrg?.id === grant.organizationId;
  const canSee = isOwner || viewer.isPlatformAdmin || isOrgScoped;
  if (!canSee) notFound();

  const versions = findVersionsByApplication(id);
  const questions = findQuestionsByGrant(grant.id);
  const questionLookup = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Version history — ${project.name}`}
        description={`Every submit creates a snapshot. Reviewers can see what changed between versions; the org's decision is against the latest.`}
        breadcrumbs={
          <Link
            href={`/applications/${application.id}`}
            className="underline underline-offset-2"
          >
            ← Application
          </Link>
        }
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/applications/${application.id}/versions`,
              `GET /api/applications/${application.id}/versions/:version`,
            ]}
          />

          <Card title={`${versions.length} version${versions.length === 1 ? "" : "s"}`}>
            {versions.length === 0 ? (
              <EmptyState
                title="No versions yet"
                description="The first submit writes v1. If the org asks for changes, resubmitting writes v2."
              />
            ) : (
              <ol className="flex flex-col divide-y divide-black">
                {versions.map((v, i) => {
                  const previous = i > 0 ? versions[i - 1] : null;
                  const latest = i === versions.length - 1;
                  const author = findUserById(v.submittedBy);
                  const coverChanged =
                    previous !== null &&
                    previous.snapshot.coverNote !== v.snapshot.coverNote;
                  const fundingChanged =
                    previous !== null &&
                    previous.snapshot.fundingRequested !== v.snapshot.fundingRequested;
                  const changedAnswerIds = new Set<string>();
                  if (previous) {
                    const prevMap = new Map(
                      previous.snapshot.answers.map((a) => [a.questionId, a.answer]),
                    );
                    for (const a of v.snapshot.answers) {
                      if (prevMap.get(a.questionId) !== a.answer) {
                        changedAnswerIds.add(a.questionId);
                      }
                    }
                  }
                  return (
                    <li key={v.id} className="flex flex-col gap-3 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">Version {v.version}</span>
                        {latest ? <Badge variant="inverted">Latest</Badge> : null}
                        {previous === null ? <Badge>Initial</Badge> : null}
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {new Date(v.createdAt).toLocaleString()} ·{" "}
                          {author?.name ?? v.submittedBy}
                        </span>
                      </div>

                      <dl className="grid gap-3 text-sm">
                        <div
                          className={
                            coverChanged
                              ? "border-l-2 border-[var(--color-border-muted)] pl-3"
                              : ""
                          }
                        >
                          <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                            Cover note {coverChanged ? "· changed" : null}
                          </dt>
                          <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">
                            {v.snapshot.coverNote ?? (
                              <em className="text-[var(--color-fg-subtle)]">empty</em>
                            )}
                          </dd>
                          {coverChanged && previous?.snapshot.coverNote ? (
                            <details className="mt-1 text-xs text-[var(--color-fg-muted)]">
                              <summary className="cursor-pointer">Previous</summary>
                              <p className="mt-1 whitespace-pre-wrap border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-2">
                                {previous.snapshot.coverNote}
                              </p>
                            </details>
                          ) : null}
                        </div>

                        <div
                          className={
                            fundingChanged ? "border-l-2 border-[var(--color-border-muted)] pl-3" : ""
                          }
                        >
                          <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                            Funding requested {fundingChanged ? "· changed" : null}
                          </dt>
                          <dd className="mt-0.5 font-semibold">
                            {v.snapshot.fundingRequested !== null
                              ? `${grant.currency} ${v.snapshot.fundingRequested.toLocaleString()}`
                              : "—"}
                          </dd>
                          {fundingChanged && previous ? (
                            <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                              Previous:{" "}
                              {previous.snapshot.fundingRequested !== null
                                ? `${grant.currency} ${previous.snapshot.fundingRequested.toLocaleString()}`
                                : "—"}
                            </p>
                          ) : null}
                        </div>

                        {v.snapshot.answers.length > 0 ? (
                          <div>
                            <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                              Answers
                            </dt>
                            <ul className="mt-2 flex flex-col gap-2">
                              {v.snapshot.answers.map((a) => {
                                const q = questionLookup.get(a.questionId);
                                const changed = changedAnswerIds.has(a.questionId);
                                const prevAnswer = previous?.snapshot.answers.find(
                                  (p) => p.questionId === a.questionId,
                                )?.answer;
                                return (
                                  <li
                                    key={a.questionId}
                                    className={
                                      changed ? "border-l-2 border-[var(--color-border-muted)] pl-3" : ""
                                    }
                                  >
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                                      {q?.label ?? a.questionId}
                                      {changed ? " · changed" : null}
                                    </span>
                                    <p className="mt-0.5 whitespace-pre-wrap text-sm">
                                      {a.answer}
                                    </p>
                                    {changed && prevAnswer ? (
                                      <details className="mt-1 text-xs text-[var(--color-fg-muted)]">
                                        <summary className="cursor-pointer">
                                          Previous
                                        </summary>
                                        <p className="mt-1 whitespace-pre-wrap border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-2">
                                          {prevAnswer}
                                        </p>
                                      </details>
                                    ) : null}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
