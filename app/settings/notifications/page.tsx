import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { SettingsSidebar } from "@/app/settings/_components/SettingsSidebar";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { NotificationPreferencesForm } from "./_components/NotificationPreferencesForm";

export default async function NotificationPreferencesPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/settings/notifications"));
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/settings/notifications"));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Notifications"
        description="Pick what we email you about and what stays in-app only. You'll always see everything in /notifications."
      />
      <section className="px-6 py-6">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[220px_1fr]">
          <SettingsSidebar active="notifications" />
          <div className="flex flex-col gap-4">
            <MockApiBadge
              endpoints={[
                "GET /api/me/notification-preferences",
                "PUT /api/me/notification-preferences",
              ]}
            />
            <NotificationPreferencesForm />
          </div>
        </div>
      </section>
    </div>
  );
}
