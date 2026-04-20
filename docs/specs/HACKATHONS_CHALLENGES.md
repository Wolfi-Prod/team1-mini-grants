# Hackathons & Challenges

> **Phase:** Tier 1 (4a shipped — listings + detail · 4b shipped — team flow + submit modal · Pages 13–16) · **Status:** frozen
>
> **Prerequisites** (read first, in order):
> - [../planning/SYSTEM_REDESIGN.md](../planning/SYSTEM_REDESIGN.md) — base schema (users, orgs, projects, applications)
> - [../planning/USER_AND_ROLE_FLOWS.md](../planning/USER_AND_ROLE_FLOWS.md) — how the applicant/org roles interact
> - Project visibility rules from Commit 1 (hiddenSections, canSeeFullProject)
> - [PROFILE_SYSTEM.md](PROFILE_SYSTEM.md) — team member rows link to profile handles
>
> **Out of scope** (pointers, not content):
> - Org-side create/manage hackathon pages → Tier 2 ([../planning/PAGES.md](../planning/PAGES.md) § Grants Admin)
> - Automatic grant disbursement when a team wins → future Tier
> - Real API endpoints for competitions → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md) (TODO)
> - Judge scoring UI → Tier 2+
> - Notification inbox for invites → Tier 2 (`/notifications`)
>
> **Also see:**
> - [PROFILE_SYSTEM.md](PROFILE_SYSTEM.md) — competition history card on `/u/[handle]` pulls from this data model
> - [../qa/TIER1_QA_CHECKLIST.md](../qa/TIER1_QA_CHECKLIST.md) § Pages 13–16 + Team flow — manual verification
>
> Spec for the Tier-1 competition surface. Hackathons and Challenges are separate user-facing concepts but share a single data entity — the distinction is cosmetic (routing, copy, countdowns), not schema.

---

## 1. Vocabulary

- **Competition** — the shared entity. `format: "HACKATHON" | "CHALLENGE"`.
- **Hackathon** — time-bounded event with a submission window + judging day + result
  announcement. Countdowns and "X days left" UI.
- **Challenge** — open-ended problem statement with (optionally) a rolling deadline.
  No hard judging day; results announced asynchronously.
- **Track** — sub-category within a competition (e.g., "DeFi track", "NFT track"). Each
  track has its own prize pool. Teams can submit to **multiple** tracks at once.
- **Main prize** — top-level, cross-track prize (1st, 2nd, 3rd, "community favourite"...).
- **CompetitionTeam** — a team of applicants participating in exactly one competition.
  Default visibility is **loose private** (see §5). Lead can opt in to fully public.
- **CompetitionSubmission** — a team's submission of one project to one or more tracks.
- **CompetitionTeamInvitation** — an email-or-user invite. A user can hold at most one
  pending invite per competition *and* can only be on one team per competition.

---

## 2. Data model

```ts
type CompetitionFormat = "HACKATHON" | "CHALLENGE";

type CompetitionStatus =
  | "DRAFT"        // org setting up
  | "UPCOMING"     // published, registration not yet open
  | "OPEN"         // registration + submissions open
  | "JUDGING"      // submissions closed, judges reviewing
  | "ANNOUNCED"    // winners announced
  | "CLOSED";      // archived

interface Competition {
  id: string;
  organizationId: string;
  format: CompetitionFormat;
  title: string;
  slug: string;
  description: string;
  rules: string;                      // long-form markdown
  partner: string | null;             // partner name
  partnerLogoUrl: string | null;
  bannerUrl: string | null;

  // Timing — all nullable. Hackathons set them all; challenges usually only submissionDeadline.
  registrationOpensAt: ISODate | null;
  submissionDeadline: ISODate | null;
  judgingEndsAt: ISODate | null;
  resultsAnnouncedAt: ISODate | null;

  // Team rules
  minTeamSize: number;                // default 1 (solo allowed)
  maxTeamSize: number;                // default 5

  // Prize cap (display). Should equal or exceed sum of main prizes + track prizes.
  totalPool: number | null;
  currency: string;                   // "USD"

  status: CompetitionStatus;
  isPublic: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

interface CompetitionMainPrize {
  id: string;
  competitionId: string;
  rank: number;                       // 1, 2, 3, ...
  label: string;                      // "First place", "Runner-up", "Community favourite"
  amount: number | null;              // exact amount (not "up to")
  currency: string;
  description: string | null;
}

interface CompetitionTrack {
  id: string;
  competitionId: string;
  name: string;                       // "DeFi track"
  description: string | null;
  prizeAmount: number | null;         // per-track prize
  currency: string;
  sortOrder: number;
}

interface CompetitionTeam {
  id: string;
  competitionId: string;
  name: string;
  leadUserId: string;
  isPublic: boolean;                  // opt-in; default false (loose private)
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

interface CompetitionTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "LEAD" | "MEMBER";
  joinedAt: ISODate;
}

interface CompetitionTeamInvitation {
  id: string;
  teamId: string;
  competitionId: string;              // denormalised for uniqueness checks
  email: string;                      // lookup key
  invitedUserId: string | null;       // null if email doesn't match a known user yet
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "BLOCKED_ALREADY_ON_TEAM";
  invitedBy: string;                  // lead's userId
  message: string | null;
  createdAt: ISODate;
  respondedAt: ISODate | null;
}

interface CompetitionSubmission {
  id: string;
  competitionId: string;
  teamId: string;
  projectId: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "WITHDRAWN"
    | "WINNER"
    | "NOT_SELECTED";
  submittedAt: ISODate | null;
  decidedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

interface CompetitionSubmissionTrack {
  id: string;
  submissionId: string;
  trackId: string;                    // teams can pick multiple tracks per submission
}
```

