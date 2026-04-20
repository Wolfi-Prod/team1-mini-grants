import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/_components/ui/Button";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import { OrgGrantsList } from "./_components/OrgGrantsList";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgGrantsListPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grants = findGrantsByOrg(org.id);
  // Per-grant application counts for the list
  const countsByGrant: Record<string, number> = {};
  for (const app of mockApplications) {
    countsByGrant[app.grantId] = (countsByGrant[app.grantId] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Grants"
        description={`${grants.length} grant${grants.length === 1 ? "" : "s"} run by ${org.name}.`}
        actions={
          <Link href={`/dashboard/${org.slug}/grants/new`}>
            <Button variant="primary">Create grant</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            `GET /api/organizations/${org.id}/grants?status=&search=&sort=`,
            `GET /api/applications?grantId__in=...  (per-grant counts)`,
            "DELETE /api/grants/:id",
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <OrgGrantsList
          orgSlug={org.slug}
          grants={grants}
          countsByGrant={countsByGrant}
        />
      </section>
    </div>
  );
}
