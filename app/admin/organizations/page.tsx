import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { mockOrgs, mockOrgMembers } from "@/lib/mock/orgs";
import { mockGrants } from "@/lib/mock/grants";
import { AdminOrganizationsPanel } from "./_components/AdminOrganizationsPanel";
import type { AdminOrgRow } from "./_components/types";

export default function AdminOrganizationsPage() {
  const rows: AdminOrgRow[] = mockOrgs.map((org) => {
    const memberCount = mockOrgMembers.filter(
      (m) => m.organizationId === org.id,
    ).length;
    const grants = mockGrants.filter((g) => g.organizationId === org.id && !g.deletedAt);
    return {
      org,
      memberCount,
      grantCount: grants.length,
      openGrantCount: grants.filter((g) => g.status === "OPEN").length,
    };
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Organizations"
        description="Every org on the platform. Suspend when necessary; deletion is still handled by the owner from their org settings."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET    /api/admin/organizations",
              "POST   /api/admin/organizations/:orgId/suspend",
              "POST   /api/admin/organizations/:orgId/restore",
            ]}
          />
          <AdminOrganizationsPanel initialRows={rows} />
        </div>
      </section>
    </div>
  );
}
