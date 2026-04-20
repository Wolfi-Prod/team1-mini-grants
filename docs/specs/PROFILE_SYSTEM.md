# Applicant Profile System

> **Phase:** Tier 1 (shipped as Commit 3 · Page 12 `/u/[handle]`) · **Status:** frozen
>
> **Prerequisites** (read first, in order):
> - [../planning/SYSTEM_REDESIGN.md](../planning/SYSTEM_REDESIGN.md) — `User`, `Project`, `Application`, `Organization` schema
> - [../planning/USER_AND_ROLE_FLOWS.md](../planning/USER_AND_ROLE_FLOWS.md) — who should see which view mode
> - Project visibility rules from Commit 1 (project `hiddenSections` + `canSeeFullProject`)
>
> **Out of scope** (pointers, not content):
> - `/settings/profile` edit page → Tier 2 (see [../planning/PAGES.md](../planning/PAGES.md) § User Identity & Settings)
> - Competition team member rows link into this doc — see [HACKATHONS_CHALLENGES.md](HACKATHONS_CHALLENGES.md) for the reverse direction
> - API endpoints for `GET /api/users/:handle` etc → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
>
> **Also see:**
> - [HACKATHONS_CHALLENGES.md](HACKATHONS_CHALLENGES.md) — team member profile links flow from here
> - [../qa/TIER1_QA_CHECKLIST.md](../qa/TIER1_QA_CHECKLIST.md) § Page 12 — manual verification
>
> Spec for the Tier-1 public profile page. Profiles are intentionally **thin** for random viewers and **fat** for privileged viewers (platform admins + orgs with a business reason to see more). Closes the "nobody can see my grant history except the org I applied to" rule from the project visibility commit.

---

## 1. Route

`/u/[handle]` — handle is either the user's `builderHubId` (preferred) or a slugified
fallback of their name. `/profile/[userId]` is reserved as an internal alias.

Self-viewing: `/u/me` → server-redirects to the signed-in user's `/u/[handle]`.

---

## 2. Views

The server component computes a `ProfileViewMode` based on the viewer:

```ts
type ProfileViewMode = "public" | "self" | "admin" | "org";

function getProfileViewFor(
  viewer: User | null,
  target: User,
  viewerOrgIds: string[],
): ProfileViewMode {
  if (!viewer) return "public";
  if (viewer.id === target.id) return "self";
  if (viewer.isPlatformAdmin) return "admin";
  if (viewerOrgIds.length > 0) return "org"; // narrowed further by data filters
  return "public";
}
```

### 2.1 `public` — visitor + any logged-in applicant

Shows:
- Avatar
- Display name
- Bio (if set)
- Categories the user has worked in (derived from their public projects)
- **Public projects only** — projects with `visibility === "PUBLIC"` and not archived.
  Grid of project cards, each linking to `/showcase/[id]`.

