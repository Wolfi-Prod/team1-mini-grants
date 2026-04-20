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
import { findGrantById } from "@/lib/mock/grants";
import { MyApplicationsList, type ApplicationRow } from "./_components/MyApplicationsList";

export default async function MyApplicationsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/applications"));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/applications"));

  const projects = findProjectsByOwner(user.id);
  const projectIds = new Set(projects.map((p) => p.id));
  const projectsById = new Map(projects.map((p) => [p.id, p]));

  // API: GET /api/applications?projectIds=...
  const rows: ApplicationRow[] = mockApplications
    .filter((a) => projectIds.has(a.projectId))
    .map((a) => ({
      application: a,
      project: projectsById.get(a.projectId) ?? null,
      grant: findGrantById(a.grantId) ?? null,
    }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My applications"
        description="Every grant application you've started or submitted. Drafts stay here until you submit."
        actions={
          <Link href="/discover">
            <Button variant="primary">Browse open grants</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            "GET /api/applications?ownerId=me&status=&search=&sort=",
            "GET /api/projects?ownerId=me  (for project join)",
            "GET /api/grants?ids=...        (for grant join)",
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <div className="mx-auto max-w-6xl">
          <MyApplicationsList rows={rows} />
        </div>
      </section>
    </div>
  );
}
