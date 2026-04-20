import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findApplicationsByGrant } from "@/lib/mock/applications";
import { findReviewAssignmentsByGrant } from "@/lib/mock/reviews";
import { findProjectById } from "@/lib/mock/projects";
import { mockUsers, findUserById } from "@/lib/mock/users";
import { ReviewersPanel } from "./_components/ReviewersPanel";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function GrantReviewersPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const applications = findApplicationsByGrant(grantId).filter((a) => a.status !== "DRAFT");
  const assignments = findReviewAssignmentsByGrant(grantId);

  const appRows = applications.map((app) => {
    const project = findProjectById(app.projectId) ?? null;
    const applicant = project ? findUserById(project.userId) ?? null : null;
    return { app, project, applicant };
  });

  // Pool of candidate reviewers: every user except the owner (we never auto-ban org
  // members — COI checks land later).
  const candidates = mockUsers
    .filter((u) => !u.deletedAt)
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.handle ?? u.email,
      email: u.email,
      handle: u.handle ?? u.id,
    }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Reviewers — ${grant.title}`}
        description="Assign reviewers to each submitted application. One reviewer can cover multiple apps; one app can have multiple reviewers."
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants/${grant.id}`}
              className="underline underline-offset-2"
            >
              ← Dashboard
            </Link>
          </span>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET    /api/grants/${grant.id}/reviewer-assignments`,
              `POST   /api/grants/${grant.id}/reviewer-assignments`,
              `DELETE /api/grants/${grant.id}/reviewer-assignments/:assignmentId`,
            ]}
          />
          <ReviewersPanel
            applications={appRows}
            initialAssignments={assignments}
            candidates={candidates}
          />
        </div>
      </section>
    </div>
  );
}
