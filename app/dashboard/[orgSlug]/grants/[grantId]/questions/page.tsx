import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById, findQuestionsByGrant } from "@/lib/mock/grants";
import { ManageQuestionsPanel } from "./_components/ManageQuestionsPanel";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function GrantQuestionsPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  const questions = findQuestionsByGrant(grantId);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Questions — ${grant.title}`}
        description="Add, edit, reorder, and remove the questions applicants answer when applying. Changes take effect on new applications."
        breadcrumbs={
          <span className="text-xs text-[var(--color-fg-muted)]">
            <Link
              href={`/dashboard/${org.slug}/grants/${grant.id}`}
              className="underline underline-offset-2"
            >
              ← Dashboard
            </Link>
          </span>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET    /api/grants/${grant.id}/questions`,
              `POST   /api/grants/${grant.id}/questions`,
              `PATCH  /api/grants/${grant.id}/questions/:questionId`,
              `DELETE /api/grants/${grant.id}/questions/:questionId`,
              `POST   /api/grants/${grant.id}/questions/reorder`,
            ]}
          />
          <ManageQuestionsPanel grantId={grant.id} initialQuestions={questions} />
        </div>
      </section>
    </div>
  );
}
