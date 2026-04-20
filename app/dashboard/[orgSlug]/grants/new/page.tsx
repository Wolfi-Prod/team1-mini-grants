import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { NewGrantForm } from "./_components/NewGrantForm";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewGrantPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="New grant"
        description={`Create a new grant for ${org.name}. You can save it as a draft and publish later.`}
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
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "POST /api/grants",
              "POST /api/grants/:id/questions  (bulk)",
            ]}
          />
          <NewGrantForm orgSlug={org.slug} />
        </div>
      </section>
    </div>
  );
}
