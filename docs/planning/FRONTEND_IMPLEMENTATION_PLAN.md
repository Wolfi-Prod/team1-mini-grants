# Frontend Implementation Plan

> **Status:** living (shipped log + tier tables update on every commit) · **Applies to:** frontend ship tracking
>
> **Prerequisites** (read first, in order):
> - [PAGES.md](PAGES.md) — what to build, in what scope
> - [USER_AND_ROLE_FLOWS.md](USER_AND_ROLE_FLOWS.md) — who needs what
> - [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) — underlying schema the UI hangs off
>
> **Out of scope** (pointers, not content):
> - Real API endpoints this mocks → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
> - Backend build order (Prisma + auth migration) → [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)
> - Per-feature design details → [../specs/](../specs/) (see PROFILE_SYSTEM, HACKATHONS_CHALLENGES)
> - Manual verification → [../qa/TIER1_QA_CHECKLIST.md](../qa/TIER1_QA_CHECKLIST.md)
>
> Barebones UI scaffold for all 50 pages defined in [PAGES.md](PAGES.md). Every page, every button, every feature visible and clickable — zero design, zero animation, pure black-and-white. Backend is mocked. Design is deferred. This is the **functional skeleton** the design + backend layers will attach to later.

---

## 1. Strategy

### 1.1 Rebuild from scratch
The existing pages ([app/page.tsx](../../app/page.tsx), [app/projects/](../../app/projects/), [app/discover/](../../app/discover/), [app/dashboard/](../../app/dashboard/)) were built for a single-grant MVP. The new spec in [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) is a multi-org, multi-grant, multi-role platform — incompatible. We delete and rebuild.

**Backup:** production lives on `main` on GitHub — no local archive needed. We delete the old app UI outright on this branch. If anything needs to be referenced later, `git show main:path/to/file` recovers it.

### 1.2 Mock everything
- **Data**: static TypeScript fixtures in [lib/mock/](../../lib/mock/) — users, orgs, projects, grants, applications, reviews, notifications, invitations.
- **Auth**: no real session. A global Zustand store holds `currentRole` (one of 4) + `adminPreset` + `orgPreset`. A floating dev-only **Role Switcher** widget (top-right, always visible) lets you flip between the 4 top-level roles. When **Admin** or **Org** is selected a second dropdown appears to pick a **module preset** — simulating different module grants without adding more mock users. Choice persists in `localStorage`.
- **API markers**: every spot that would call a real API gets a comment tag **AND** a matching row in [API_TO_BUILD.md](../api/API_TO_BUILD.md) so the backend work queue stays in sync with the frontend. Every new page updates the doc:
  ```tsx
  // API: GET /api/projects?ownerId={currentUser.id}
  const projects = mockProjects.filter(p => p.ownerId === user.id);
  ```
  ```tsx
  // API: POST /api/projects — creates project
  const handleSubmit = (data) => console.log('MOCK submit', data);
  ```
  Every handler, every fetch, every mutation — tagged.

### 1.3 Strip all current styling
- Remove all `animate-*`, `transition-*`, gradient, shadow, blur classes from the new code.
- Palette: `bg-white`, `bg-black`, `text-black`, `text-white`, `border-black`. Grays allowed only for disabled state (`text-gray-500`, `border-gray-300`).
- Typography: system font stack only.
- Layout: flex/grid, plain borders, no rounded corners beyond `rounded-sm`.
- Buttons: 1px black border, white bg, black text. Hover flips to black bg + white text. No transitions.

### 1.4 Next.js + TypeScript production rules
- App Router, server components by default, `'use client'` only when interactive state is needed.
- Strict TypeScript — no `any`, no `@ts-ignore`. Shared types in [lib/types/](../../lib/types/) matching the Prisma schema in [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md).
- Zod schemas for every entity — the same schemas will be reusable on the real API boundary.
- Semantic HTML. `<button>` not `<div onClick>`. Forms have `<label htmlFor>`. Icon-only buttons have `aria-label`.
- No `useEffect` for data fetching (mock is synchronous; real API will use React Query later).
- Colocation: each page folder owns its components in `_components/`, mock-data selectors in `_mock.ts`, types in `_types.ts`.
- No dead code, no commented-out code, no TODO drops. If it's not built yet, the page renders a `<ComingSoon feature="X" />` marker.

---

## 2. Priority Tiers

45 pages split into 4 tiers. We build strictly top-down — no tier starts until the previous is reviewed and accepted.

### Tier 1 — NEED (23 pages)
The minimum loop: applicant creates a project → applies to a grant / hackathon / challenge →
org reviews → reviewer scores → decision → applicant sees outcome.

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 1 | ✅ | Login | `/login` | Visitor |
| 2 | ✅ | Landing | `/` | Visitor |
| 3 | ✅ | Onboarding | `/onboarding` | New applicant |
| 4 | ✅ | My Projects | `/projects` | Applicant |
| 5 | ✅ | New Project | `/projects/new` | Applicant |
| 6 | ✅ | Project Detail | `/projects/[id]` | Applicant |
| 7 | ✅ | Discover | `/discover` | Visitor + Applicant |
| 8 | ✅ | Public Grant Detail | `/discover/grants/[grantId]` | Visitor + Applicant |
| 9 | ✅ | Apply to Grant | `/projects/[id]/apply` | Applicant |
| 10 | ✅ | My Applications | `/applications` | Applicant |
| 11 | ✅ | Application Detail | `/applications/[id]` | Applicant |
| 12 | ✅ | Applicant Profile | `/u/[handle]` | Visitor + Applicant + Admin + Org |
| 13 | ✅ | Hackathons Listing | `/hackathons` | Visitor + Applicant |
| 14 | ✅ | Hackathon Detail | `/hackathons/[id]` | Visitor + Applicant + Admin + Org |
| 15 | ✅ | Challenges Listing | `/challenges` | Visitor + Applicant |
| 16 | ✅ | Challenge Detail | `/challenges/[id]` | Visitor + Applicant + Admin + Org |
| 17 | ✅ | Org Overview | `/dashboard/[orgSlug]` | Org Owner |
| 18 | ✅ | Grants List (org) | `/dashboard/[orgSlug]/grants` | Org Owner |
| 19 | ✅ | New Grant | `/dashboard/[orgSlug]/grants/new` | Org Owner |
| 20 | ✅ | Applications List (org) | `/dashboard/[orgSlug]/grants/[grantId]/applications` | Org Owner |
| 21 | ✅ | Application Review (org) | `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]` | Org Owner |
| 22 | ✅ | My Reviews | `/reviews` | Reviewer |
| 23 | ✅ | Review Detail | `/reviews/[appId]` | Reviewer |

