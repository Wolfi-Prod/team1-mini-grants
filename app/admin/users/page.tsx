import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { mockUsers } from "@/lib/mock/users";
import { mockOrgMembers } from "@/lib/mock/orgs";
import { findApplicationsByApplicant } from "@/lib/mock/applications";
import { getServerUser } from "@/lib/auth/serverAuth";
import { AdminUsersPanel } from "./_components/AdminUsersPanel";
import type { AdminUserRow } from "./_components/types";

export default async function AdminUsersPage() {
  const viewer = await getServerUser();

  const rows: AdminUserRow[] = mockUsers.map((u) => {
    const orgMemberships = mockOrgMembers.filter((m) => m.userId === u.id).length;
    const applicationCount = findApplicationsByApplicant(u.id).length;
    return {
      user: {
        id: u.id,
        name: u.name ?? u.handle,
        email: u.email,
        handle: u.handle,
        isPlatformAdmin: u.isPlatformAdmin,
        onboardingCompletedAt: u.onboardingCompletedAt,
        deletedAt: u.deletedAt,
        createdAt: u.createdAt,
      },
      orgMemberships,
      applicationCount,
    };
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Users"
        description="Every user on the platform. Toggle platform-admin status, view activity summaries, and jump to profiles."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET    /api/admin/users",
              "PATCH  /api/admin/users/:userId  (toggle isPlatformAdmin)",
              "DELETE /api/admin/users/:userId  (soft-delete + scrub PII)",
            ]}
          />
          <AdminUsersPanel initialRows={rows} viewerId={viewer?.id ?? null} />
        </div>
      </section>
    </div>
  );
}
