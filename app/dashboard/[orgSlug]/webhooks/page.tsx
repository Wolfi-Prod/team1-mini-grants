import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { findOrgBySlug } from "@/lib/mock/orgs";
import { WebhooksPanel } from "./_components/WebhooksPanel";
import type { WebhookRow } from "./_components/types";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const SEED_WEBHOOKS: WebhookRow[] = [
  {
    id: "wh_slack_01",
    url: "https://hooks.slack.com/services/T000/B000/XXXXXX",
    events: ["application.submitted", "application.status.changed"],
    secret: "whsec_mock_abc123",
    enabled: true,
    lastDeliveredAt: "2026-04-15T11:00:00Z",
    lastStatus: "OK",
    createdAt: "2026-02-01T09:00:00Z",
  },
];

export default async function WebhooksPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const org = findOrgBySlug(orgSlug);
  if (!org || org.deletedAt) notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Webhooks — ${org.name}`}
        description="Register URLs to receive events. Post-backend, each event will carry a signature header derived from the secret. Disable a row to pause delivery without deleting."
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
              `GET    /api/organizations/${org.id}/webhooks`,
              `POST   /api/organizations/${org.id}/webhooks`,
              `PATCH  /api/organizations/${org.id}/webhooks/:webhookId`,
              `DELETE /api/organizations/${org.id}/webhooks/:webhookId`,
              `POST   /api/organizations/${org.id}/webhooks/:webhookId/test`,
              `POST   /api/organizations/${org.id}/webhooks/:webhookId/rotate-secret`,
            ]}
          />
          <WebhooksPanel initialRows={SEED_WEBHOOKS} />
        </div>
      </section>
    </div>
  );
}