**Tier 1 progress:** 23 / 23 shipped. 🎉 Tier 1 complete. Tier 2 build order is tracked in the "Tier 2 — BUILD ON TOP" table + Tier 2 Shipped log below.

**Shipped log:**
- 2026-04-15 — Foundation wipe + new scaffolding (`chore: wipe legacy scaffolding and seed redesign foundation`)
- 2026-04-15 — Page 1 `/login`
- 2026-04-15 — Page 2 `/` (landing)
- 2026-04-15 — Page 4 `/projects` (My Projects)
- 2026-04-15 — Page 5 `/projects/new`
- 2026-04-15 — Page 6 `/projects/[id]` + public `/showcase/[id]` (bundled; will move under `/discover/projects/[id]` in Tier 2)
- 2026-04-15 — Page 7 `/discover`
- 2026-04-15 — Page 9 `/projects/[id]/apply` (Apply to Grant)
- 2026-04-15 — Page 8 `/discover/grants/[grantId]` (Public Grant Detail) + repointed Discover/Landing CTAs to canonical `/discover/grants/:id` route
- 2026-04-15 — Page 10 `/applications` (My Applications)
- 2026-04-15 — Flow fix: application flow is now strictly grant-first. `/projects/[id]/apply` requires `?grant=<id>` (redirects to `/discover` otherwise) and renders the grant as a locked header instead of a dropdown; `/projects/[id]` "Apply to grant" button now routes to `/discover`. Grant-first rule documented in memory (`feedback_apply_flow.md`).
- 2026-04-15 — Page 11 `/applications/[id]` (Application Detail) with summary, cover note, answers, timeline, and withdraw action
- 2026-04-15 — Feature: project visibility + archive (commit b17a485). New `Project.visibility` (PUBLIC / PRIVATE / CUSTOM), `hiddenSections`, and `archivedAt`. Create form gets a Visibility radio + per-field Hide toggles when Custom is selected. My Projects listing shows a visibility pill, a "Show archived" filter, and replaces Delete with Archive/Unarchive. Project detail gets the visibility pill in the header, inline per-section visibility toggles beside each card/heading (owner-only), a "Preview public view" mode via `?preview=1`, and Archive replaces Delete in the actions row. Org-with-application override (grant reviewers always see full project) implemented as a pure `canSeeFullProject` helper in `lib/mock/projects.ts`, wired from the showcase in commit 2d1f952.
- 2026-04-15 — Planning: added `docs/HACKATHONS_CHALLENGES.md` (4 new Tier-1 pages, `Competition` + `CompetitionTeam` + `CompetitionSubmission` data model, team flow with loose-private default, multi-track submission, back-port of project picker + inline create to the grant apply flow) and `docs/PROFILE_SYSTEM.md` (1 new Tier-1 page `/u/[handle]` with public / self / admin / org-scoped view modes). Tier 1 page count grew from 18 → 23, master list from 45 → 50. Ship order is Commit 1 → 2 → 3 → 4a → 4b.
- 2026-04-16 — Commit 2: `/showcase/[id]` public project detail page built. Honors visibility rules — PRIVATE and ARCHIVED 404 for non-owners, CUSTOM per-section filtering, PUBLIC shows everything. Platform admins and orgs that have received an application from the project get a full-access privileged-view banner and see every section regardless (via `canSeeFullProject`). Project owners viewing their own showcase redirect back to `/projects/[id]`. `/showcase` listing tightens the "Accepted for funding" badge so it's only shown when `isSectionPublic(project, "applications")` is true — the derived count never leaks information the project hides.
- 2026-04-16 — Commit 3 / Page 12: `/u/[handle]` applicant profile page built with four view modes (public / self / admin / org-scoped) plus navbar Profile button + user-name badge links to the profile.
- 2026-04-16 — Commit 4a / Pages 13–16: Competitions data model plus 4 read-only pages — `/hackathons`, `/hackathons/[id]`, `/challenges`, `/challenges/[id]`. Shared components under `app/_components/competitions/` (CompetitionRowCard, CompetitionTeamCard, CompetitionDetail). Navbar gains Hackathons + Challenges links. Mock data seeded with 2 hackathons + 2 challenges, 4 teams, 1 submission entered in 2 tracks.
- 2026-04-16 — Commit 4b: Team flow + submission modal on competition detail pages, plus back-port of the project picker to the grant apply CTA and real data for the profile competition history card.
- 2026-04-16 — Pages 17–21 (org loop): org dashboard shell + Overview + Grants list + New grant + Applications list + Application review. New helpers in lib/mock/orgs.ts + lib/mock/reviews.ts.
- 2026-04-16 — Pages 22–23 (reviewer loop): `/reviews` queue and `/reviews/[appId]` review form. ReviewForm has Decision radio, Score, and Feedback textarea; pre-fills on edit. Navbar gains a Reviews link. Mock seeded user_owner with two assignments so both Pending + Completed tables demo.
- 2026-04-16 — Page 3 (onboarding backfill, commit e7707eb): `/onboarding` page — black hero + profile form (display name, handle auto-derived, bio with min 10 chars, country + state + telegram, areas-of-interest pill toggles). Skip-for-now secondary button + primary Save and continue. Login page footer gets a "First time here? Complete your profile" link so new applicants have a natural path into the flow. Admin/org roles bounce away. Tier 1 closes at 23 / 23.

