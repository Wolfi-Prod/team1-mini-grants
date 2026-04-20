import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { ApiKeysPanel } from "./_components/ApiKeysPanel";
import type { ApiKeyRow } from "./_components/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const SEED_KEYS: ApiKeyRow[] = [
  {
    id: "key_01",
    name: "Production dashboard",
    prefix: "t1k_live_7f2",
    scope: "read",
    lastUsedAt: "2026-04-14T22:15:00Z",
    createdAt: "2026-01-10T09:00:00Z",
    revokedAt: null,
  },
  {
    id: "key_02",
    name: "CI / read-only",
    prefix: "t1k_live_a9c",
    scope: "read",
    lastUsedAt: "2026-04-10T06:30:00Z",
    createdAt: "2026-03-01T09:00:00Z",
    revokedAt: null,
  },
];

export default async function ApiKeysPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`API keys — ${org.name}`}
        description="Rate-limited keys for ecosystem tools. Read-only today; write scope lands once the audit story is tight."
        breadcrumbs={
          <Link
            href={`/dashboard/${org.slug}`}
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
              `GET    /api/organizations/${org.id}/api-keys`,
              `POST   /api/organizations/${org.id}/api-keys`,
              `DELETE /api/organizations/${org.id}/api-keys/:keyId  (revoke)`,
            ]}
          />
          <ApiKeysPanel initialRows={SEED_KEYS} />
        </div>
      </section>
    </div>
  );
}
