import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantsByOrg, findQuestionsByGrant } from "@/lib/mock/grants";
import { TemplatesPanel } from "./_components/TemplatesPanel";
import type { TemplateRow } from "./_components/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function GrantTemplatesPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  // For now, every existing grant is usable as a template. A later iteration adds a
  // dedicated "GrantTemplate" row so users don't have to pull from live grants.
  const rows: TemplateRow[] = findGrantsByOrg(org.id)
    .filter((g) => !g.deletedAt)
    .map((g) => ({
      id: g.id,
      title: g.title,
      requirements: g.requirements,
      currency: g.currency,
      fundingPool: g.fundingPool,
      isFlagship: g.isFlagship,
      questionCount: findQuestionsByGrant(g.id).length,
      status: g.status,
      createdAt: g.createdAt,
    }))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Templates — ${org.name}`}
        description="Clone an existing grant to bootstrap a new one. Title / slug / deadline reset; description / requirements / questions / funding / flags carry over."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}/grants`}
            className="underline underline-offset-2"
          >
            ← Grants
          </Link>
        }
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET  /api/organizations/${org.id}/grant-templates`,
              `POST /api/organizations/${org.id}/grant-templates/:templateId/clone`,
            ]}
          />
          <TemplatesPanel orgSlug={org.slug} rows={rows} />
        </div>
      </section>
    </div>
  );
}