Hides:
- Email, Builder Hub ID, country/state, wallet
- Private / archived projects
- Grant history (which grants they've applied to or won)
- Hackathon / challenge history

### 2.2 `self` — user viewing their own profile

Everything in `public`, PLUS:
- All their projects, including private and archived
- All their applications (including drafts)
- All their competition teams + submissions
- Account metadata (email, Builder Hub ID)
- `Edit profile` button → `/settings/profile` (Tier 2)

### 2.3 `admin` — platform admin viewing anyone

Everything. Full project list (public + private + archived), full application history
with status per grant + per org, full competition history including unsubmitted drafts,
all account metadata.

### 2.4 `org` — org user viewing anyone

`public` view PLUS a **scoped** fat view:

- Projects that have applied to any grant run by *viewer's* org. Basic details: name,
  description, banner/logo, status badge ("In review" / "Accepted" / etc. — the
  application status for that grant, not the project status).
- Grant history **with this org only** — not other orgs. If the target has applied to
  three grants (two from Org A, one from Org B), an Org-A viewer sees two rows, an
  Org-B viewer sees one.
- Competition history: teams + submissions for competitions run by this org.

Org views **never** see the target's unrelated projects or grants. This is a privacy
guarantee: `org` is a narrowed `public` view, not a demoted `admin` view.

Implementation: the server component loads the full dataset and filters rows down
before passing to the client. A `filterProfileForOrg(target, viewerOrgIds)` helper
lives in `lib/mock/users.ts`.

---

## 3. Page layout

1. **Header** — avatar, name, handle (`@builderHubId`), bio. On the right: view mode
   pill (only shown when not `public`): `[SELF]`, `[ADMIN]`, `[ORG: avalanche-foundation]`.

2. **Category strip** — categories this user works in, derived from their visible
   projects. Same style as project category pills.

3. **Projects card** — grid of project cards filtered by view mode. Empty state with
   copy tailored to mode (`public`: "No public projects yet" · `self`: "Create your
   first project" + CTA · `org`: "No projects applied to your org yet").

4. **Grants card** (only if view mode ≠ `public`) — table of applications:
   - Grant title (→ `/discover/grants/:id`) · Project (→ `/projects/:id`) · Status · Funding · Decided
   - `self` sees every row. `admin` sees every row. `org` sees only rows where
     `grant.organizationId === viewerOrgId`.

5. **Competitions card** (only if view mode ≠ `public`) — list of competition team
   memberships + submissions. Scoped the same way: `org` only sees competitions their
   org ran.

6. **Account card** (only if view mode ∈ `self` / `admin`) — email, Builder Hub ID,
   country/state, wallet address, created date.

---

## 4. Data model changes

Currently the `User` interface in `lib/types/index.ts` already has most of what we need
(name, email, builderHubId, image, country, state, walletAddress, isPlatformAdmin).
We add:

```ts
interface User {
  // existing fields ...
  bio: string | null;
  handle: string | null;     // derived from builderHubId or name; unique
  isProfilePublic: boolean;  // default true — if false, even public-mode viewers get a
                             // "This profile is private" page (still respects admin +
                             // org-scope views)
}
```

`handle` is populated from builderHubId on first run. If two users collide, append a
disambiguator.

---

## 5. Helpers (lib/mock/users.ts)

```ts
export function findUserByHandle(handle: string): User | undefined;

export function getProfileViewFor(
  viewer: User | null,
  target: User,
  viewerOrgIds: string[],
): ProfileViewMode;

export function getProjectsForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): Project[];

export function getGrantHistoryForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): { application: Application; grant: Grant; org: Organization }[];

export function getCompetitionHistoryForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): { team: CompetitionTeam; competition: Competition; submission?: CompetitionSubmission }[];
```

All four `getXxxForProfileView` helpers apply the same scoping rule: `public` → only
public non-archived projects; `self` / `admin` → everything; `org` → scoped to
competitions/grants where `viewerOrgIds.includes(entity.organizationId)`.

---

## 6. Integration points

- **Project detail** `/projects/[id]`: team member list links each member to `/u/[handle]`.
- **Showcase** `/showcase/[id]`: team section (when public) links each member.
- **My Applications** `/applications`: "Submitted by" row links to the lead's profile
  (for team submissions — Commit 4).
- **Competition team cards**: member avatars link to each member's profile (loose
  private cards hide the avatars behind the lock icon per §5.2 of the competition spec).

---

## 7. Ship plan (Commit 3)

- 1 new Tier-1 page: `/u/[handle]`
- Types: `ProfileViewMode`, extended `User` (bio, handle, isProfilePublic)
- Mock data: add bio + handle to existing mock users; populate one applicant with visible
  grant history, one with hidden history, one with a competition history stub
- Helpers in `lib/mock/users.ts`
- One client component for the view-mode pill (so self/admin/org viewers see their
  context without needing a page reload)

Deferred to Tier 2:
- `/settings/profile` — dedicated edit page
- Bio markdown + avatar upload
- Handle changes (custom slug)

---

## 8. Open TODOs

- What happens when a user is soft-deleted? Profile page → 404 (same as projects).
- Abuse / impersonation: platform admin can force a handle change; that's a Tier 2
  admin-panel feature.
- Profile activity feed (updates, awards, new projects) — not in Tier 1.
