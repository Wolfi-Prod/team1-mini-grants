import type { Metadata } from "next";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import {
  findCompetitionsByFormat,
  findTeamsByCompetition,
  getCompetitionTimingLabel,
} from "@/lib/mock/competitions";
import { findOrgById } from "@/lib/mock/orgs";
import { ChallengeListDetail } from "./_components/ChallengeListDetail";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Rolling challenges — join anytime, submit when ready. Individual or team, multi-track.",
};

export default function ChallengesListingPage() {
  const challenges = findCompetitionsByFormat("CHALLENGE");
  const highlighted = challenges.slice(0, 4);

  const challengeData = challenges.map((c) => ({
    ...c,
    org: findOrgById(c.organizationId),
    teamCount: findTeamsByCompetition(c.id).length,
    timing: getCompetitionTimingLabel(c),
  }));

  return (
    <div className="flex flex-col" style={{ background: "var(--bg)" }}>
      <MockApiBadge
        endpoints={[
          "GET /api/competitions?format=CHALLENGE&status=OPEN&search=",
          "GET /api/competitions/:id/teams",
        ]}
      />

      {/* ── Highlighted challenges (4 cards) ── */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: "var(--line)",
          padding: "1px 0",
        }}
      >
        {highlighted.map((c) => {
          const org = findOrgById(c.organizationId);
          return (
            <div
              key={c.id}
              className="flex flex-col p-5"
              style={{ background: "var(--bg)" }}
            >
              {/* Image placeholder */}
              <div
                className="mb-4 flex aspect-[4/3] w-full items-center justify-center border"
                style={{ borderColor: "var(--line)", background: "var(--soft)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "var(--muted)",
                    textAlign: "center",
                    padding: "8px",
                  }}
                >
                  {c.title}
                </span>
              </div>

              {/* Status */}
              <span
                className="mb-1 text-[8px] uppercase tracking-[0.14em]"
                style={{ color: "var(--accent)", fontFamily: "var(--font-mono-display)" }}
              >
                {c.status}
              </span>

              {/* Title */}
              <h3
                className="mb-1 line-clamp-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--ink)",
                }}
              >
                {c.title}
              </h3>

              {org && (
                <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                  {org.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── List + Detail panel ── */}
      <ChallengeListDetail challenges={challengeData} />

      {/* ── Footer ── */}
      <div
        className="mt-auto flex items-center justify-between border-t px-6 py-4 md:px-8"
        style={{ borderColor: "var(--line)" }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          Backyard Challenges
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
