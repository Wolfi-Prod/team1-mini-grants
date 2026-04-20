import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { SettingsSidebar } from "@/app/settings/_components/SettingsSidebar";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { ProfileSettingsForm } from "./_components/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/settings/profile"));
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/settings/profile"));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Profile"
        description="How other applicants, orgs, and reviewers see you. Your email stays private and is managed under Account."
      />
      <section className="px-6 py-6">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[220px_1fr]">
          <SettingsSidebar active="profile" />
          <div className="flex flex-col gap-4">
            <MockApiBadge
              endpoints={[
                "GET /api/me",
                "PUT /api/me/profile",
              ]}
            />
            <ProfileSettingsForm user={user} />
          </div>
        </div>
      </section>
    </div>
  );
}