### Tier 2 — BUILD ON TOP (11 pages)
Direct extensions of Tier 1 flows — editing, team, files, public project view, grant dashboard, reviewer management, org membership, invitations.

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 24 | ✅ | Edit Project | `/projects/[id]/edit` | Applicant (owner) |
| 25 | ✅ | Manage Team | `/projects/[id]/team` | Applicant (owner) |
| 26 | ✅ | Manage Files | `/projects/[id]/files` | Applicant (owner) |
| 27 | ✅ | Public Project Detail | `/discover/projects/[id]` | Visitor + Applicant |
| 28 | ✅ | Grant Dashboard | `/dashboard/[orgSlug]/grants/[grantId]` | Org Owner |
| 29 | ✅ | Edit Grant | `/dashboard/[orgSlug]/grants/[grantId]/edit` | Org Owner |
| 30 | ✅ | Grant Questions | `/dashboard/[orgSlug]/grants/[grantId]/questions` | Org Owner |
| 31 | ✅ | Reviewers | `/dashboard/[orgSlug]/grants/[grantId]/reviewers` | Org Owner |
| 32 | ✅ | My Organizations | `/organizations` | Applicant + Org Owner |
| 33 | ✅ | Public Invite Accept | `/invite/[token]` | Visitor + anyone |
| 34 | ✅ | Invitations Inbox | `/invitations` | Applicant + Org Owner |

**Tier 2 progress:** 11 / 11 shipped. 🎉 Tier 2 complete.

**Tier 2 Shipped log:**
- 2026-04-16 — Commit A / Page 24: `/projects/[id]/edit` applicant-only edit form. Mirror of `/projects/new` pre-filled from the owner's project. Supports logo / banner / pictures replacement (existing previews stay until replaced or removed), visibility + per-section Hide toggles, categories, website / project / other links, contract addresses. Archived projects show an ARCHIVED banner above the form. Non-owners → `/showcase/[id]`. Non-applicants → role-default redirect. Submit mocks `PATCH /api/projects/:id` (backend will write a ProjectVersion snapshot on real swap) and routes back to `/projects/[id]`.
- 2026-04-16 — Commit B / Pages 25–26: `/projects/[id]/team` + `/projects/[id]/files` owner-only roster pages. Add / edit / remove flows share a Modal + ConfirmDialog pattern. Team form validates email shape + enforces per-project uniqueness. Files form validates http(s) URL + enforces per-project URL uniqueness; Type select covers pitch deck / whitepaper / demo video / design / audit / other. Local React state patches the list immediately so users see adds/removes without a refresh — data resets on reload until the real API lands. New endpoint rows added to API_TO_BUILD.md sections 9 + 10.
- 2026-04-16 — Commit C / Page 27: canonical public project page `/discover/projects/[id]`. Same visibility rules as the old `/showcase/[id]` — PRIVATE + ARCHIVED 404 for non-owners, CUSTOM per-section filtering, PUBLIC shows everything; platform admin + org-with-application override via `canSeeFullProject`. `/showcase/[id]` now serves a permanent 301 redirect to the new canonical URL. All 8 internal links that pointed at `/showcase/${id}` swept to `/discover/projects/${id}` (non-owner project route guards, profile project grid, reviewer + org application details, competition team card, showcase listing row). API markers updated from `/api/showcase/projects/*` to `/api/discover/projects/*`.
- 2026-04-16 — Commit D / Page 28: `/dashboard/[orgSlug]/grants/[grantId]` grant dashboard — 4 stat cards (total apps, submitted/in-review, accepted, funding committed/pool), full 6-status pipeline list, recent applications panel linking into the org app detail, Questions + Reviewers summary cards with Manage CTAs, and a Grant summary card (deadline, visibility, funding requested, created). New `findReviewAssignmentsByGrant` + `isAssignmentComplete` helpers in `lib/mock/reviews.ts`.
- 2026-04-16 — Commit E / Page 29: `/dashboard/[orgSlug]/grants/[grantId]/edit` grant edit form. Pre-fills title / slug / description / requirements / funding pool / currency / deadline / status / public + flagship flags. Slug auto-derives from title until user edits it manually; funding pool accepts blank for unspecified. Destructive Archive button mocks `PATCH { status: "ARCHIVED" }` and routes back to the grants list; Save routes back to the dashboard.
- 2026-04-16 — Commit F / Page 30: `/dashboard/[orgSlug]/grants/[grantId]/questions` — full CRUD + reorder for `GrantQuestion`. Add / edit modal validates label presence and, for SELECT / MULTI_SELECT types, requires ≥2 comma-separated options. Each row shows type + required badges + options preview. Up/Down chevron buttons reorder locally (optimistic); removed questions renumber sortOrder in place. Destructive remove confirm warns that existing applications keep their answer while new applications stop seeing the question.
- 2026-04-16 — Commit G / Page 31: `/dashboard/[orgSlug]/grants/[grantId]/reviewers` — per-application reviewer assignment. One card per non-draft application; each lists current assignments with a Pending / Completed badge driven by `isAssignmentComplete` + a Remove button (disabled when the reviewer has already submitted a review). Assign modal filters the candidate pool to hide users who already cover this application + the applicant themselves (basic COI guard). Optional due date picker.
- 2026-04-16 — Commit H / Page 32: `/organizations` "my organizations" list. Shows orgs the current user belongs to with a per-row OWNER / WHITELISTED role badge + member count + grants count + open grants count + "Open dashboard" CTA. Platform admins see every org with an ADMIN VIEW badge. Empty state ("invite-only") links to `/invitations`. Applicable to both applicants with org membership + org owners.
- 2026-04-16 — Commit I / Page 33: `/invite/[token]` public invite accept page. Works without a login — shows org/grant + role + expiry + inviter. State badge driven by new `invitationState(i)` helper: PENDING / EXPIRED / ACCEPTED / DECLINED. Accept flow honors email match (if viewer is signed in under a different email, they see a "sign out first" nudge). Unauthenticated PENDING invites route through `/login?returnTo=/invite/<token>` first. Mock seeded with 5 invitations covering every state (Alice: 2 pending + 1 accepted + 1 expired; external: 1 accepted).
- 2026-04-16 — Commit J / Page 34: `/invitations` logged-in invitation inbox. Pending card on top with Review CTA per row; Past card below (Accepted + Declined + Expired) with View CTA. Both sections render the same InviteRow component which shows the org/grant target, role, inviter, and state-specific timestamp. Tier 2 closes at 11 / 11. 🎉

