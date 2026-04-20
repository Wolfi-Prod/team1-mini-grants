import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { SettingsSidebar } from "@/app/settings/_components/SettingsSidebar";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { findProjectsByOwner } from "@/lib/mock/projects";
import { findApplicationsByApplicant } from "@/lib/mock/applications";
import { DeleteAccountCard } from "./_components/DeleteAccountCard";

export default async function AccountSettingsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/settings/account"));
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/settings/account"));

  const projects = findProjectsByOwner(user.id);
  const applications = findApplicationsByApplicant(user.id);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Account"
        description="Your sign-in email and account lifecycle. Display information lives under Profile."
      />
      <section className="px-6 py-6">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[220px_1fr]">
          <SettingsSidebar active="account" />
          <div className="flex flex-col gap-4">
            <MockApiBadge
              endpoints={[
                "GET    /api/me",
                "DELETE /api/me  (soft delete, scrubs PII, blocks if live applications)",
              ]}
            />
            <Card title="Sign-in">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Email (from SSO)
                  </dt>
                  <dd className="mt-0.5 font-semibold">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    BuilderHub ID
                  </dt>
                  <dd className="mt-0.5 font-mono text-xs">
                    {user.builderHubId ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Account status
                  </dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-2">
                    {user.deletedAt ? (
                      <Badge variant="outline">DELETED</Badge>
                    ) : user.onboardingCompletedAt ? (
                      <Badge variant="inverted">Active</Badge>
                    ) : (
                      <Badge>Onboarding incomplete</Badge>
                    )}
                    {user.isPlatformAdmin ? <Badge>PLATFORM ADMIN</Badge> : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Created
                  </dt>
                  <dd className="mt-0.5">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-[var(--color-border-muted)] pt-3 text-xs text-[var(--color-fg-muted)]">
                Your email is managed by BuilderHub SSO and can&apos;t be changed here.
                Update it through your BuilderHub account, then sign back in.
              </p>
            </Card>

            <DeleteAccountCard
              userName={user.name ?? user.email}
              projectCount={projects.length}
              liveApplicationCount={applications.filter(
                (a) => !["WITHDRAWN", "REJECTED"].includes(a.status),
              ).length}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
