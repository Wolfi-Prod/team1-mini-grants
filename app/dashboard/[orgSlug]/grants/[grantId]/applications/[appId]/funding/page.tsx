import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { Badge } from "@/app/_components/ui/Badge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findApplicationById } from "@/lib/mock/applications";
import { findDisbursementsByApplication } from "@/lib/mock/disbursements";
import { findProjectById } from "@/lib/mock/projects";
import { findUserById } from "@/lib/mock/users";
import { DisbursementsPanel } from "./_components/DisbursementsPanel";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string; appId: string }>;
}

export default async function DisbursementsPage({ params }: PageProps) {
  const { orgSlug, grantId, appId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const application = findApplicationById(appId);
  if (!application) notFound();
  if (application.grantId !== grant.id) notFound();

  const project = findProjectById(application.projectId) ?? null;
  const applicant = project ? findUserById(project.userId) ?? null : null;
  const disbursements = findDisbursementsByApplication(appId);

  const acceptedOnly = application.status === "ACCEPTED";

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Disbursements — ${project?.name ?? "Application"}`}
        description="Record milestone payouts against an accepted application. Each row is one payment. Drives the 'funding received' aggregate shown to applicants and on /u/[handle]."
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants/${grant.id}/applications/${application.id}`}
              className="underline underline-offset-2"
            >
              ← Application
            </Link>
            {" · "}
            <Badge variant={application.status === "ACCEPTED" ? "inverted" : "default"}>
              {application.status.replace("_", " ")}
            </Badge>
            {applicant ? (
              <span>
                {" "}
                · {applicant.name ?? applicant.email}
              </span>
            ) : null}
          </span>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET    /api/applications/${application.id}/disbursements`,
              `POST   /api/applications/${application.id}/disbursements`,
              `PATCH  /api/applications/${application.id}/disbursements/:disbursementId`,
              `DELETE /api/applications/${application.id}/disbursements/:disbursementId`,
            ]}
          />
          {!acceptedOnly ? (
            <div className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
              <strong>Read-only.</strong> Disbursements can be recorded only on ACCEPTED
              applications. This application is {application.status.replace("_", " ")}.
            </div>
          ) : null}
          <DisbursementsPanel
            applicationId={application.id}
            defaultCurrency={grant.currency}
            fundingRequested={application.fundingRequested}
            initialDisbursements={disbursements}
            readOnly={!acceptedOnly}
          />
        </div>
      </section>
    </div>
  );
}
