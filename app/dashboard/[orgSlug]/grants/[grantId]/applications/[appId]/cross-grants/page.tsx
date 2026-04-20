import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { findOrgBySlug, findOrgById } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findApplicationById, findApplicationsByApplicant } from "@/lib/mock/applications";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import { mockDisbursements } from "@/lib/mock/disbursements";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string; appId: string }>;
}

export default async function CrossGrantsPage({ params }: PageProps) {
  const { orgSlug, grantId, appId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();
  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();
  const application = findApplicationById(appId);
  if (!application || application.grantId !== grant.id) notFound();

  const project = findProjectById(application.projectId) ?? null;
  const applicant = project ? findUserById(project.userId) ?? null : null;
  if (!applicant) notFound();

  // Per Phase 4C Controlled Visibility spec:
  //   - Return every OTHER application this applicant has submitted
  //   - Expose: grant title + org + status + submittedAt + fundingRequested + funding received
  //   - Do NOT expose: answers, feedback, scores, per-grant reviewer identities
  const allApps = findApplicationsByApplicant(applicant.id);
  const otherApps = allApps.filter((a) => a.id !== application.id);

  // Aggregates the viewer is allowed to see — total grants applied, total funding received.
  const totalAccepted = allApps.filter((a) => a.status === "ACCEPTED").length;
  const totalFundingReceived = mockDisbursements
    .filter((d) => d.status === "COMPLETED")
    .filter((d) => allApps.some((a) => a.id === d.applicationId))
    .reduce((sum, d) => sum + d.amount, 0);

  // Per-grant summary row.
  const rows = otherApps.map((a) => {
    const otherGrant = findGrantById(a.grantId);
    const otherOrg = otherGrant ? findOrgById(otherGrant.organizationId) ?? null : null;
    const receivedFromThisGrant = mockDisbursements
      .filter((d) => d.applicationId === a.id && d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.amount, 0);
    return {
      application: a,
      grant: otherGrant ?? null,
      org: otherOrg,
      receivedFromThisGrant,
    };
  });

  const base = `/dashboard/${org.slug}/grants/${grant.id}/applications/${application.id}`;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Cross-grants"
        description="Every other grant this applicant has submitted to. Scrubbed to aggregates only — no answers, no feedback, no scores. Helps fair funding decisions."
        breadcrumbs={
          <Link href={base} className="underline underline-offset-2">
            ← Application review
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/cross-grants?applicantId=${applicant.id}&excludeApplicationId=${application.id}`,
            ]}
          />

          <Card title={`Applicant · ${applicant.name ?? applicant.email}`}>
            <div className="grid gap-3 md:grid-cols-3">
              <StatCard label="Total applications" value={allApps.length} />
              <StatCard label="Accepted" value={totalAccepted} />
              <StatCard
                label="Funding received"
                value={`USD ${totalFundingReceived.toLocaleString()}`}
                hint="across all grants"
              />
            </div>
          </Card>

          <Card title={`Other applications · ${rows.length}`}>
            {rows.length === 0 ? (
              <EmptyState
                title="This is their only application"
                description="No other grants in our system — could be a first-time applicant."
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {rows.map((row) => (
                  <li
                    key={row.application.id}
                    className="flex flex-col gap-1 py-3 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold">
                          {row.grant?.title ?? "Unknown grant"}
                        </span>
                        <Badge>{row.org?.name ?? "Unknown org"}</Badge>
                        <Badge
                          variant={
                            row.application.status === "ACCEPTED" ? "inverted" : "default"
                          }
                        >
                          {row.application.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {row.application.submittedAt
                          ? `Submitted ${new Date(row.application.submittedAt).toLocaleDateString()}`
                          : "Not submitted yet"}
                        {row.application.fundingRequested !== null
                          ? ` · requested USD ${row.application.fundingRequested.toLocaleString()}`
                          : ""}
                        {row.receivedFromThisGrant > 0
                          ? ` · received USD ${row.receivedFromThisGrant.toLocaleString()}`
                          : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="What's not shown">
            <ul className="list-disc pl-5 text-xs text-[var(--color-fg-muted)]">
              <li>Answers the applicant gave to other grants</li>
              <li>Reviewer feedback, scores, or identities on other grants</li>
              <li>Other grants&apos; decision reasoning</li>
            </ul>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
              Controlled by the `/api/cross-grants` ACL. Backend enforces this boundary —
              frontend never asks for excluded fields.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
        {label}
      </span>
      <span className="text-2xl font-bold">{value}</span>
      {hint ? (
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
