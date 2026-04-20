import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { mockCompetitions } from "@/lib/mock/competitions";
import type { ApplicationStatus, GrantStatus } from "@/lib/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgOverviewPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grants = findGrantsByOrg(org.id);
  const grantIds = new Set(grants.map((g) => g.id));
  const grantApps = mockApplications.filter((a) => grantIds.has(a.grantId));

  const grantCounts = grants.reduce<Record<GrantStatus, number>>(
    (acc, g) => {
      acc[g.status] = (acc[g.status] ?? 0) + 1;
      return acc;
    },
    { DRAFT: 0, OPEN: 0, CLOSED: 0, ARCHIVED: 0 },
  );

  const appCounts = grantApps.reduce<Record<ApplicationStatus, number>>(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {
      DRAFT: 0,
      SUBMITTED: 0,
      IN_REVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    },
  );

  const recentApps = [...grantApps]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  const competitions = mockCompetitions.filter(
    (c) => c.organizationId === org.id && !c.deletedAt,
  );

  const totalFundingRequested = grantApps
    .filter((a) => a.status !== "DRAFT" && a.status !== "WITHDRAWN")
    .reduce((sum, a) => sum + (a.fundingRequested ?? 0), 0);

  const acceptedFunding = grantApps
    .filter((a) => a.status === "ACCEPTED")
    .reduce((sum, a) => sum + (a.fundingRequested ?? 0), 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={org.name}
        description={org.description ?? "Organization dashboard"}
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            Org · @{org.slug}
            {org.websiteUrl ? (
              <>
                {" · "}
                <a
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  {org.websiteUrl}
                </a>
              </>
            ) : null}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/${org.slug}/grants/new`}>
              <Button variant="primary">Create grant</Button>
            </Link>
            <Link href={`/dashboard/${org.slug}/grants`}>
              <Button variant="secondary">All grants</Button>
            </Link>
          </div>
        }
      />

      <section className="px-6 py-6">
        <div className="flex flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/organizations/${org.slug}`,
              `GET /api/organizations/${org.id}/grants`,
              `GET /api/applications?grantId__in=...`,
              `GET /api/competitions?organizationId=${org.id}`,
            ]}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Open grants"
              value={grantCounts.OPEN}
              sublabel={`${grants.length} total · ${grantCounts.DRAFT} draft${grantCounts.DRAFT === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Applications received"
              value={grantApps.length}
              sublabel={`${appCounts.IN_REVIEW} in review · ${appCounts.SUBMITTED} new`}
            />
            <StatCard
              label="Funding requested"
              value={`$${totalFundingRequested.toLocaleString()}`}
              sublabel={`$${acceptedFunding.toLocaleString()} accepted`}
            />
            <StatCard
              label="Competitions"
              value={competitions.length}
              sublabel={competitions.length === 0 ? "None live" : "Run by this org"}
            />
          </div>

          <Card
            title="Grants"
            actions={
              <Link href={`/dashboard/${org.slug}/grants`}>
                <Button size="sm" variant="secondary">
                  Manage
                </Button>
              </Link>
            }
          >
            {grants.length === 0 ? (
              <EmptyState
                title="No grants yet"
                description="Create your first grant to start accepting applications."
                action={
                  <Link href={`/dashboard/${org.slug}/grants/new`}>
                    <Button variant="primary">Create grant</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {grants.slice(0, 6).map((g) => {
                  const gApps = grantApps.filter((a) => a.grantId === g.id);
                  return (
                    <li
                      key={g.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={`/dashboard/${org.slug}/grants/${g.id}/applications`}
                          className="truncate text-sm font-bold underline underline-offset-2"
                        >
                          {g.title}
                        </Link>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {gApps.length} application{gApps.length === 1 ? "" : "s"}
                          {g.fundingPool != null
                            ? ` · $${g.fundingPool.toLocaleString()} pool`
                            : ""}
                        </span>
                      </div>
                      <Badge variant={g.status === "OPEN" ? "inverted" : "default"}>
                        {g.status}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Recent application activity">
            {recentApps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Applications will appear here as applicants submit."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {recentApps.map((app) => {
                  const grant = grants.find((g) => g.id === app.grantId);
                  const project = findProjectById(app.projectId);
                  return (
                    <li
                      key={app.id}
                      className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <Link
                          href={
                            grant
                              ? `/dashboard/${org.slug}/grants/${grant.id}/applications/${app.id}`
                              : "#"
                          }
                          className="truncate text-sm font-bold underline underline-offset-2"
                        >
                          {project?.name ?? "Unknown project"}
                        </Link>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {grant?.title ?? "Unknown grant"}
                          {" · "}
                          {app.submittedAt
                            ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}`
                            : "Draft"}
                          {app.fundingRequested
                            ? ` · $${app.fundingRequested.toLocaleString()}`
                            : ""}
                        </span>
                      </div>
                      <Badge
                        variant={app.status === "ACCEPTED" ? "inverted" : "default"}
                      >
                        {app.status.replace("_", " ")}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] p-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)]">
        {label}
      </span>
      <span className="text-2xl font-black">{value}</span>
      {sublabel ? (
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {sublabel}
        </span>
      ) : null}
    </div>
  );
}
