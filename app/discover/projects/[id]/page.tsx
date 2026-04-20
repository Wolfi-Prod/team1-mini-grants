import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import {
  findProjectById,
  mockProjectTeam,
  mockProjectUpdates,
  mockFileLinks,
  canSeeFullProject,
  isSectionPublic,
} from "@/lib/mock/projects";
import { mockApplications } from "@/lib/mock/applications";
import { mockGrants, findGrantById } from "@/lib/mock/grants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProjectPage({ params }: PageProps) {
  const { id } = await params;

  const role = await getServerRole();
  const viewer = await getServerUser();
  const viewerOrg = role === "org" ? await getServerOrg() : null;
  const viewerOrgIds = viewerOrg ? [viewerOrg.id] : [];

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();

  // Owners always go to their own /projects/[id] surface — this is the public view.
  if (viewer && viewer.id === project.userId) {
    redirect(`/projects/${project.id}`);
  }

  // Full-access viewers: platform admin + any org that received an application from this
  // project. They see everything regardless of visibility or archive state.
  const fullAccess = canSeeFullProject(
    viewer,
    project,
    mockApplications,
    mockGrants,
    viewerOrgIds,
  );

  if (!fullAccess) {
    if (project.visibility === "PRIVATE") notFound();
    if (project.archivedAt) notFound();
  }

  const team = mockProjectTeam.filter((t) => t.projectId === project.id);
  const files = mockFileLinks.filter((f) => f.projectId === project.id);
  const updates = mockProjectUpdates
    .filter((u) => u.projectId === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const applications = mockApplications
    .filter((a) => a.projectId === project.id)
    .map((a) => ({ app: a, grant: findGrantById(a.grantId) }));

  const show = (section: Parameters<typeof isSectionPublic>[1]) =>
    fullAccess || isSectionPublic(project, section);

  const showProblemStatement = show("problemStatement");
  const showWebsiteUrl = show("websiteUrl");
  const showProjectUrl = show("projectUrl");
  const showOtherLinks = show("otherLinks");
  const showContracts = show("contractAddresses");
  const showTeam = show("team");
  const showFiles = show("files");
  const showUpdates = show("updates");
  const showApplications = show("applications");

  const initial = project.name.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col">
      {fullAccess && viewer ? (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-3 text-[var(--color-fg-on-inverted)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Privileged view
            {viewer.isPlatformAdmin
              ? " · platform admin"
              : viewerOrgIds.length > 0
                ? ` · org ${viewerOrg?.name ?? ""} has an application from this project`
                : ""}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Visibility: {project.visibility}
            {project.archivedAt ? " · ARCHIVED" : ""}
          </span>
        </div>
      ) : null}

      <section className="border-b border-[var(--color-border-muted)]">
        {project.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.bannerUrl}
            alt=""
            className="aspect-[3/1] md:aspect-[5/1] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[3/1] md:aspect-[5/1] w-full items-center justify-center border-b border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]">
            No banner
          </div>
        )}
      </section>

      <section className="border-b border-[var(--color-border-muted)] px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Link href="/discover" className="text-xs underline underline-offset-2">
            ← Discover
          </Link>
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
              {project.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.logoUrl}
                  alt={`${project.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black uppercase">{initial}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold uppercase leading-tight">
                {project.name}
              </h1>
              {project.categories.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {project.categories.map((c) => (
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
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/discover/projects/${project.id}`,
              `GET /api/discover/projects/${project.id}/team`,
              `GET /api/discover/projects/${project.id}/files`,
              `GET /api/discover/projects/${project.id}/updates`,
              `GET /api/discover/projects/${project.id}/applications`,
            ]}
          />

          <Card title="Overview">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                  Description
                </h3>
                <p className="mt-1 text-sm leading-relaxed">{project.description}</p>
              </div>
              {project.problemStatement && showProblemStatement ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Problem statement
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">
                    {project.problemStatement}
                  </p>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {project.websiteUrl && showWebsiteUrl ? (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      Website
                    </h3>
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm underline underline-offset-2"
                    >
                      {project.websiteUrl}
                    </a>
                  </div>
                ) : null}
                {project.projectUrl && showProjectUrl ? (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      Live demo
                    </h3>
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm underline underline-offset-2"
                    >
                      {project.projectUrl}
                    </a>
                  </div>
                ) : null}
              </div>
              {project.otherLinks.length > 0 && showOtherLinks ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Other links
                  </h3>
                  <ul className="mt-1 flex flex-col gap-1">
                    {project.otherLinks.map((link) => (
                      <li key={link}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-sm underline underline-offset-2"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.contractAddresses.length > 0 && showContracts ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Smart contracts
                  </h3>
                  <ul className="mt-1 flex flex-col gap-1">
                    {project.contractAddresses.map((addr) => (
                      <li key={addr} className="break-all font-mono text-xs">
                        {addr}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.imageUrls.length > 0 ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Pictures
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                    {project.imageUrls.map((url) => (
                      <div key={url} className="border border-[var(--color-border-muted)]">
                        <div className="aspect-square w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {showTeam && team.length > 0 ? (
            <Card title="Team">
              <ul className="flex flex-col divide-y divide-black">
                {team.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{m.name}</span>
                      {m.role ? (
                        <span className="text-[10px] uppercase tracking-widest">
                          {m.role}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest">
                      {m.github ? <span>GH: {m.github}</span> : null}
                      {m.twitter ? <span>X: {m.twitter}</span> : null}
                      {m.linkedIn ? <span>LI: {m.linkedIn}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {showFiles && files.length > 0 ? (
            <Card title="Files">
              <ul className="flex flex-col divide-y divide-black">
                {files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm font-semibold underline underline-offset-2"
                      >
                        {f.name}
                      </a>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {f.type}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {showUpdates && updates.length > 0 ? (
            <Card title="Updates">
              <ul className="flex flex-col divide-y divide-black">
                {updates.map((u) => (
                  <li key={u.id} className="flex flex-col gap-1 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold">{u.title}</h4>
                      <span className="shrink-0 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{u.content}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {showApplications && applications.length > 0 ? (
            <Card title="Grant history">
              <ul className="flex flex-col divide-y divide-black">
                {applications.map(({ app, grant }) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      {grant ? (
                        <Link
                          href={`/discover/grants/${grant.id}`}
                          className="truncate text-sm font-bold underline underline-offset-2"
                        >
                          {grant.title}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-bold text-[var(--color-fg-subtle)]">
                          Unknown grant
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {app.submittedAt
                          ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                          : "Not submitted"}
                        {app.fundingRequested
                          ? ` · $${app.fundingRequested.toLocaleString()}`
                          : ""}
                      </span>
                    </div>
                    <Badge variant={app.status === "ACCEPTED" ? "inverted" : "default"}>
                      {app.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {!showTeam &&
          !showFiles &&
          !showUpdates &&
          !showApplications &&
          !showProblemStatement &&
          !showWebsiteUrl &&
          !showProjectUrl &&
          !showOtherLinks &&
          !showContracts ? (
            <EmptyState
              title="This project keeps most details private"
              description="The owner has hidden team, files, updates, and other details from the public showcase."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
