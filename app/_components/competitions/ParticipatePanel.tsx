"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Modal } from "@/app/_components/ui/Modal";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Badge } from "@/app/_components/ui/Badge";
import { useMockAuth, useCurrentUser } from "@/lib/auth/useMockAuth";
import type {
  Competition,
  CompetitionSubmission,
  CompetitionTeam,
  CompetitionTeamInvitation,
  CompetitionTeamMember,
  CompetitionTrack,
  Project,
} from "@/lib/types";

interface Props {
  competition: Competition;
  tracks: CompetitionTrack[];
  /** Team this user is already on for this competition, if any. */
  currentTeam: CompetitionTeam | null;
  currentTeamMembers: CompetitionTeamMember[];
  currentSubmission: CompetitionSubmission | null;
  /** Pending invitations for this user + this competition. */
  pendingInvites: CompetitionTeamInvitation[];
  /** Projects owned by this user — used by the Submit modal's picker. */
  ownedProjects: Project[];
}

type View = "idle" | "create" | "invite" | "submit" | "leave";

export function ParticipatePanel({
  competition,
  tracks,
  currentTeam,
  currentTeamMembers,
  currentSubmission,
  pendingInvites,
  ownedProjects,
}: Props) {
  const router = useRouter();
  const role = useMockAuth((s) => s.currentRole);
  const user = useCurrentUser();
  const [view, setView] = useState<View>("idle");

  const basePath =
    competition.format === "HACKATHON" ? "/hackathons" : "/challenges";
  const returnTo = `${basePath}/${competition.id}`;

  // --- Unauthenticated / wrong role states ---

  if (role === "visitor") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Sign in as an applicant to register, create a team, or submit.
        </p>
        <div>
          <Button variant="primary" onClick={() => router.push("/login")}>
            Sign in to participate
          </Button>
        </div>
      </div>
    );
  }

  if (role !== "applicant") {
    return (
      <p className="text-sm text-[var(--color-fg-muted)]">
        Competitions are entered by applicants. Switch to the Applicant role in the dev
        role switcher to register for this {competition.format.toLowerCase()}.
      </p>
    );
  }

  if (!user) return null;

  // --- Applicant already on a team ---

  if (currentTeam) {
    return (
      <>
        <YourTeamBlock
          team={currentTeam}
          members={currentTeamMembers}
          submission={currentSubmission}
          onInvite={() => setView("invite")}
          onSubmit={() => setView("submit")}
          onLeave={() => setView("leave")}
          isLead={currentTeam.leadUserId === user.id}
        />
        {view === "invite" ? (
          <InviteModal
            team={currentTeam}
            competitionId={competition.id}
            onClose={() => setView("idle")}
          />
        ) : null}
        {view === "submit" ? (
          <SubmitModal
            competition={competition}
            tracks={tracks}
            team={currentTeam}
            ownedProjects={ownedProjects}
            returnTo={returnTo}
            onClose={() => setView("idle")}
          />
        ) : null}
        <ConfirmDialog
          open={view === "leave"}
          title="Leave this team?"
          destructive
          confirmLabel="Leave team"
          message={
            currentTeam.leadUserId === user.id ? (
              <>
                You&apos;re the lead — leaving disbands{" "}
                <strong>{currentTeam.name}</strong> and cancels any in-flight submission.
              </>
            ) : (
              <>
                You&apos;ll be removed from <strong>{currentTeam.name}</strong>. You can
                rejoin via a new invite, but only one team per competition.
              </>
            )
          }
          onConfirm={() => {
            // API: DELETE /api/competitions/:compId/teams/:teamId/members/me
            toast.success(`Left ${currentTeam.name} (mock)`);
            router.refresh();
          }}
          onClose={() => setView("idle")}
        />
      </>
    );
  }

  // --- Applicant NOT yet on a team ---

  return (
    <>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--color-fg-muted)]">
          You&apos;re not on a team for this {competition.format.toLowerCase()} yet. Pick
          how you want to participate.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() => {
              // API: POST /api/competitions/:id/teams  body: { name, solo: true }
              toast.success(
                `Registered solo for ${competition.title} (mock). A team of 1 was created.`,
              );
              router.refresh();
            }}
          >
            Register solo
          </Button>
          <Button variant="secondary" onClick={() => setView("create")}>
            Create a team
          </Button>
        </div>

        {pendingInvites.length > 0 ? (
          <div className="flex flex-col gap-2 border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">
              Pending invitations
            </h4>
            <ul className="flex flex-col gap-2">
              {pendingInvites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">
                      Invitation to team <em>{inv.teamId.replace("team_", "")}</em>
                    </span>
                    <Badge variant="default">PENDING</Badge>
                  </div>
                  {inv.message ? (
                    <p className="text-xs text-[var(--color-fg-muted)]">“{inv.message}”</p>
                  ) : null}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        // API: POST /api/invitations/:id/accept
                        toast.success("Invitation accepted (mock). You joined the team.");
                        router.refresh();
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // API: POST /api/invitations/:id/decline
                        toast.success("Invitation declined (mock).");
                        router.refresh();
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {view === "create" ? (
        <CreateTeamModal
          competition={competition}
          onClose={() => setView("idle")}
        />
      ) : null}
    </>
  );
}

// ---------- Your team block (already on a team) ----------

function YourTeamBlock({
  team,
  members,
  submission,
  onInvite,
  onSubmit,
  onLeave,
  isLead,
}: {
  team: CompetitionTeam;
  members: CompetitionTeamMember[];
  submission: CompetitionSubmission | null;
  onInvite: () => void;
  onSubmit: () => void;
  onLeave: () => void;
  isLead: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-bold uppercase">{team.name}</h4>
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
            You are {isLead ? "the LEAD" : "a MEMBER"} · {members.length} total ·{" "}
            {team.isPublic ? "Public team" : "Members private"}
          </span>
        </div>
        {submission ? (
          <Badge variant={submission.status === "WINNER" ? "inverted" : "default"}>
            {submission.status.replace("_", " ")}
          </Badge>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
            Not submitted
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isLead ? (
          <>
            <Button size="sm" variant="secondary" onClick={onInvite}>
              Invite member
            </Button>
            {submission ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  // API: PATCH /api/competitions/:id/submissions/:subId  body: { status: "WITHDRAWN" }
                  toast.success("Submission withdrawn (mock)");
                }}
              >
                Withdraw submission
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={onSubmit}>
                Submit project
              </Button>
            )}
          </>
        ) : null}
        <Button size="sm" variant="danger" onClick={onLeave}>
          Leave team
        </Button>
      </div>
    </div>
  );
}

