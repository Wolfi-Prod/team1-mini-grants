import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById, mockProjectVersions } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import { loginRedirectUrl } from "@/lib/auth/returnTo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectVersionsPage({ params }: PageProps) {
  const { id } = await params;
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/versions`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/versions`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  const versions = mockProjectVersions
    .filter((v) => v.projectId === project.id)
    .sort((a, b) => b.version - a.version);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Versions — ${project.name}`}
        description="Every edit snapshots the project. Use this to see what changed and when — e.g., what a grant reviewer saw when they voted."
        breadcrumbs={
          <Link href={`/projects/${project.id}`} className="underline underline-offset-2">
            ← Back to project
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/projects/${project.id}/versions`,
              `GET /api/projects/${project.id}/versions/:version`,
            ]}
          />

          <Card title={`Version history · ${versions.length}`}>
            {versions.length === 0 ? (
              <EmptyState
                title="No versions yet"
                description="Edit the project to record the first version snapshot."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {versions.map((v, i) => {
                  const author = findUserById(v.changedBy);
                  const latest = i === 0;
                  return (
                    <li key={v.id} className="flex flex-col gap-2 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">Version {v.version}</span>
                        {latest ? <Badge variant="inverted">Latest</Badge> : null}
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {new Date(v.createdAt).toLocaleString()} ·{" "}
                          {author?.name ?? "Unknown"}
                        </span>
                      </div>
                      {v.changeLog ? (
                        <p className="text-sm text-[var(--color-fg)]">{v.changeLog}</p>
                      ) : (
                        <p className="text-xs text-[var(--color-fg-muted)]">No change notes.</p>
                      )}
                      {Object.keys(v.snapshot).length > 0 ? (
                        <details className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] px-3 py-2 text-xs">
                          <summary className="cursor-pointer font-semibold uppercase tracking-widest">
                            Snapshot
                          </summary>
                          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
{JSON.stringify(v.snapshot, null, 2)}
                          </pre>
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