All of these live in `lib/types/index.ts` (extended from the grants file set) and get
mocked in `lib/mock/competitions.ts` (new file) plus `lib/mock/competitionTeams.ts`.

---

## 3. Team rules

- **One team per competition** — enforced at create, invite-accept, and invite-create time.
  Pending invitations for a competition where the user is already on a team are stored
  with `status: "BLOCKED_ALREADY_ON_TEAM"` and surfaced in the user's inbox as
  "You can't accept this — leave {otherTeam} first."
- **Min team size = 1** means solo entries are allowed via "Register solo".
- **Max team size** set per-competition by the organiser. No platform cap.
- **Lead = creator.** Only the lead can:
  - invite new members
  - remove members
  - rename the team
  - toggle team visibility (loose private ↔ full public)
  - submit / withdraw the team's submission
- Lead transfer is deferred to Tier 2.
- **Members can leave voluntarily.** If the lead leaves, the team is disbanded unless
  they transfer lead first (Tier 2).
- **Multi-track submission:** a team submits one project to the competition. When the
  competition has tracks, the team picks one or more tracks; their submission competes
  in every track they picked. Main prizes are cross-track — winning 1st place is
  orthogonal to which tracks you entered.

---

## 4. Prize model

```ts
competition: {
  totalPool: 50000,                   // display cap
  mainPrizes: [
    { rank: 1, label: "First place",   amount: 20000 },
    { rank: 2, label: "Runner-up",     amount: 10000 },
    { rank: 3, label: "Third place",   amount: 5000  },
  ],
  tracks: [
    { name: "DeFi track",          prizeAmount: 5000 },
    { name: "NFT track",           prizeAmount: 5000 },
    { name: "Infra track",         prizeAmount: 5000 },
  ],
}
```

**Amounts are exact**, not "up to". Judges pick winners and the organiser disburses the
defined amount. If an amount is null, the UI renders "TBD".

The front-end surfaces a soft warning when `sum(mainPrizes) + sum(tracks) > totalPool`
but does not block the org from saving — pools can have unallocated buffer.

Main prizes and track prizes are awarded independently — the 1st-place winner can also
win the DeFi track prize if their team submitted to DeFi.

---

## 5. Visibility matrix

### 5.1 Competition-level visibility

Competitions are `isPublic: boolean`. Draft + private competitions are visible only to the
owning org. Everything else in §5 assumes the competition itself is public and visible.

### 5.2 Team visibility (loose private by default)

| Viewer | Sees team card (name + count) | Sees member roster | Sees submissions + tracks |
|---|---|---|---|
| Visitor | ✅ | ❌ | ❌ |
| Applicant not on team | ✅ | ❌ | ❌ |
| Applicant on this team | ✅ | ✅ | ✅ |
| Platform admin | ✅ | ✅ | ✅ |
| Org running this competition | ✅ | ✅ | ✅ |
| Any other org | ✅ | ❌ | ❌ |

Team lead can opt in to **full public** (`team.isPublic: true`): then "Applicant not on
team" and "Visitor" rows upgrade to ✅ across the board.

When a team is loose-private, the team card shows:
- team name, size ("3 of 5 members"), submission status ("Submitted to DeFi + Infra")
- a locked icon + "Members private"

When expanded by a privileged viewer, the card shows the full roster, each member's
public profile link, and the submission detail.

### 5.3 Integration with project visibility (from Commit 1/2)

The team attaches a Project. The project's own visibility rules still apply:
- If the project is PRIVATE → admins + "this competition's org" see it (via the existing
  org-with-application override). Other viewers see a "project details hidden" placeholder
  on the submission card.
- If the project is PUBLIC but the team is loose-private → everyone sees the project,
  but the team roster stays hidden.

In other words: the **team** and the **project** are two independent visibility axes.
Public project + private team means the public knows the project exists but not who
built it.

---

## 6. Pages

### 6.1 `/hackathons` — Hackathons listing (public, Tier 1)

- PageHeader: "Hackathons" + description + filter chips
- Filter chips: `All` · `Open` (default) · `Upcoming` · `Judging` · `Announced`
- Search input (title, partner, track name)
- Grid of `CompetitionRowCard` (mirrors `GrantRowCard` from discover):
  - Banner, status pill, format pill (HACKATHON), title, partner + logo
  - Total pool ("$50,000 pool")
  - Countdown ("8 days left" for submission deadline; "Judging in 3 days"; "Announced")
  - Team count ("12 teams registered")
