import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import { findUserById } from "@/lib/mock/users";
import { findProjectById } from "@/lib/mock/projects";
import type {
  CompetitionSubmission,
  CompetitionSubmissionTrack,
  CompetitionTeam,
  CompetitionTeamMember,
  CompetitionTrack,
} from "@/lib/types";

interface Props {
  team: CompetitionTeam;
  members: CompetitionTeamMember[];
  submission: CompetitionSubmission | null;
  submissionTracks: CompetitionSubmissionTrack[];
  allTracks: CompetitionTrack[];
  /** True when the viewer is allowed to see the full roster and submission details. */
  canSeeFull: boolean;
  maxTeamSize: number;
}

export function CompetitionTeamCard({
  team,
  members,
  submission,
  submissionTracks,
  allTracks,
  canSeeFull,
  maxTeamSize,
}: Props) {
  const lead = findUserById(team.leadUserId);
  const publiclyVisible = team.isPublic || canSeeFull;
  const pickedTracks = submissionTracks
    .map((st) => allTracks.find((t) => t.id === st.trackId))
    .filter((t): t is CompetitionTrack => t !== undefined);

  return (
    <div className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-bold uppercase leading-tight">{team.name}</h4>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
            {members.length} of {maxTeamSize} member{members.length === 1 ? "" : "s"}
            {team.isPublic ? " · Public team" : " · Members private"}
          </p>
        </div>
        {submission ? (
          <Badge
            variant={submission.status === "WINNER" ? "inverted" : "default"}
          >
            {submission.status.replace("_", " ")}
          </Badge>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
            Not submitted
          </span>
        )}
      </div>

      {publiclyVisible ? (
        <>
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest">
              Members
            </h5>
            <ul className="mt-1 flex flex-wrap gap-2">
              {members.map((m) => {
                const user = findUserById(m.userId);
                if (!user) return null;
                return (
                  <li key={m.id}>
                    <Link
                      href={`/u/${user.handle}`}
                      className="border border-[var(--color-border-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest underline-offset-2 hover:underline"
                    >
                      {m.role === "LEAD" ? "★ " : ""}
                      {user.name ?? user.handle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {submission ? (
            <SubmissionBlock
              submission={submission}
              pickedTracks={pickedTracks}
            />
          ) : null}
        </>
      ) : (
        <>
          <p className="text-xs text-[var(--color-fg-muted)]">
            {lead ? `Led by ${lead.name ?? lead.handle}. ` : ""}
            Members hidden by team preference.
          </p>
          {submission ? (
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
              Submission details private
              {pickedTracks.length > 0
                ? ` · Entered ${pickedTracks.length} track${pickedTracks.length === 1 ? "" : "s"}`
                : ""}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function SubmissionBlock({
  submission,
  pickedTracks,
}: {
  submission: CompetitionSubmission;
  pickedTracks: CompetitionTrack[];
}) {
  const project = findProjectById(submission.projectId);
  return (
    <div className="flex flex-col gap-1 border-t border-[var(--color-border-muted)] pt-2">
      <h5 className="text-[10px] font-bold uppercase tracking-widest">
        Submission
      </h5>
      {project ? (
        <Link
          href={`/discover/projects/${project.id}`}
          className="text-sm font-semibold underline underline-offset-2"
        >
          {project.name}
        </Link>
      ) : (
        <span className="text-sm text-[var(--color-fg-subtle)]">Unknown project</span>
      )}
      {pickedTracks.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {pickedTracks.map((t) => (
            <span
              key={t.id}
              className="border border-[var(--color-border-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            >
              {t.name}
            </span>
          ))}
        </div>
      ) : null}
      {submission.submittedAt ? (
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
        </p>
      ) : null}
    </div>
  );
}
