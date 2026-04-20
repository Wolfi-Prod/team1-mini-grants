import type { Metadata } from "next";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { EmptyState } from "@/app/_components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "Time-bound team hackathons with tracks, prizes, and real funding. Register solo or as a team.",
};
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { CompetitionRowCard } from "@/app/_components/competitions/CompetitionRowCard";
import {
  findCompetitionsByFormat,
  findTeamsByCompetition,
} from "@/lib/mock/competitions";
import { findOrgById } from "@/lib/mock/orgs";

export default function HackathonsListingPage() {
  const hackathons = findCompetitionsByFormat("HACKATHON");

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Hackathons"
        description="Time-bounded events. Build with a team, ship a project, and compete for prizes."
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            "GET /api/competitions?format=HACKATHON&status=OPEN&search=",
            "GET /api/competitions/:id/teams  (for per-row team count)",
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">
          <h2 className="text-xs font-bold uppercase tracking-widest">
            {hackathons.length} open hackathon{hackathons.length === 1 ? "" : "s"}
          </h2>
          {hackathons.length === 0 ? (
            <EmptyState
              title="No hackathons running right now"
              description="Check back soon, or browse Challenges for rolling competitions."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hackathons.map((c) => (
                <CompetitionRowCard
                  key={c.id}
                  competition={c}
                  org={findOrgById(c.organizationId)}
                  teamCount={findTeamsByCompetition(c.id).length}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
