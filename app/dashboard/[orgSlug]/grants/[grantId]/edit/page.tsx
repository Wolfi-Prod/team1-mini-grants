import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { EditGrantForm } from "./_components/EditGrantForm";

interface PageProps {
  params: Promise<{ orgSlug: string; grantId: string }>;
}

export default async function EditGrantPage({ params }: PageProps) {
  const { orgSlug, grantId } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  if (grant.organizationId !== org.id) notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Edit — ${grant.title}`}
        description="Change any grant field. Questions are managed on a separate page."
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
              `PATCH /api/organizations/${org.id}/grants/${grant.id}`,
            ]}
          />
          <EditGrantForm orgSlug={org.slug} grant={grant} />
        </div>
      </section>
    </div>
  );
}
