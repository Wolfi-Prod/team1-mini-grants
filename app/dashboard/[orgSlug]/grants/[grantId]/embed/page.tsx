import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { EmbedConfigurator } from "./_components/EmbedConfigurator";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function GrantEmbedPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();
  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Embed — ${grant.title}`}
        description="Drop the iframe on your org's website to surface this grant with a live application count + deadline countdown."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}/grants/${grant.id}`}
            className="underline underline-offset-2"
          >
            ← Dashboard
          </Link>
        }
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET /api/embed/grants/${grant.id}  (server-side rendered iframe)`,
              `GET /api/embed/grants/${grant.id}/stats  (JSON for live count refreshes)`,
            ]}
          />
          <EmbedConfigurator
            grantId={grant.id}
            grantTitle={grant.title}
            orgName={org.name}
          />
        </div>
      </section>
    </div>
  );
}