// ---------- Create team modal ----------

function CreateTeamModal({
  competition,
  onClose,
}: {
  competition: Competition;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const router = useRouter();

  return (
    <Modal
      open
      onClose={onClose}
      title="Create a team"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={name.trim().length === 0}
            onClick={() => {
              // API: POST /api/competitions/:id/teams
              // body: { name }
              toast.success(`Team "${name.trim()}" created (mock).`);
              onClose();
              router.refresh();
            }}
          >
            Create team
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--color-fg-muted)]">
          You&apos;ll be the team lead. Max {competition.maxTeamSize} member
          {competition.maxTeamSize === 1 ? "" : "s"}. Invite others after the team exists.
        </p>
        <Input
          label="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Frozen Proofs"
          autoFocus
          required
        />
      </div>
    </Modal>
  );
}

// ---------- Invite member modal ----------

function InviteModal({
  team,
  competitionId,
  onClose,
}: {
  team: CompetitionTeam;
  competitionId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // For demo: if email is eddie's we simulate the "already on team" block.
  const demoBlocked =
    email.trim().toLowerCase() === "eddie.editor@avalanche.org";

  return (
    <Modal
      open
      onClose={onClose}
      title={`Invite to ${team.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={email.trim().length === 0}
            onClick={() => {
              // API: POST /api/competitions/:id/teams/:teamId/invites
              // body: { email, message }
              // Server checks uniqueness: if invitee already on a team for this comp,
              // returns { status: "BLOCKED_ALREADY_ON_TEAM" }.
              if (demoBlocked) {
                toast(
                  "Blocked — that user is already on another team for this competition.",
                );
                return;
              }
              toast.success(`Invitation sent to ${email.trim()} (mock).`);
              onClose();
              void competitionId;
            }}
          >
            Send invitation
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--color-fg-muted)]">
          The invitee must accept before joining. Each user can only be on one team per
          competition. If they&apos;re already on another team here, the invite is blocked.
        </p>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="builder@example.com"
          autoFocus
          required
          error={
            demoBlocked ? "This user is already on another team for this competition." : undefined
          }
        />
        <Textarea
          label="Message (optional)"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why you want them on the team…"
        />
      </div>
    </Modal>
  );
}

// ---------- Submit project modal ----------

function SubmitModal({
  competition,
  tracks,
  team,
  ownedProjects,
  returnTo,
  onClose,
}: {
  competition: Competition;
  tracks: CompetitionTrack[];
  team: CompetitionTeam;
  ownedProjects: Project[];
  returnTo: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    ownedProjects[0]?.id ?? "",
  );
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const requiresTracks = tracks.length > 0;
  const hasProject = selectedProjectId.length > 0;
  const tracksOk = !requiresTracks || selectedTrackIds.length > 0;
  const canSubmit = hasProject && tracksOk;

  function toggleTrack(trackId: string) {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((t) => t !== trackId)
        : [...prev, trackId],
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Submit to ${competition.title}`}
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={() => {
              // API: POST /api/competitions/:compId/teams/:teamId/submissions
              // body: { projectId, trackIds }
              toast.success(
                `Submitted ${ownedProjects.find((p) => p.id === selectedProjectId)?.name ?? "project"} (mock).`,
              );
              onClose();
              router.refresh();
              void team;
            }}
          >
            Submit
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide">
            Project <span aria-hidden>*</span>
          </label>
          {ownedProjects.length === 0 ? (
            <EmptyState
              title="You don't have any projects yet"
              description="Create one first — the submit flow will come back here after."
              action={
                <Link
                  href={`/projects/new?returnTo=${encodeURIComponent(returnTo)}`}
                  className="border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                >
                  Create a new project
                </Link>
              }
            />
          ) : (
            <>
              <ul className="flex max-h-64 flex-col divide-y divide-black overflow-y-auto border border-[var(--color-border-muted)]">
                {ownedProjects.map((p) => {
                  const active = p.id === selectedProjectId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedProjectId(p.id)}
                        className={
                          active
                            ? "flex w-full items-start justify-between gap-3 bg-[var(--color-bg-inverted)] p-3 text-left text-[var(--color-fg-on-inverted)]"
                            : "flex w-full items-start justify-between gap-3 bg-[var(--color-bg)] p-3 text-left hover:bg-[var(--color-bg-muted)]"
                        }
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-bold">{p.name}</span>
                          <span className="line-clamp-2 text-[10px] uppercase tracking-widest opacity-70">
                            {p.description}
                          </span>
                        </div>
                        {active ? (
                          <span className="text-[10px] font-semibold uppercase tracking-widest">
                            Selected
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href={`/projects/new?returnTo=${encodeURIComponent(returnTo)}`}
                    className="flex items-center justify-between gap-3 border-t border-dashed border-[var(--color-border-muted)] bg-[var(--color-bg)] p-3 text-sm font-semibold uppercase tracking-wide hover:bg-[var(--color-bg-muted)]"
                  >
                    + Create a new project
                    <span className="text-[10px] tracking-widest text-[var(--color-fg-muted)]">
                      Opens the full form
                    </span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>

        {requiresTracks ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide">
              Tracks <span aria-hidden>*</span>
            </label>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Pick one or more — your submission competes in every track you enter.
            </p>
            <div className="flex flex-wrap gap-2">
              {tracks.map((t) => {
                const active = selectedTrackIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTrack(t.id)}
                    className={
                      active
                        ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                        : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                    }
                  >
                    {t.name}
                    {t.prizeAmount != null
                      ? ` · $${t.prizeAmount.toLocaleString()}`
                      : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
