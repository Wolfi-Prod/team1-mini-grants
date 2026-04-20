import type { Metadata } from "next";
import Link from "next/link";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import {
  findFlagshipGrant,
  mockGrants,
} from "@/lib/mock/grants";
import { mockOrgs, findOrgById } from "@/lib/mock/orgs";
import type { Grant } from "@/lib/types";
import { GrantsGrid } from "./_components/GrantsGrid";

export const metadata: Metadata = {
  title: "Discover Grants",
  description:
    "Browse open grants across every organization. Filter by category, deadline, and funding pool. Apply with your project.",
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function DiscoverPage() {
  const minigrant = findFlagshipGrant();
  const all = mockGrants.filter((g) => g.isPublic && !g.deletedAt);

  return (
    <div className="flex flex-col" style={{ background: "var(--bg)" }}>
      <MockApiBadge
        endpoints={[
          "GET /api/discover/grants?spotlight=flagship",
          "GET /api/discover/grants?status=&minFunding=&maxFunding=&deadline=&orgId=&search=",
        ]}
      />

      {/* ── Flagship hero ── */}
      {minigrant && <MinigrantHero grant={minigrant} />}

      {/* ── All grants grid (3 cols, search/filter, pagination) ── */}
      <GrantsGrid grants={all} orgs={mockOrgs} />

      {/* ── Footer bar ── */}
      <div
        className="mt-auto flex items-center justify-between border-t px-6 py-4 md:px-8"
        style={{ borderColor: "var(--line)" }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          Backyard Grants
        </span>
        <span
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          Live
        </span>
      </div>
    </div>
  );
}

function MinigrantHero({ grant }: { grant: Grant }) {
  const org = findOrgById(grant.organizationId);
  const days = daysUntil(grant.deadline);
  return (
    <section
      className="flex flex-col gap-5 p-6 md:p-10"
      style={{
        background: "var(--soft)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--line)", color: "var(--ink)", fontFamily: "var(--font-mono-display)" }}
        >
          Flagship
        </span>
        <span
          className="border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--line)", color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          {grant.status}
        </span>
        {org && (
          <span
            className="text-[9px] uppercase tracking-[0.14em]"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
          >
            by {org.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 5vw, 56px)",
          fontWeight: 400,
          lineHeight: 1.05,
          color: "var(--ink)",
        }}
      >
        {grant.title}
      </h2>

      {/* Description */}
      <p
        className="max-w-2xl"
        style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--muted)" }}
      >
        {grant.description}
      </p>

      {/* Stats row */}
      <dl
        className="flex flex-wrap items-center gap-8 border-t pt-4"
        style={{ borderColor: "var(--line)" }}
      >
        {grant.fundingPool !== null && (
          <div className="flex flex-col gap-1">
            <dt
              className="text-[9px] uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
            >
              Pool
            </dt>
            <dd
              className="text-sm"
              style={{ color: "var(--ink)", fontFamily: "var(--font-mono-display)", fontWeight: 500 }}
            >
              ${grant.fundingPool.toLocaleString()} {grant.currency}
            </dd>
          </div>
        )}
        {days !== null && (
          <div className="flex flex-col gap-1">
            <dt
              className="text-[9px] uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
            >
              Deadline
            </dt>
            <dd
              className="text-sm"
              style={{ color: days > 0 ? "var(--ink)" : "var(--accent)", fontFamily: "var(--font-mono-display)", fontWeight: 500 }}
            >
              {days > 0 ? `${days} days left` : "Closed"}
            </dd>
          </div>
        )}
      </dl>

      {/* CTA */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/discover/grants/${grant.id}`}
          className="btn btn--primary"
        >
          View details
        </Link>
        <Link
          href={`/discover/grants/${grant.id}`}
          className="btn btn--ghost"
        >
          Apply
        </Link>
      </div>
    </section>
  );
}
