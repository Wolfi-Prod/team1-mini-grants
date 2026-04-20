import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import {
  findUserByHandle,
  findOrgIdsForUser,
  getProfileViewFor,
  getProjectsForProfileView,
  getGrantHistoryForProfileView,
  getCompetitionHistoryForProfileView,
} from "@/lib/mock/users";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { getVisibilityLabel } from "@/lib/mock/projects";
import type { ApplicationStatus, ProfileViewMode } from "@/lib/types";

interface PageProps {
  params: Promise<{ handle: string }>;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function viewModeLabel(mode: ProfileViewMode, orgName?: string | null): string {
  switch (mode) {
    case "public":
      return "PUBLIC";
    case "self":
      return "YOU";
    case "admin":
      return "ADMIN";
    case "org":
      return orgName ? `ORG · ${orgName.toUpperCase()}` : "ORG";
  }
}

export default async function ApplicantProfilePage({ params }: PageProps) {
  const { handle } = await params;

  const viewer = await getServerUser();
  const viewerRole = await getServerRole();
  const viewerOrg = viewerRole === "org" ? await getServerOrg() : null;
  const viewerOrgIds = viewer ? findOrgIdsForUser(viewer.id) : [];

  const target = findUserByHandle(handle);
  if (!target || target.deletedAt) notFound();

  // /u/me shortcut → redirect to the signed-in user's handle.
  if (handle === "me") {
    if (!viewer) redirect(loginRedirectUrl(`/u/${handle}`));
    redirect(`/u/${viewer.handle}`);
  }

  const mode = getProfileViewFor(viewer, target, viewerOrgIds);

  // Respect the user's isProfilePublic toggle for unprivileged viewers. Admin and org
  // modes bypass it — they have a business reason to see even a "private" profile.
  if (!target.isProfilePublic && mode === "public") {
    return (
      <div className="flex flex-col">
        <PageHeader
          title={target.name ?? handle}
          description="This applicant has made their profile private."
        />
        <section className="px-6 py-10">
          <div className="mx-auto max-w-2xl">
            <EmptyState
              title="Profile is private"
              description="The owner has chosen to keep their profile hidden from public viewers. Sign in as an org that works with them, or as a platform admin, to see more."
            />
          </div>
        </section>
      </div>
    );
  }

  const projects = getProjectsForProfileView(target, mode, viewerOrgIds);
  const grantHistory = getGrantHistoryForProfileView(target, mode, viewerOrgIds);
  const competitionHistory = getCompetitionHistoryForProfileView(
    target,
    mode,
    viewerOrgIds,
  );
  const derivedCategories = Array.from(
    new Set(projects.flatMap((p) => p.categories)),
  ).sort();

  const initial = (target.name ?? target.handle).charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col">
      <PageHeader
        title={target.name ?? target.handle}
        description={
          target.bio ? (
            target.bio
          ) : (
            <span className="text-[var(--color-fg-subtle)]">No bio yet.</span>
          )
        }
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            @{target.handle}
            {mode !== "public" ? (
              <>
                {" · "}
                <Badge variant="inverted">
                  {viewModeLabel(mode, viewerOrg?.name)}
                </Badge>
              </>
            ) : null}
          </span>
        }
        actions={
          mode === "self" ? (
            <Link href="/settings/profile" className="text-xs underline underline-offset-2">
              Edit profile
            </Link>
          ) : null
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/users/${target.handle}`,
              `GET /api/users/${target.handle}/projects`,
              `GET /api/users/${target.handle}/grants       (scoped to viewer permissions)`,
              `GET /api/users/${target.handle}/competitions (scoped to viewer permissions)`,
            ]}
          />

          <Card title="About">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
                {target.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={target.image}
                    alt={`${target.name ?? target.handle} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>{initial}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold uppercase leading-tight">
                    {target.name ?? target.handle}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                    @{target.handle}
                  </span>
                </div>
                {derivedCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {derivedCategories.map((c) => (
                      <span
                        key={c}
                        className="border border-[var(--color-border-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card
            title={
              mode === "self"
                ? "My projects"
                : mode === "admin"
                  ? "All projects"
                  : mode === "org"
                    ? `Projects applied to ${viewerOrg?.name ?? "your org"}`
                    : "Public projects"
            }
          >
            {projects.length === 0 ? (
              <EmptyState
                title={
                  mode === "self"
                    ? "You haven't created any projects yet"
                    : mode === "org"
                      ? "No projects have applied to your org yet"
                      : "No public projects"
                }
                description={
                  mode === "self"
                    ? "Start your first project — you can toggle visibility any time."
                    : undefined
                }
                action={
                  mode === "self" ? (
                    <Link
                      href="/projects/new"
                      className="border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                    >
                      Create project
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => {
                  const href =
                    mode === "self" ? `/projects/${p.id}` : `/discover/projects/${p.id}`;
                  return (
                    <Link
                      key={p.id}
                      href={href}
                      className="flex flex-col gap-2 border border-[var(--color-border-muted)] p-4 hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold uppercase leading-tight">
                          {p.name}
                        </h3>
                        {mode !== "public" ? (
                          <span className="border border-current px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                            {getVisibilityLabel(p)}
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-3 text-xs leading-relaxed">
                        {p.description}
                      </p>
                      {p.categories.length > 0 ? (
                        <div className="mt-auto flex flex-wrap gap-1 pt-2">
                          {p.categories.map((c) => (
                            <span
                              key={c}
                              className="border border-current px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {mode !== "public" ? (
            <Card
              title={
                mode === "org"
                  ? `Grant history with ${viewerOrg?.name ?? "your org"}`
                  : "Grant history"
              }
              description={
                mode === "org"
                  ? "Only applications to grants run by your org are shown. Other orgs' history is not visible to you."
                  : undefined
              }
            >
              {grantHistory.length === 0 ? (
                <EmptyState
                  title="No grant history"
                  description={
                    mode === "org"
                      ? "This applicant hasn't applied to any grant run by your org."
                      : "No applications on record yet."
                  }
                />
              ) : (
                <Table
                  rows={grantHistory}
                  getRowKey={(r) => r.application.id}
                  columns={[
                    {
                      key: "grant",
                      header: "Grant",
                      render: (r) => (
                        <Link
                          href={`/discover/grants/${r.grant.id}`}
                          className="text-sm font-bold underline underline-offset-2"
                        >
                          {r.grant.title}
                        </Link>
                      ),
                    },
                    {
                      key: "org",
                      header: "Org",
                      render: (r) =>
                        r.org ? (
                          <span className="text-sm">{r.org.name}</span>
                        ) : (
                          <span className="text-sm text-[var(--color-fg-subtle)]">—</span>
                        ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (r) => (
                        <Badge
                          variant={
                            r.application.status === "ACCEPTED"
                              ? "inverted"
                              : "default"
                          }
                        >
                          {STATUS_LABEL[r.application.status]}
                        </Badge>
                      ),
                    },
                    {
                      key: "funding",
                      header: "Funding",
                      render: (r) =>
                        r.application.fundingRequested != null ? (
                          <span className="text-sm font-mono">
                            ${r.application.fundingRequested.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-fg-subtle)]">—</span>
                        ),
                      className: "w-32",
                    },
                    {
                      key: "submitted",
                      header: "Submitted",
                      render: (r) =>
                        r.application.submittedAt ? (
                          <span className="text-xs">
                            {new Date(
                              r.application.submittedAt,
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-fg-subtle)]">Draft</span>
                        ),
                      className: "w-28",
                    },
                  ]}
                />
              )}
            </Card>
          ) : null}

          {mode !== "public" ? (
            <Card
              title={
                mode === "org"
                  ? `Competitions run by ${viewerOrg?.name ?? "your org"}`
                  : "Competition history"
              }
              description={
                mode === "org"
                  ? "Only teams in competitions your org runs are shown."
                  : undefined
              }
            >
              {competitionHistory.length === 0 ? (
                <EmptyState
                  title="No competition activity"
                  description={
                    mode === "org"
                      ? "This applicant hasn't joined a competition your org runs."
                      : "Team submissions to hackathons and challenges will appear here."
                  }
                />
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                  {competitionHistory.map((r) => {
                    const basePath =
                      r.competition.format === "HACKATHON"
                        ? "/hackathons"
                        : "/challenges";
                    return (
                      <li
                        key={r.team.id}
                        className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <Link
                            href={`${basePath}/${r.competition.id}`}
                            className="text-sm font-bold underline underline-offset-2"
                          >
                            {r.competition.title}
                          </Link>
                          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                            Team {r.team.name}
                            {r.team.leadUserId === target.id ? " · LEAD" : " · MEMBER"}
                          </span>
                        </div>
                        {r.submission ? (
                          <Badge
                            variant={
                              r.submission.status === "WINNER" ? "inverted" : "default"
                            }
                          >
                            {r.submission.status.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                            Not submitted
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          ) : null}

          {mode === "self" || mode === "admin" ? (
            <Card title="Account">
              <dl className="grid gap-3 md:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest">
                    Email
                  </dt>
                  <dd className="mt-0.5 text-sm">{target.email}</dd>
                </div>
                {target.builderHubId ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Builder Hub ID
                    </dt>
                    <dd className="mt-0.5 font-mono text-xs">
                      {target.builderHubId}
                    </dd>
                  </div>
                ) : null}
                {target.country ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Country
                    </dt>
                    <dd className="mt-0.5 text-sm">
                      {target.country}
                      {target.state ? ` · ${target.state}` : ""}
                    </dd>
                  </div>
                ) : null}
                {target.telegram ? (
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Telegram
                    </dt>
                    <dd className="mt-0.5 text-sm">{target.telegram}</dd>
                  </div>
                ) : null}
                {target.walletAddress ? (
                  <div className="md:col-span-2">
                    <dt className="text-[10px] font-bold uppercase tracking-widest">
                      Wallet
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-xs">
                      {target.walletAddress}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-widest">
                    Joined
                  </dt>
                  <dd className="mt-0.5 text-sm">
                    {new Date(target.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
