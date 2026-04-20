import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import {
  findProjectById,
  mockProjectTeam,
  mockProjectUpdates,
  mockFileLinks,
  getVisibilityLabel,
  isSectionPublic,
} from "@/lib/mock/projects";
import { mockApplications } from "@/lib/mock/applications";
import { findGrantById } from "@/lib/mock/grants";
import { ProjectActions } from "./_components/ProjectActions";
import { SectionVisibilityToggle } from "./_components/SectionVisibilityToggle";
import { loginRedirectUrl } from "@/lib/auth/returnTo";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { preview } = await searchParams;
  const previewMode = preview === "1";

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}${previewMode ? "?preview=1" : ""}`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}${previewMode ? "?preview=1" : ""}`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();

  // Non-owners see the public project page instead.
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  const team = mockProjectTeam.filter((t) => t.projectId === project.id);
  const files = mockFileLinks.filter((f) => f.projectId === project.id);
  const updates = mockProjectUpdates
    .filter((u) => u.projectId === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const applications = mockApplications
    .filter((a) => a.projectId === project.id)
    .map((a) => ({ app: a, grant: findGrantById(a.grantId) }));

  const initial = project.name.charAt(0).toUpperCase() || "?";

  // In preview mode, the owner sees only what a public viewer would see.
  // Outside preview mode, the owner sees everything and can toggle section visibility.
  const showProblemStatement = !previewMode || isSectionPublic(project, "problemStatement");
  const showWebsiteUrl = !previewMode || isSectionPublic(project, "websiteUrl");
  const showProjectUrl = !previewMode || isSectionPublic(project, "projectUrl");
  const showOtherLinks = !previewMode || isSectionPublic(project, "otherLinks");
  const showContracts = !previewMode || isSectionPublic(project, "contractAddresses");
  const showTeam = !previewMode || isSectionPublic(project, "team");
  const showFiles = !previewMode || isSectionPublic(project, "files");
  const showUpdates = !previewMode || isSectionPublic(project, "updates");
  const showApplications = !previewMode || isSectionPublic(project, "applications");
  const visibilityLabel = getVisibilityLabel(project);

  return (
    <div className="flex flex-col">
      {previewMode ? (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-3 text-[var(--color-fg-on-inverted)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Previewing as the public
            {project.archivedAt
              ? " · project is archived — non-owners get a 404"
              : project.visibility === "PRIVATE"
                ? " · project is private — non-owners get a 404"
                : project.visibility === "CUSTOM"
                  ? ` · ${project.hiddenSections.length} section${project.hiddenSections.length === 1 ? "" : "s"} hidden`
                  : " · everything visible"}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="border border-[var(--color-fg-on-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
          >
            Exit preview
          </Link>
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
            No banner uploaded
          </div>
        )}
      </section>

      <section className="border-b border-[var(--color-border-muted)] px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Link href="/projects" className="text-xs underline underline-offset-2">
            ← My projects
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg)]">
                {project.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.logoUrl}
                    alt={`${project.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black uppercase" style={{ fontFamily: "var(--font-display)" }}>{initial}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold uppercase leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {project.name}
                </h1>
                <div className="flex flex-wrap gap-1">
                  <span
                    className={
                      project.archivedAt || project.visibility === "PRIVATE"
                        ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                        : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                    }
                    title="Project visibility"
                  >
                    {visibilityLabel}
                  </span>
                  {project.categories.map((c) => (
                    <span
                      key={c}
                      className="border border-[var(--color-border-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {previewMode ? null : <ProjectActions project={project} />}
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/projects/${project.id}`,
              `GET /api/projects/${project.id}/team`,
              `GET /api/projects/${project.id}/files`,
              `GET /api/projects/${project.id}/updates`,
              `GET /api/applications?projectId=${project.id}`,
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      Problem statement
                    </h3>
                    {previewMode ? null : (
                      <SectionVisibilityToggle
                        projectId={project.id}
                        section="problemStatement"
                        visibility={project.visibility}
                        hidden={project.hiddenSections.includes("problemStatement")}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{project.problemStatement}</p>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                {project.websiteUrl && showWebsiteUrl ? (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">
                        Website
                      </h3>
                      {previewMode ? null : (
                        <SectionVisibilityToggle
                          projectId={project.id}
                          section="websiteUrl"
                          visibility={project.visibility}
                          hidden={project.hiddenSections.includes("websiteUrl")}
                        />
                      )}
                    </div>
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">
                        Live demo
                      </h3>
                      {previewMode ? null : (
                        <SectionVisibilityToggle
                          projectId={project.id}
                          section="projectUrl"
                          visibility={project.visibility}
                          hidden={project.hiddenSections.includes("projectUrl")}
                        />
                      )}
                    </div>
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      Other links
                    </h3>
                    {previewMode ? null : (
                      <SectionVisibilityToggle
                        projectId={project.id}
                        section="otherLinks"
                        visibility={project.visibility}
                        hidden={project.hiddenSections.includes("otherLinks")}
                      />
                    )}
                  </div>
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
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">
                      Smart contracts
                    </h3>
                    {previewMode ? null : (
                      <SectionVisibilityToggle
                        projectId={project.id}
                        section="contractAddresses"
                        visibility={project.visibility}
                        hidden={project.hiddenSections.includes("contractAddresses")}
                      />
                    )}
                  </div>
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

          {showTeam ? (
          <Card
            title="Team"
            actions={
              <>
                {previewMode ? null : (
                  <SectionVisibilityToggle
                    projectId={project.id}
                    section="team"
                    visibility={project.visibility}
                    hidden={project.hiddenSections.includes("team")}
                  />
                )}
                {previewMode ? null : (
                  <Link href={`/projects/${project.id}/team`}>
                    <Button size="sm" variant="secondary">
                      Manage
                    </Button>
                  </Link>
                )}
              </>
            }
          >
            {team.length === 0 ? (
              <EmptyState
                title="No team members yet"
                description="Add your teammates so reviewers know who's building."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                {team.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col gap-1 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{m.name}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">{m.email}</span>
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
            )}
          </Card>
          ) : null}

          {showFiles ? (
          <Card
            title="Files"
            actions={
              <>
                {previewMode ? null : (
                  <SectionVisibilityToggle
                    projectId={project.id}
                    section="files"
                    visibility={project.visibility}
                    hidden={project.hiddenSections.includes("files")}
                  />
                )}
                {previewMode ? null : (
                  <Link href={`/projects/${project.id}/files`}>
                    <Button size="sm" variant="secondary">
                      Manage
                    </Button>
                  </Link>
                )}
              </>
            }
          >
            {files.length === 0 ? (
              <EmptyState
                title="No files uploaded"
                description="Attach pitch decks, whitepapers, or demo recordings."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
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
            )}
          </Card>
          ) : null}

          {showUpdates ? (
          <Card
            title="Updates"
            actions={
              <>
                {previewMode ? null : (
                  <SectionVisibilityToggle
                    projectId={project.id}
                    section="updates"
                    visibility={project.visibility}
                    hidden={project.hiddenSections.includes("updates")}
                  />
                )}
                {previewMode ? null : (
                  <Link href={`/projects/${project.id}/updates`}>
                    <Button size="sm" variant="secondary">
                      New update
                    </Button>
                  </Link>
                )}
              </>
            }
          >
            {updates.length === 0 ? (
              <EmptyState
                title="No updates posted"
                description="Progress updates show on your public showcase page."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
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
            )}
          </Card>
          ) : null}

          {showApplications ? (
          <Card
            title="Applications"
            actions={
              <>
                {previewMode ? null : (
                  <SectionVisibilityToggle
                    projectId={project.id}
                    section="applications"
                    visibility={project.visibility}
                    hidden={project.hiddenSections.includes("applications")}
                  />
                )}
                <Link href="/discover">
                  <Button size="sm" variant="primary">
                    Apply to grant
                  </Button>
                </Link>
              </>
            }
          >
            {applications.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Browse open grants on Discover and apply with this project."
                action={
                  <Link href="/discover">
                    <Button variant="secondary">Browse grants</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                {applications.map(({ app, grant }) => (
                  <li
                    key={app.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="truncate text-sm font-bold underline underline-offset-2"
                      >
                        {grant?.title ?? "Unknown grant"}
                      </Link>
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
            )}
          </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