- Empty state + "no competitions match" inline empty state
- `MockApiBadge`: `GET /api/competitions?format=HACKATHON&status=OPEN&search=`

### 6.2 `/challenges` — Challenges listing

Same shape as `/hackathons` but filters pinned to `format=CHALLENGE`. No countdown
prominence; rolling submissions get a "Rolling" label instead of day count.

### 6.3 `/hackathons/[id]` and `/challenges/[id]` — detail (public, Tier 1)

**Access control:**
- Visitor + applicant → public page
- Admin → `/admin`
- Org (not running) → `/dashboard/[slug]`
- Org running this competition → full admin-view panel on this page (instead of bouncing)

**Layout:**

1. **Hero strip** (black) — banner background, breadcrumb "← Hackathons/Challenges",
   partner + logo chip, format pill, status pill, title, description, timing strip
   (registration opens → submission deadline → judging → announcement)

2. **Total prize panel** — `${totalPool} pool`, main prizes ranked, track prizes grid,
   "open to teams of {min}–{max}"

3. **Rules card** — long-form rules text (markdown, no renderer in V1 — plaintext with
   pre-wrap)

4. **Tracks card** — one row per track: name, description, prize amount

5. **Main prizes card** — ranked list

6. **Teams panel** — "N teams registered · M submitted". Each team card follows the
   visibility matrix (§5.2). Role-aware footer:

   - Visitor → Button: `Sign in to join` → `/login`
   - Applicant with no team in this competition → 3 buttons:
     - `Register solo` (creates a team of 1 with your name)
     - `Create a team` (prompts for team name + invites)
     - `Join via invite` (if they have a pending invite for this competition)
   - Applicant already on a team in this competition → team management card:
     - Team name, roster, submission state
     - Lead: `Invite member`, `Submit project`, `Withdraw submission`, `Leave team`
     - Member: `Leave team` only
   - Admin → read-only admin view showing all teams + all submissions

7. **Submit modal** (opens from the team management card, lead-only):
   - **Step 1**: pick project — radio list of lead's projects or `+ Create new project`
   - **Step 2** (if `+ Create new`): full `/projects/new` form inlined in a modal panel
     (same fields, same validation). On save, the project is created with lead as owner
     AND attached to the submission.
   - **Step 3**: pick tracks — multi-select if competition has tracks; single submit
     button otherwise
   - **Confirm** → toast + modal closes + submission appears in the team card

---

## 7. Back-port: project picker on grant apply

`/discover/grants/[grantId]` currently has an `ApplyCTA` that picks a project via modal
and routes to `/projects/[id]/apply?grant=<id>`. That flow stays, but the modal gains
one extra row at the bottom:

> **+ Create a new project**

Clicking it navigates to `/projects/new` with a `?returnTo=/projects/{NEW_ID}/apply?grant=<id>`
query param. The create form, on submit, routes to `returnTo` with the newly-created
project id in place of `{NEW_ID}`. This closes the loop: a user on Discover can go
grant → create project → apply without leaving the grant funnel.

Same trick applies to the hackathon/challenge submit modal (§6.3 step 1).

---

## 8. Ship plan (Commit 4 — may split)

### 8.1 Commit 4a — data + read-only pages
- Types + mock data (2 hackathons, 2 challenges, with tracks + main prizes + 3–5 teams
  across both)
- 4 pages: `/hackathons`, `/hackathons/[id]`, `/challenges`, `/challenges/[id]` —
  read-only rendering, no team actions
- `CompetitionRowCard` shared component
- `MockApiBadge` on every page

### 8.2 Commit 4b — team + submission actions
- Team create / join / leave (via `CompetitionTeamActions` client component)
- Invitation system (extends `Invitation.type` enum with `"COMPETITION_TEAM"`)
- Blocked-invite state surfaced in inbox
- Submit modal (project picker → optional inline create → track picker → confirm)
- Back-port project picker to `/discover/grants/[grantId]` ApplyCTA modal

### 8.3 Tier 2 (deferred, listed in roadmap only)
- `/dashboard/[orgSlug]/hackathons` (org list)
- `/dashboard/[orgSlug]/hackathons/new` (org create)
- `/dashboard/[orgSlug]/hackathons/[id]` (org manage — see all teams, all submissions,
  judge / announce winners)
- Same 3 pages for challenges
- `/admin/hackathons` — platform-admin surface for seeding + cross-org visibility
- Lead transfer, per-team project ownership, judge scoring UI, winner → grant link

---

## 9. Open TODOs post-Tier-1

- Lead transfer flow
- Team-shared project ownership (today the project's legal owner = team lead; that's a
  simplification that breaks if the lead leaves)
- Judge scoring UI (score rubric, multiple judges, aggregation)
- Winner announcement → automatic grant disbursement linked via `Grant.id`
- Notifications inbox driving invite accept/decline UX
- Email delivery for external invitees
- Public team pages (`/hackathons/[id]/teams/[teamId]`) when teams opt in to full public
