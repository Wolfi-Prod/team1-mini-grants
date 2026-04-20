import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { findNotificationsForUser } from "@/lib/mock/notifications";
import { NotificationsPanel } from "./_components/NotificationsPanel";

export default async function NotificationsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/notifications"));
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/notifications"));

  const notifications = findNotificationsForUser(user.id);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Notifications"
        description="Everything that happened on your account — application status changes, reviewer invites, deadlines."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET   /api/me/notifications",
              "PATCH /api/me/notifications/:id  (mark read)",
              "POST  /api/me/notifications/read-all",
            ]}
          />
          <NotificationsPanel initial={notifications} />
        </div>
      </section>
    </div>
  );
}
