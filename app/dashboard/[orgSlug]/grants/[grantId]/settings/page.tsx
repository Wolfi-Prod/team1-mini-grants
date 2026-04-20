import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById, findGrantPermissionsByGrant } from "@/lib/mock/grants";
import { mockUsers, findUserById } from "@/lib/mock/users";
import { GrantPermissionsPanel } from "./_components/GrantPermissionsPanel";
import type { GrantPermissionRow } from "./_components/types";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function GrantPermissionsPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const permissions: GrantPermissionRow[] = findGrantPermissionsByGrant(grantId).map(
    (p) => {
      const user = findUserById(p.userId);
      return {
        permission: p,
        user: user
          ? {
              id: user.id,
              name: user.name ?? user.handle,
              email: user.email,
            }
          : null,
      };
    },
  );

  const candidates = mockUsers
    .filter((u) => !u.deletedAt)
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.handle,
      email: u.email,
    }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Permissions — ${grant.title}`}
        description="Grant-level collaborators. Orgs owners and whitelisted members always have full access; these extra roles scope outside users into a specific grant."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}/grants/${grant.id}`}
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
              `GET    /api/grants/${grant.id}/permissions`,
              `POST   /api/grants/${grant.id}/permissions`,
              `PATCH  /api/grants/${grant.id}/permissions/:permissionId`,
              `DELETE /api/grants/${grant.id}/permissions/:permissionId`,
            ]}
          />
          <GrantPermissionsPanel
            initialPermissions={permissions}
            candidates={candidates}
          />
        </div>
      </section>
    </div>
  );
}
