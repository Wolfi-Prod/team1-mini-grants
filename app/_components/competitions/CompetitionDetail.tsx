import Link from "next/link";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import {
  findCompetitionById,
  findMainPrizesByCompetition,
  findTracksByCompetition,
  findTeamsByCompetition,
  findMembersByTeam,
  findSubmissionByTeam,
  findTracksBySubmission,
  findTeamForUserInCompetition,
  findPendingInvitesForUser,
  getCompetitionTimingLabel,
} from "@/lib/mock/competitions";
import { findProjectsByOwner } from "@/lib/mock/projects";
import { findOrgById } from "@/lib/mock/orgs";
import { CompetitionTeamCard } from "./CompetitionTeamCard";
import { ParticipatePanel } from "./ParticipatePanel";
import type { Competition, CompetitionFormat, User } from "@/lib/types";

interface Props {
  competitionId: string;
  expectedFormat: CompetitionFormat;
  viewer: User | null;
  isAdmin: boolean;
  isOrgRunningThisComp: boolean;
}

/**
 * Shared detail page body used by /hackathons/[id] and /challenges/[id]. Returns a
 * rendered React tree, or a "not found" sentinel (null) when the competition is missing /
 * mismatched / unpublished. The wrapper page is responsible for calling notFound() in that
 * case so this component stays pure.
 */
