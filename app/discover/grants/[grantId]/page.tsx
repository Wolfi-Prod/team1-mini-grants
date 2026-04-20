import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerOrg } from "@/lib/auth/serverAuth";
import {
  findGrantById,
  findQuestionsByGrant,
} from "@/lib/mock/grants";
import { findOrgById } from "@/lib/mock/orgs";
import { ApplyCTA } from "./_components/ApplyCTA";

interface PageProps {
  params: Promise<{ grantId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { grantId } = await params;
  const grant = findGrantById(grantId);
  if (!grant) return { title: "Grant not found" };
  const org = findOrgById(grant.organizationId);
  return {
    title: grant.title,
    description: `${grant.description.slice(0, 160)}${grant.description.length > 160 ? "..." : ""}`,
    openGraph: {
      title: `${grant.title} · ${org?.name ?? "Backyard"}`,
      description: grant.description.slice(0, 200),
      type: "article",
    },
  };
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function PublicGrantDetailPage({ params }: PageProps) {
  const { grantId } = await params;

  // Public page, but route admins / orgs to their own dashboards instead.
  const role = await getServerRole();
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
  }

  const grant = findGrantById(grantId);
  if (!grant || grant.deletedAt) notFound();
  // Drafts and non-public grants shouldn't be reachable from the public route.
  if (!grant.isPublic || grant.status === "DRAFT") notFound();

  const org = findOrgById(grant.organizationId);
  const questions = findQuestionsByGrant(grant.id);
  const days = daysUntil(grant.deadline);
  const isOpen = grant.status === "OPEN";

  return (
    <div className="flex flex-col">
      <section className="border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-12 text-[var(--color-fg-on-inverted)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Link
            href="/discover"
            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
          >
            ← Back to discover
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {grant.isFlagship ? (
              <span className="border border-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
                Flagship
              </span>
            ) : null}
            <span className="border border-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              {grant.status}
            </span>
            {org ? (
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                by {org.name}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
            {grant.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed">{grant.description}</p>
          <dl className="flex flex-wrap items-start gap-8 border-t border-white/40 pt-5 text-xs uppercase tracking-widest">
            {grant.fundingPool !== null ? (
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] opacity-70">Pool</dt>
                <dd className="font-bold">
                  ${grant.fundingPool.toLocaleString()} {grant.currency}
                </dd>
              </div>
            ) : null}
            {days !== null ? (
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] opacity-70">Deadline</dt>
                <dd className="font-bold">
                  {days > 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Closed"}
                </dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] opacity-70">Questions</dt>
              <dd className="font-bold">
                {questions.length === 0 ? "Cover note only" : `${questions.length} to answer`}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/discover/grants/${grant.id}`,
              `GET /api/discover/grants/${grant.id}/questions`,
              `GET /api/organizations/${grant.organizationId}`,
            ]}
          />

          <Card title="About this grant">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest">
                  Description
                </h3>
                <p className="mt-1 text-sm leading-relaxed">{grant.description}</p>
              </div>
              {grant.requirements ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Requirements
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{grant.requirements}</p>
                </div>
              ) : null}
              {org ? (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">
                    Funded by
                  </h3>
                  <div className="mt-1 flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{org.name}</span>
                    {org.description ? (
                      <p className="text-xs text-[var(--color-fg-muted)]">{org.description}</p>
                    ) : null}
                    {org.websiteUrl ? (
                      <a
                        href={org.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs underline underline-offset-2"
                      >
                        {org.websiteUrl}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card title="What you'll be asked">
            {questions.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-muted)]">
                This grant only asks for a cover note. No extra questions.
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-black">
                {questions.map((q, idx) => (
                  <li key={q.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-semibold">
                        {idx + 1}. {q.label}
                        {q.isRequired ? (
                          <span aria-hidden className="ml-1">*</span>
                        ) : null}
                      </span>
                      <Badge variant="default">{q.type.replace("_", " ")}</Badge>
                    </div>
                    {q.description ? (
                      <p className="text-xs text-[var(--color-fg-muted)]">{q.description}</p>
                    ) : null}
                    {q.options.length > 0 ? (
                      <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        Options: {q.options.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title={isOpen ? "Apply with a project" : "Applications closed"}>
            <ApplyCTA grantId={grant.id} isOpen={isOpen} />
          </Card>
        </div>
      </section>
    </div>
  );
}
