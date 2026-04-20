import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug, mockOrgMembers } from "@/lib/mock/orgs";
import { findUserById } from "@/lib/mock/users";
import { ManageMembersPanel } from "./_components/ManageMembersPanel";
import type { OrgMemberRow } from "./_components/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgMembersPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const members: OrgMemberRow[] = mockOrgMembers
    .filter((m) => m.organizationId === org.id)
    .map((m) => {
      const user = findUserById(m.userId);
      return {
        membership: m,
        user: user
          ? {
              id: user.id,
              name: user.name ?? user.handle,
              email: user.email,
              handle: user.handle,
            }
          : null,
      };
    });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Members — ${org.name}`}
        description="Owners have full control. Whitelisted members can create and manage grants but can't remove owners or delete the org."
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
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET    /api/organizations/${org.id}/members`,
              `POST   /api/organizations/${org.id}/invitations  (email invites → Invitation model)`,
              `PATCH  /api/organizations/${org.id}/members/:memberId  (change role)`,
              `DELETE /api/organizations/${org.id}/members/:memberId`,
            ]}
          />
          <ManageMembersPanel orgName={org.name} initialMembers={members} />
        </div>
      </section>
    </div>
  );
}
