import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";
import { OrgSettingsForm } from "./_components/OrgSettingsForm";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgSettingsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grants = findGrantsByOrg(org.id);
  const liveGrantCount = grants.filter((g) => !g.deletedAt && g.status !== "ARCHIVED")
    .length;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Settings — ${org.name}`}
        description="Org-level details. Members are managed on a separate page."
        breadcrumbs={
          <Link href={`/dashboard/${org.slug}`} className="underline underline-offset-2">
            ← Dashboard
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET    /api/organizations/${org.id}`,
              `PATCH  /api/organizations/${org.id}`,
              `DELETE /api/organizations/${org.id}  (owner-only, blocked if live grants exist)`,
            ]}
          />
          <OrgSettingsForm org={org} liveGrantCount={liveGrantCount} />
        </div>
      </section>
    </div>
  );
}
