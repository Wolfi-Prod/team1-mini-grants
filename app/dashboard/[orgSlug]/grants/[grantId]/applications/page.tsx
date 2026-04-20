import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import {
  findApplicationsByGrant,
} from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import { OrgApplicationsList } from "./_components/OrgApplicationsList";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function OrgGrantApplicationsPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const applications = findApplicationsByGrant(grantId);

  const rows = applications.map((app) => {
    const project = findProjectById(app.projectId) ?? null;
    const applicant = project ? findUserById(project.userId) ?? null : null;
    return { application: app, project, applicant };
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={grant.title}
        description={`${applications.length} application${applications.length === 1 ? "" : "s"}`}
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants`}
              className="underline underline-offset-2"
            >
              ← Grants
            </Link>
            {" · "}
            <Badge variant={grant.status === "OPEN" ? "inverted" : "default"}>
              {grant.status}
            </Badge>
          </span>
        }
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            `GET /api/grants/${grant.id}/applications?status=&search=&sort=`,
            `GET /api/projects?ids=...  (project join)`,
            `GET /api/users?ids=...     (applicant join)`,
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <OrgApplicationsList
          orgSlug={org.slug}
          grantId={grant.id}
          rows={rows}
        />
      </section>
    </div>
  );
}