**Tier 2 Planned build order:**

| Commit | Scope | Blocking |
|---|---|---|
| **Commit A** | Edit Project (`/projects/[id]/edit`) — mirror of `/projects/new`, pre-filled from the owner's project. Supports visibility/hiddenSections edit, archive shortcut, cancel → back to detail. | — |
| **Commit B** | Team + Files management pages. Shared add/remove modal pattern. | Commit A (same owner-gate helpers) |
| **Commit C** | Public project canonical route — `/discover/projects/[id]` + permanent redirect from `/showcase/[id]`. Updates Discover + grant-apply links to the new canonical. | Commit B |
| **Commit D** | Grant Dashboard + Edit Grant + Grant Questions. Completes the grant admin surface. | — (parallel to A–C) |
| **Commit E** | Reviewers assignment page — closes the org-side review loop. | Commit D |
| **Commit F** | Organizations list + Invitations (public accept + inbox). Needs extended `lib/mock/invitations.ts`. | — |

### Tier 3 — ADDITION (11 pages)
Fills out the product — settings, notifications, updates, versions, org management, disbursements, FAQ.

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 35 | ✅ | Notifications Inbox | `/notifications` | Every authenticated user |
| 36 | ✅ | Profile Settings | `/settings/profile` | Every authenticated user |
| 37 | ✅ | Account Settings | `/settings/account` | Every authenticated user |
| 38 | ✅ | Notification Preferences | `/settings/notifications` | Every authenticated user |
| 39 | ✅ | Manage Updates | `/projects/[id]/updates` | Applicant (owner) |
| 40 | ✅ | Project Versions | `/projects/[id]/versions` | Applicant (owner) |
| 41 | ✅ | Org Members | `/dashboard/[orgSlug]/members` | Org Owner |
| 42 | ✅ | Org Settings | `/dashboard/[orgSlug]/settings` | Org Owner |
| 43 | ✅ | Grant Permissions | `/dashboard/[orgSlug]/grants/[grantId]/settings` | Org Owner |
| 44 | ✅ | Disbursements | `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` | Org Owner |
| 45 | ✅ | FAQ | `/faq` | Everyone |

**Tier 3 progress:** 11 / 11 shipped. 🎉 Tier 3 complete.

