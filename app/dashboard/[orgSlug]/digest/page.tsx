import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import {
  mockReviewerAssignments,
  isAssignmentComplete,
} from "@/lib/mock/reviews";
import { DigestSettingsForm } from "./_components/DigestSettingsForm";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function DigestSettingsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  // Build a mock preview of what the weekly digest would contain for this org.
  const grants = findGrantsByOrg(org.id).filter((g) => !g.deletedAt);
  const grantIds = new Set(grants.map((g) => g.id));
  const apps = mockApplications.filter((a) => grantIds.has(a.grantId));

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newApps = apps.filter(
    (a) => a.submittedAt && new Date(a.submittedAt) >= weekAgo,
  );
  const pendingReviews = mockReviewerAssignments
    .filter((ra) => apps.some((a) => a.id === ra.applicationId))
    .filter((ra) => !isAssignmentComplete(ra));
  const deadlinesSoon = grants.filter((g) => {
    if (!g.deadline) return false;
    const days = (new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Email digest — ${org.name}`}
        description="Weekly roundup to org admins. Toggle cadence, pick sections, and preview the next send."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}`}
            className="underline underline-offset-2"
          >
            ← Dashboard
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/organizations/${org.id}/digest/settings`,
              `PUT /api/organizations/${org.id}/digest/settings`,
              `POST /api/organizations/${org.id}/digest/send-now`,
              `GET /api/organizations/${org.id}/digest/preview`,
            ]}
          />
          <DigestSettingsForm
            orgName={org.name}
            preview={{
              newApplications: newApps.length,
              pendingReviews: pendingReviews.length,
              deadlinesSoon: deadlinesSoon.map((g) => ({
                id: g.id,
                title: g.title,
                deadline: g.deadline!,
              })),
            }}
          />
        </div>
      </section>
    </div>
  );
}
