import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Button } from "@/app/_components/ui/Button";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { findProjectsByOwner } from "@/lib/mock/projects";
import { mockApplications } from "@/lib/mock/applications";
import type { ApplicationStatus } from "@/lib/types";
import { MyProjectsList, type ProjectSummary } from "./_components/MyProjectsList";

export default async function MyProjectsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/projects"));
  // Projects are an applicant-only concept. Admin + Org users run the platform / run grants
  // — they don't submit projects. Bounce them to their own dashboards.
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/projects"));

  // API: GET /api/projects?ownerId={me}
  const projects = findProjectsByOwner(user.id);

  // API: GET /api/applications?projectIds=... (aggregate counts)
  const summaries: ProjectSummary[] = projects.map((project) => {
    const apps = mockApplications.filter((a) => a.projectId === project.id);
    const applicationCounts: Partial<Record<ApplicationStatus, number>> = {};
    for (const a of apps) {
      applicationCounts[a.status] = (applicationCounts[a.status] ?? 0) + 1;
    }
    return {
      project,
      applicationCounts,
      totalApplications: apps.length,
    };
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My projects"
        description="Everything you've built on Backyard. Create a new project, edit an existing one, or apply to a grant."
        actions={
          <Link href="/projects/new">
            <Button variant="primary">Create new project</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            "GET /api/projects?ownerId=me&search=&status=&sort=",
            "GET /api/applications?projectIds=...  (to compute per-project counts)",
            "DELETE /api/projects/:id",
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <div className="mx-auto max-w-6xl">
          <MyProjectsList summaries={summaries} />
        </div>
      </section>
    </div>
  );
}