**Tier 3 Shipped log:**
- 2026-04-16 — Page 35: `/notifications` inbox. All / Unread / Read filter pills; per-row "Mark read" + "Open" CTAs (Open links to the notification's destination and marks read on click); header "Mark all read" button disables when nothing's unread. Unread rows render a filled dot + NEW badge.
- 2026-04-16 — Page 36: `/settings/profile`. Shared `SettingsSidebar` component (Profile / Account / Notifications) mounts on every settings page. Form validates handle (3–32 chars, a-z0-9-) and optional bio (min 10 when filled). Toggle for `isProfilePublic` with inline explanation of what "private" does. Contact + location grid for telegram / wallet / country / state. "View public profile →" link uses current handle.
- 2026-04-16 — Page 37: `/settings/account`. Read-only Sign-in card (email from SSO, BuilderHub ID, account status badges, created date). Danger-zone DeleteAccountCard pre-checks live application count and disables the delete button when > 0; the confirm dialog requires typing DELETE to activate. Server-side API is `DELETE /api/me` with soft-delete + PII scrub; frontend toast is the mock.
- 2026-04-16 — Page 38: `/settings/notifications`. 8 notification event types grouped by role (Applicant / Reviewer / Org Admin / Account), each with independent Email + In-app toggles. "Mute email" + "Mute in-app" batch buttons on the Channels card flip every row off in one click. Defaults: email on for the 4 most consequential events (status change, reviewer assigned, invite received, funding disbursed); in-app on for everything.
- 2026-04-16 — Page 39: `/projects/[id]/updates` owner-only CRUD for `ProjectUpdate`. Add / edit modal requires title + body ≥20 chars. Newest update appears at the top of the list; destructive remove confirm warns the row disappears from the public project page but existing applications retain their context. Shared Modal + ConfirmDialog pattern (same as team / files / questions).
- 2026-04-16 — Page 40: `/projects/[id]/versions` read-only history viewer. Shows every `ProjectVersion` newest-first, with a "Latest" badge on the most recent, changed-by + change-log text, and a collapsible Snapshot `<details>` that renders the JSON payload for nerds. No edit / diff UI yet — that's a Tier-5 nice-to-have.
- 2026-04-16 — Page 41: `/dashboard/[orgSlug]/members` org member CRUD. Per-row Select toggles between OWNER / WHITELISTED; last-owner guard blocks the final demotion and the final Remove (both UI disable + API fallback). Invite modal hits `POST /api/organizations/:orgId/invitations` which creates an Invitation row — they land in /invitations on the invitee's side, not straight into Members.
- 2026-04-16 — Page 42: `/dashboard/[orgSlug]/settings` org profile form + danger-zone delete. Slug edit supports live change (redirects to the new URL on save) with validation. Delete disabled when live grants exist; confirm dialog requires typing the org slug. Dashboard sidebar gains "Members" + "Settings" links under a new "Org" group.
- 2026-04-16 — Page 43: `/dashboard/[orgSlug]/grants/[grantId]/settings` grant permissions CRUD. Per-row Select between VIEWER / EDITOR / REVIEWER; add modal filters out already-assigned users so you can't double-grant. Empty state explains that org owners + whitelisted members already have full access — this page is for scoped, outside-user grants only. New `findGrantPermissionsByGrant` helper in `lib/mock/grants.ts`.
- 2026-04-16 — Page 44: `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` milestone disbursements. 3 stat cards (completed / pending / funding requested), full CRUD with amount + currency + status + milestone + note + disbursed date. Status=Completed auto-stamps today when date is blank. Read-only mode engages when the underlying application status is not ACCEPTED (banner + disabled actions).
- 2026-04-16 — Page 45: `/faq`. Static page; 5 sections (Getting started / Applying for grants / Hackathons & challenges / For org admins / Privacy & data), each with collapsible `<details>` entries. Top-of-page anchor nav jumps between sections. "Still stuck?" footer card directs grant-specific questions to the running org. Tier 3 closes at 11 / 11. 🎉

### Tier 4 — NICE TO HAVE (5 pages)
Platform admin + SSO callback.

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 46 | ✅ | SSO Callback | `/auth/callback` | Visitor (post-SSO) |
| 47 | ✅ | Platform Dashboard | `/admin` | Platform Admin |
| 48 | ✅ | All Organizations | `/admin/organizations` | Platform Admin |
| 49 | ✅ | All Users | `/admin/users` | Platform Admin |
| 50 | ✅ | Audit Log | `/admin/audit-log` | Platform Admin |

**Tier 4 progress:** 5 / 5 shipped. 🎉 Tier 4 complete. **50 / 50 pages shipped — every page on the master list is live.**

**Tier 4 Shipped log:**
- 2026-04-16 — Page 46: `/auth/callback` SSO landing shell. Three branches: already-authenticated (fires through `resolvePostLoginTarget` with onboarding-aware fallback), BuilderHub error (surfaces error + error_description with retry CTAs), missing code/state (fallback with 3-step handshake explainer). Happy-path render shows a debug-friendly card listing the code + state + returnTo params — in production the real backend 302s before this JSX renders.
- 2026-04-16 — Page 47: `/admin` platform dashboard. Shared `/admin/*` layout gates on `user.isPlatformAdmin` (silent redirect to `/` for non-admins) and mounts a DashboardShell sidebar (Overview / Organizations / Users / Audit log). Dashboard surface: 4 stat cards (orgs / users / live grants / applications) + recent audit trail (top 5 newest) + Quick actions + System health status card. Each stat card carries a contextual hint line.
- 2026-04-16 — Page 48: `/admin/organizations` all-orgs admin directory. Searchable by name + slug, filter chips (all / active / suspended), per-row Open / Suspend / Restore buttons. Suspend sets `deletedAt` (soft-delete) blocking member dashboard access + new applications; Restore clears it. Both flows go through a ConfirmDialog with role-specific copy.
- 2026-04-16 — Page 49: `/admin/users` user directory. Search by name / email / handle; filter chips (all / admins / active / deleted). Per-row Profile / Make admin / Demote / Delete actions. Last-admin + self-demotion + self-delete guards all disable the relevant buttons (with `title` explanation) and the backend will enforce the same rules with 409 codes. Destructive confirm dialogs explain PII scrub + org-membership retention.
- 2026-04-16 — Page 50: `/admin/audit-log` filterable audit trail. 6 filter controls (search across action+resource+metadata+actor, action dropdown, resource type dropdown, actor dropdown, from / to date range). Clear + Export CSV buttons. Each row shows action badge + resource id + actor link (or "actor deleted" when FK nulled) + IP + timestamp + collapsible Metadata `<details>` with JSON payload. Mock extended from 3 → 12 entries so filters have meaningful coverage. Tier 4 closes at 5 / 5; master page list at 50 / 50. 🎉

### Tier 5 — POWER USER (6 pages)
Search + review quality + analytics. Maps to backend Phase 5 (search, app versioning, COI checks).

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 51 | ✅ | Global Search | `/search` | Every authenticated user |
| 52 | ✅ | Application Versions | `/applications/[id]/versions` | Applicant + Org reviewing |
| 53 | ✅ | Reviewer Dashboard | `/reviews/dashboard` | Reviewer |
| 54 | ✅ | Grant Analytics | `/dashboard/[orgSlug]/grants/[grantId]/analytics` | Org Owner |
| 55 | ✅ | Platform Reviewer Audit | `/admin/reviewers` | Platform Admin |
| 56 | ✅ | Cross-Grants Panel | `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants` | Org Owner |

**Tier 5 progress:** 6 / 6 shipped. 🎉 Tier 5 complete.

**Tier 5 Shipped log:**
- 2026-04-16 — Page 51: `/search` global search. Scope chips (All / Projects / Grants / Applications / Users / Orgs), shareable URL via `?q=&scope=`, 2-char minimum query, case-insensitive substring matching across name + description + categories + handles + cover notes + org slugs. Corpus pre-filtered server-side to what the viewer can see (mock allows all non-deleted; real backend will ACL). Empty states for "start typing" and "no matches". Navbar gains a Search link for authenticated users.
- 2026-04-16 — Page 52: `/applications/[id]/versions` — application snapshot history with diff viewer. New `ApplicationVersion` type + `mockApplicationVersions` seeded with 4 rows (app_01 has 2 versions demonstrating a resubmit with changed cover note + funding + answers; app_02 + app_04 have 1 each). Rendering marks changed fields with a left border + "· changed" label + collapsible previous-value `<details>`. Access: applicant owner, platform admin, or a member of the grant's org. 409 otherwise. Added a Versions CTA to `/applications/[id]` header actions.
- 2026-04-16 — Page 53: `/reviews/dashboard` reviewer performance surface. 4 stat cards (pending with overdue hint / completed / avg score / avg assign-to-submit turnaround in days). Decision distribution card renders a horizontal bar per outcome (Approve / Reject / Request changes) with count + percentage. Upcoming queue card shows top 5 pending assignments sorted by due date, with OVERDUE badge when past due. Empty state if the user has zero assignments. `/reviews` header gets a Dashboard CTA.
- 2026-04-16 — Page 54: `/dashboard/[orgSlug]/grants/[grantId]/analytics` grant analytics. 4 stat cards (applications / accept rate / avg decision time / reviewers). Funnel card renders each ApplicationStatus as a horizontal bar (DRAFT as % of total, everything else as % of non-draft). Categories card breaks down by first category of each applied project. Reviewer performance card lists every reviewer on this grant with assigned / completed / avg score / avg turnaround. Grant dashboard header gains an Analytics CTA.
- 2026-04-16 — Page 55: `/admin/reviewers` cross-platform reviewer audit. One row per reviewer (across every grant), sorted by COI flag count. 3 stat cards (reviewers / active assignments / COI flags). Two mock COI rules — `APPLICANT_IS_SELF` (reviewer is the project owner) + `SAME_ORG_AS_APPLICANT` (both share an org). Per-row stats: assigned / completed / avg score / turnaround days. COI details expand via `<details>` with the flagged application + project + grant context. Admin sidebar gains a "Reviewers" link in the Compliance group.
- 2026-04-16 — Page 56: `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants` controlled-visibility panel. Applicant-stats card (total apps / accepted / funding received). Other-applications card lists each other grant the applicant submitted to, with org + status + submitted date + requested + received — but NOT answers, feedback, scores, or decision reasoning (enforced by the planned `/api/cross-grants` ACL). Wired from the org app review page header. Tier 5 closes at 6 / 6.

### Tier 6 — ECOSYSTEM ADDONS (6 pages)
Integrations + growth + ops polish. Maps to backend Phase 6 (digests, webhooks, public API, analytics).

| # | Status | Page | Route | Primary role |
|---|---|---|---|---|
| 57 | ✅ | Org Analytics | `/dashboard/[orgSlug]/analytics` | Org Owner |
| 58 | ✅ | Email Digest Settings | `/dashboard/[orgSlug]/digest` | Org Owner |
| 59 | ✅ | Webhooks | `/dashboard/[orgSlug]/webhooks` | Org Owner |
| 60 | ✅ | Public API Keys | `/dashboard/[orgSlug]/api-keys` | Org Owner |
| 61 | ✅ | Grant Embed Widget | `/dashboard/[orgSlug]/grants/[grantId]/embed` | Org Owner |
| 62 | ✅ | Grant Templates | `/dashboard/[orgSlug]/grants/templates` | Org Owner |

**Tier 6 progress:** 6 / 6 shipped. 🎉 Tier 6 complete. **Master list: 62 / 62 — full frontend scaffold live.**

**Tier 6 Shipped log:**
- 2026-04-16 — Page 57: `/dashboard/[orgSlug]/analytics` org-wide analytics. 4 stat cards (active grants / applications / disbursed / avg decision time). Funnel bar chart across every grant this org runs. Category breakdown by first project category. Per-grant leaderboard sorted by application count. Dashboard sidebar gains an Analytics top-level link.
- 2026-04-16 — Page 58: `/dashboard/[orgSlug]/digest` email digest settings + live preview. Cadence (off / daily / weekly) with day + UTC time pickers, recipients (owners only / every member), 4 section toggles (new apps / pending reviews / deadlines / stats). Live preview card renders a From / Subject / Body mock from real counts (new apps in last 7 days, pending reviewers, deadlines closing in 7 days). "Send test now" mocks `POST /digest/send-now`.
- 2026-04-16 — Page 59: `/dashboard/[orgSlug]/webhooks` webhook registration. Event chips (application.submitted / .status.changed / review.completed / disbursement.completed / grant.published), HTTPS-only URL validation, per-row Send test / Rotate secret / Enable-Disable / Edit / Remove. Secret is shown once on create + rotate. Seed row pointed at a Slack webhook URL.
- 2026-04-16 — Page 60: `/dashboard/[orgSlug]/api-keys` public API key management. Mint keys with a label + scope; full plaintext shown exactly once in a separate modal (with Copy button) — afterwards only the 10-char prefix stays in the UI. Read-only scope today; read-write option marked "not implemented yet". Per-row Revoke (destructive confirm; immediately 401s any client). Seed: 2 active production keys.
- 2026-04-16 — Page 61: `/dashboard/[orgSlug]/grants/[grantId]/embed` grant embed widget. Theme (light/dark) + size (full 360px / compact 180px) configurator with live visual preview card that flips styling to match selected theme. Outputs both an `<iframe>` snippet and a drop-in `<script>` tag, each with a Copy button. URL reflects picked params (`?theme=dark&compact=1`). Embed CTA added to grant dashboard actions.
- 2026-04-16 — Page 62: `/dashboard/[orgSlug]/grants/templates` grant template library. Shipped grants become clone sources automatically (no separate template model yet — listed straight from `findGrantsByOrg`). Clone confirm dialog copies description / requirements / funding / questions / flags; title / slug / deadline reset; new grant lands as DRAFT. Master list closes at 62 / 62.

---

## 3. Architecture

### 3.1 Folder layout

```
app/
  _components/
    ui/                    # B&W primitives (Button, Input, Card, Badge, Modal, Table, Select, Textarea, Tabs)
    layout/                # Navbar, Sidebar, DashboardShell, PageHeader
    dev/
      RoleSwitcher.tsx     # mock auth widget (client only)
      MockApiBadge.tsx     # small "MOCK DATA" pill shown on every page
  (pages organized by flow — see tier tables)

lib/
  mock/
    users.ts               # mockUsers
    orgs.ts                # mockOrgs, mockOrgMembers
    projects.ts            # mockProjects, mockProjectTeam, mockFileLinks, mockUpdates, mockVersions
    grants.ts              # mockGrants, mockGrantQuestions
    applications.ts        # mockApplications, mockApplicationAnswers
    reviews.ts             # mockReviews, mockReviewAssignments
    notifications.ts       # mockNotifications
    invitations.ts         # mockInvitations
    disbursements.ts
    auditLog.ts
    index.ts               # barrel re-export
  types/                   # shared Zod schemas + TS types
  auth/
    useMockAuth.ts         # Zustand store: { currentUser, currentRole, setRole, signOut }
    roles.ts               # role enum + permission helpers (canEditGrant, canReviewApp, etc.)
```

### 3.2 Mock auth model

```ts
type MockRole =
  | 'visitor'
  | 'applicant'
  | 'reviewer'
  | 'orgOwner'
  | 'orgWhitelisted'
  | 'grantEditor'
  | 'grantReviewer'
  | 'platformAdmin';
```

The Role Switcher widget is a fixed overlay (top-right corner, 1px black border, white bg). Clicking opens a dropdown listing all 8 roles. Each choice also picks a matching mock user so the whole app re-renders consistently (e.g., choosing "Org Owner" also sets `currentUser = mockUsers.aliceOrgOwner`).

Server components read role via a cookie (set by the client switcher) so that RSC branches work too.

### 3.3 UI primitives

Plain TS React components, no shadcn, no Radix. All black/white, zero transitions.

| Primitive | Props |
|---|---|
| `Button` | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'`, `size`, `disabled` |
| `Input` | `label`, `error`, `hint`, all native `<input>` props |
| `Textarea` | `label`, `rows`, `error` |
| `Select` | `label`, `options: {value,label}[]` |
| `Card` | `title?`, `actions?`, children |
| `Badge` | `variant: 'default' \| 'success' \| 'danger' \| 'warning'` — all rendered as outlined pills |
| `Modal` | `open`, `onClose`, `title`, children, `footer` |
| `Table` | `columns`, `rows`, `onRowClick?` |
| `Tabs` | `tabs: {id,label}[]`, `activeId`, `onChange` |
| `EmptyState` | `title`, `description`, `cta?` |
| `ConfirmDialog` | `open`, `title`, `message`, `confirmLabel`, `onConfirm` |

### 3.4 API-marker convention

Every mocked integration point is tagged with a single-line comment using the literal token `API:` so we can grep the entire codebase later:

```tsx
// API: GET /api/projects?ownerId={userId}
// API: POST /api/projects (FormData)
// API: PATCH /api/applications/{id}/status
// API: DELETE /api/grants/{id}
```

Every page also renders a small `<MockApiBadge>` pill in the header listing which endpoints it _would_ hit — visible to us during development, easy to remove later.

---

## 4. Per-Page Build Loop

For every page in the tier, the loop is:

1. **Scope** — I read [PAGES.md](PAGES.md) + [USER_AND_ROLE_FLOWS.md](USER_AND_ROLE_FLOWS.md) + [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) for this route. I list:
   - Which roles see it and what differs per role
   - Every button, form field, interactive element
   - Every API endpoint it touches
   - Any new mock data needed
2. **Questions** — I ask only if something is genuinely ambiguous (edge cases, priority within the page, what a specific button should do). If nothing is blocking I just build.
3. **Build** — I create the page file, the components it needs under `_components/`, extend mock data if required, wire up handlers as `console.log` stubs tagged with `API:`.
4. **Report** — I post:
   - Files created/changed (with clickable links)
   - What the page shows per role
   - List of every button + what it does
   - Which mock data / endpoints are tagged
5. **Review** — You try it at the route, call out fixes.
6. **Fix** — I apply corrections. Loop until you say "ship".
7. **Next** — Only after acceptance do I move to the next page in the tier.

When the whole tier is done I dispatch **orchestrator-agent** to audit the tier's output (code quality, accessibility, TS strictness) before starting the next tier.

---

## 5. Shared work before Tier 1 (Page 0)

Before any page, one setup pass:

1. **Delete legacy UI + API** (main on GitHub is the backup):
   - `app/page.tsx`, `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, `app/auth.ts`
   - `app/_components/`, `app/_lib/`, `app/constant/`, `app/hooks/`, `app/types/`, `app/utils/`
   - `app/FAQ/`, `app/submission/`, `app/projects/`, `app/discover/`, `app/dashboard/`
   - `app/api/` — old endpoints deleted; new backend will be rebuilt against the spec in [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md)
   - `components/comp-531.tsx`, `components/comp-532.tsx`, `components/magicui/`, `components/ui/` (all shadcn primitives — we're rebuilding simpler)
   - `lib/auth.ts`, `lib/auth-client.ts` (replaced by `lib/auth/useMockAuth.ts`)
   - **Keep:** `lib/db.ts` (MongoDB client used for data migration later), `lib/utils.ts`
2. **Prune dependencies** from `package.json`:
   - Forms: `react-hook-form`, `@hookform/resolvers`, `zod`
   - Animation: `framer-motion`, `motion`, `gsap`, `tw-animate-css`, `react-particle-image`
   - Auth/Web3 (will be rebuilt in new backend): `better-auth`, `next-auth`, `siwe`, `@rainbow-me/rainbowkit`, `@rainbow-me/rainbowkit-siwe-next-auth`, `wagmi`, `viem`, `@wagmi/chains`
   - Old backend: `cloudinary`, `nodemailer`, `@types/nodemailer`, `pino-pretty`
   - Shadcn/Radix: all `@radix-ui/*`, `radix-ui`, `class-variance-authority`, `cmdk`
   - Unused: `@tanstack/react-query`, `@tanstack/react-table`, `nuqs`, `next-themes`, `uuid`, `@rooks/use-window-size`
   - **Keep:** `mongodb`, `mongoose` (data migration reference); `zustand`, `lucide-react`, `clsx`, `tailwind-merge`, `sonner`, `use-debounce`, `country-state-city`
   - Run `pnpm install` after.
3. **Rewrite `app/globals.css`** to a minimal B&W baseline: keep Tailwind v4 import, drop every custom token and animation.
4. **Build UI primitives** in `app/_components/ui/` — Button, Input, Textarea, Select, Card, Badge, Modal, Table, Tabs, EmptyState, ConfirmDialog.
5. **Build layout components** in `app/_components/layout/` — `Navbar`, `DashboardShell`.
6. **Build dev tools** in `app/_components/dev/` — `RoleSwitcher`, `MockApiBadge`.
7. **Build mock auth** in `lib/auth/useMockAuth.ts` + `lib/auth/roles.ts`.
8. **Seed mock data** in `lib/mock/` — one row per entity, enough to light up every page across every role.
9. **Rewrite `app/layout.tsx`** to mount Navbar + RoleSwitcher, plain B&W body.
10. **Placeholder `app/page.tsx`** — a minimal landing stub so `/` doesn't 404 (Page 1 of Tier 1 replaces it properly).

This setup counts as "Page 0" in the build loop — I'll scope it, ask questions if needed, build, and get your review before touching Page 1.

---

## 6. Orchestrator integration

Per the pattern in [.claude/agents/orchestrator-agent.md](../.claude/agents/orchestrator-agent.md):

- **Context brief is built once** at the start of each tier (stack, folder map, mock-data shape, role model, primitive inventory, styling rules). Every sub-agent call in that tier gets the same brief as a single-shot.
- **Between tiers** I run the orchestrator with `code-quality-agent` + `accessibility-agent` + `testing-agent` on the tier's delta — parallel dispatch, one unified report, fixes applied before the next tier starts.
- **Mid-tier** I only dispatch a specialist if a concrete question needs it (e.g., a11y review on a complex form). I don't spray-fire agents.

---

## 7. Production guardrails (every page must satisfy)

- Strict TypeScript compiles with zero warnings (`pnpm tsc --noEmit`).
- ESLint passes on changed files.
- No client component without a reason documented in a one-line comment.
- No inline event handlers larger than 3 lines — extract to a named function.
- No `useEffect` fetching data. Mock is sync; real data will be React Query later.
- Forms use raw React state (`useState` + controlled inputs + a plain submit handler). `react-hook-form`, `zod`, and `@hookform/resolvers` are being **removed** from `package.json` during Page 0 setup. If forms grow painful later we add a lightweight layer back — but not during the barebones pass.
- Every destructive action goes through `<ConfirmDialog>`.
- Every page has a semantic `<h1>` and a `<main>` landmark.
- Every interactive element is keyboard-reachable and visible on focus (1px black outline).
- No page ships without every button/link actually rendering — stubs are fine, invisible features are not.

---

## 8. Decisions locked in

1. **Legacy UI:** deleted outright on this branch. `main` on GitHub is the backup.
2. **Forms:** raw React state. `react-hook-form`, `@hookform/resolvers`, and `zod` are pruned from `package.json` during Page 0.
3. **Id format:** `proj_01`, `grant_01`, `app_01`, `org_avalanche`, `user_01`, `review_01`, etc.

Next step: Page 0 scope → questions → build → review.