export function CompetitionDetail({
  competitionId,
  expectedFormat,
  viewer,
  isAdmin,
  isOrgRunningThisComp,
}: Props) {
  const competition = findCompetitionById(competitionId);
  if (!competition || competition.deletedAt) return null;
  if (!competition.isPublic && !isAdmin && !isOrgRunningThisComp) return null;
  if (competition.status === "DRAFT" && !isAdmin && !isOrgRunningThisComp) return null;
  // Don't let hackathon ids load under /challenges/[id] and vice versa.
  if (competition.format !== expectedFormat) return null;

  const org = findOrgById(competition.organizationId);
  const mainPrizes = findMainPrizesByCompetition(competition.id);
  const tracks = findTracksByCompetition(competition.id);
  const teams = findTeamsByCompetition(competition.id);
  const timing = getCompetitionTimingLabel(competition);

  const basePath = competition.format === "HACKATHON" ? "/hackathons" : "/challenges";
  const listingLabel =
    competition.format === "HACKATHON" ? "Hackathons" : "Challenges";

  const privilegedViewer = isAdmin || isOrgRunningThisComp;
  const viewerTeam = viewer
    ? findTeamForUserInCompetition(viewer.id, competition.id) ?? null
    : null;
  const viewerTeamId = viewerTeam?.id;
  const viewerTeamMembers = viewerTeam ? findMembersByTeam(viewerTeam.id) : [];
  const viewerTeamSubmission = viewerTeam
    ? findSubmissionByTeam(viewerTeam.id) ?? null
    : null;
  const viewerPendingInvites = viewer
    ? findPendingInvitesForUser(viewer.id, competition.id)
    : [];
  const viewerOwnedProjects = viewer ? findProjectsByOwner(viewer.id) : [];

  const totalMainPrizes = mainPrizes.reduce(
    (sum, p) => sum + (p.amount ?? 0),
    0,
  );
  const totalTrackPrizes = tracks.reduce(
    (sum, t) => sum + (t.prizeAmount ?? 0),
    0,
  );
  const allocated = totalMainPrizes + totalTrackPrizes;
  const poolWarning =
    competition.totalPool !== null && allocated > competition.totalPool
      ? `Prize amounts exceed total pool by $${(allocated - competition.totalPool).toLocaleString()}.`
      : null;

  return (
    <div className="flex flex-col">
      {privilegedViewer ? (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-3 text-[var(--color-fg-on-inverted)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Privileged view
            {isAdmin ? " · platform admin" : null}
            {isOrgRunningThisComp && org ? ` · running org ${org.name}` : null}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Status: {competition.status}
          </span>
        </div>
      ) : null}

      <section className="border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-12 text-[var(--color-fg-on-inverted)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <Link
            href={basePath}
            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
          >
            ← {listingLabel}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              {competition.format}
            </span>
            <span className="border border-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              {competition.status}
            </span>
            {competition.partner ? (
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Partner: {competition.partner}
              </span>
            ) : org ? (
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                by {org.name}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
            {competition.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed">
            {competition.description}
          </p>
          <dl className="flex flex-wrap items-start gap-8 border-t border-white/40 pt-5 text-xs uppercase tracking-widest">
            {competition.totalPool !== null ? (
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] opacity-70">Pool</dt>
                <dd className="font-bold">
                  ${competition.totalPool.toLocaleString()} {competition.currency}
                </dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] opacity-70">Timing</dt>
              <dd className="font-bold">{timing}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] opacity-70">Team size</dt>
              <dd className="font-bold">
                {competition.minTeamSize}–{competition.maxTeamSize}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[10px] opacity-70">Teams registered</dt>
              <dd className="font-bold">{teams.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <MockApiBadge
            endpoints={[
              `GET /api/competitions/${competition.id}`,
              `GET /api/competitions/${competition.id}/tracks`,
              `GET /api/competitions/${competition.id}/prizes`,
              `GET /api/competitions/${competition.id}/teams`,
            ]}
          />

          <Card title="Rules">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {competition.rules}
            </p>
          </Card>

          {competition.format === "HACKATHON" ? (
            <Card title="Timeline">
              <dl className="grid gap-3 md:grid-cols-2">
                <TimelineRow label="Registration opens" iso={competition.registrationOpensAt} />
                <TimelineRow label="Submission deadline" iso={competition.submissionDeadline} />
                <TimelineRow label="Judging ends" iso={competition.judgingEndsAt} />
                <TimelineRow label="Results announced" iso={competition.resultsAnnouncedAt} />
              </dl>
            </Card>
          ) : null}

          {mainPrizes.length > 0 ? (
            <Card title="Main prizes">
              <ol className="flex flex-col divide-y divide-black">
                {mainPrizes.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">
                        {p.rank}. {p.label}
                      </span>
                      {p.description ? (
                        <span className="text-xs text-[var(--color-fg-muted)]">{p.description}</span>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-mono text-sm">
                      {p.amount !== null
                        ? `$${p.amount.toLocaleString()} ${p.currency}`
                        : "TBD"}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}

          {tracks.length > 0 ? (
            <Card title="Tracks" description="Teams can enter multiple tracks with one submission.">
              <ul className="flex flex-col divide-y divide-black">
                {tracks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{t.name}</span>
                      {t.description ? (
                        <span className="text-xs text-[var(--color-fg-muted)]">{t.description}</span>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-mono text-sm">
                      {t.prizeAmount !== null
                        ? `$${t.prizeAmount.toLocaleString()} ${t.currency}`
                        : "TBD"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {poolWarning ? (
            <div className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] px-4 py-3 text-xs">
              <strong className="uppercase tracking-widest">Note:</strong> {poolWarning}
            </div>
          ) : null}

          <Card
            title="Teams & submissions"
            description={
              teams.length === 0
                ? "Be the first team to register."
                : `${teams.length} team${teams.length === 1 ? "" : "s"} registered.`
            }
          >
            {teams.length === 0 ? (
              <EmptyState
                title="No teams yet"
                description="Register solo or create a team when the team flow ships next."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((t) => {
                  const members = findMembersByTeam(t.id);
                  const submission = findSubmissionByTeam(t.id) ?? null;
                  const submissionTracks = submission
                    ? findTracksBySubmission(submission.id)
                    : [];
                  const canSeeFull =
                    privilegedViewer || (viewerTeamId !== undefined && viewerTeamId === t.id);
                  return (
                    <CompetitionTeamCard
                      key={t.id}
                      team={t}
                      members={members}
                      submission={submission}
                      submissionTracks={submissionTracks}
                      allTracks={tracks}
                      canSeeFull={canSeeFull}
                      maxTeamSize={competition.maxTeamSize}
                    />
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Participate">
            <ParticipatePanel
              competition={competition}
              tracks={tracks}
              currentTeam={viewerTeam}
              currentTeamMembers={viewerTeamMembers}
              currentSubmission={viewerTeamSubmission}
              pendingInvites={viewerPendingInvites}
              ownedProjects={viewerOwnedProjects}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}

function TimelineRow({ label, iso }: { label: string; iso: string | null }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-widest">{label}</dt>
      <dd className="mt-0.5 text-sm">
        {iso ? (
          new Date(iso).toLocaleString()
        ) : (
          <span className="text-[var(--color-fg-subtle)]">TBD</span>
        )}
      </dd>
    </div>
  );
}

// Re-export so call sites can also import the helper alongside the component.
export { findCompetitionById };
export type { Competition };
