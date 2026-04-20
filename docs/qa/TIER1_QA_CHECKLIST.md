# Tier 1 — Manual QA Checklist

> **Phase:** Tier 1 (23 / 23 pages shipped) · **Status:** scoped (locked to Tier 1 — Tier 2 gets its own checklist)
>
> **Prerequisites** (what you need shipped to run this):
> - Every Tier 1 page — see [../planning/PAGES.md](../planning/PAGES.md) for the list
> - Mock data seeded in `lib/mock/` (projects, grants, applications, competitions, reviews)
>
> **Out of scope** (pointers, not content):
> - Tier 2+ features (edit pages, team/files management, public project detail page, grant dashboard, reviewers assignment UI) → see "Known gaps" at the bottom of this file + [../planning/PAGES.md](../planning/PAGES.md)
> - Real API persistence (every mutation is a mock toast) → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
> - Feature-level design rationale → [../specs/](../specs/) for PROFILE_SYSTEM + HACKATHONS_CHALLENGES
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 1 shipped log (cross-reference commit → page)
>
> Walk through this before declaring Tier 1 done. Run `pnpm dev` and hit each bullet in a browser. The **role switcher** is the dev widget in the top-right corner — it persists across reloads via `localStorage`.

Mock users behind each role (from [lib/mock/roleBindings.ts](../../lib/mock/roleBindings.ts)):

| Role | User | Notes |
|---|---|---|
| Visitor | — | Logged-out |
| Applicant | Alice Applicant (`user_applicant`) | Owns proj_01…proj_06, on team_sh_01 + team_zk_01 |
| Admin | Paul PlatformAdmin (`user_admin`) | Platform admin, sees everything |
| Org | Oscar Owner (`user_owner`) | OWNER of org_avalanche, WHITELISTED on org_subnet |

---

## Automated (already green)

- [x] `pnpm typecheck` — no errors
- [x] `pnpm lint` — 0 warnings
- [x] `pnpm build` — 25 routes compiled, 14 static / 11 dynamic

---

## Cross-cutting

- [x] Role switcher (top-right) flips between Visitor / Applicant / Admin / Org without page reload
- [x] Selected role persists across hard refresh
- [x] Navbar nav items change with role (applicant sees My Projects / My Applications; admin sees Admin; org sees Dashboard)
- [x] Profile button + name badge in navbar link to `/u/[handle]` for all authenticated roles
- [ ] Reviews link in navbar: **only shows when the current user has ≥1 reviewer assignment.** As Applicant (Alice, 0 assignments) → Reviews link is **absent**. As Admin (Paul, 0 assignments) → Reviews link is **absent**. As Org (Oscar, 2 assignments on app_01 + app_04) → Reviews link is **visible**. As Visitor → absent.
- [x] Hackathons + Challenges appear in navbar for everyone
- [x] MockApiBadge renders on every page it's wired on — count the dashed-border boxes
- [ ] Toasts (sonner) appear top-right and auto-dismiss
- [ ] Every confirm dialog dismissible via backdrop click + Escape key

---

## Page 1 — `/login`

- [x] As Visitor landing directly on `/login` (no referrer, typed URL): page loads, no returnTo hint shown. Click "Continue with BuilderHub" → toast + push to `/projects` (default applicant landing).
- [ ] **Click Log in from any public page** (e.g. Visitor on `/hackathons`, `/showcase`, `/discover`, `/`): Click Log in in the navbar → lands on `/login` (no returnTo in URL since nothing gated). Click Continue with BuilderHub → **lands back on the page they came from** (via `document.referrer`), not `/projects`. Works for `/hackathons`, `/showcase`, `/discover`, `/challenges`, `/`, `/u/alice`, etc.
- [ ] **Return-to flow** (protected page gate): As Visitor, visit a protected page (e.g. `/projects`, `/applications`, `/dashboard/avalanche-foundation`). You're redirected to `/login?returnTo=<thatPath>`. The card shows a "You'll be taken back to X after signing in." hint. Click Continue with BuilderHub → lands on the original page, not `/projects`. returnTo wins over referrer.
- [ ] Return-to with query string preserved: visit `/projects/proj_01/apply?grant=grant_defi` as Visitor → bounces to `/login?returnTo=%2Fprojects%2Fproj_01%2Fapply%3Fgrant%3Dgrant_defi`. Sign in → lands back on the apply form with the grant locked in.
- [ ] Open-redirect safety: manually visit `/login?returnTo=https://evil.example/foo` → hint doesn't show, sign-in lands on default `/projects`. Same for `/login?returnTo=//evil.example` and `/login?returnTo=/\evil`.
- [ ] As Applicant: hitting `/login` while already signed in — if a returnTo is set, go there; otherwise bounce back to the referring page (the one you clicked Log in from); if no referrer, fall back to `/`. External / cross-origin referrers are ignored.
- [ ] "First time here? Complete your profile" footer link → `/onboarding`.
- [x] "FAQ" footer link → `/faq` (will 404 — Tier 3, expected).

## Page 2 — `/` (landing)

- [ ] Loads for everyone — HERO + "How it works" + OPEN GRANTS
- [ ] Grant cards link to `/discover/grants/[grantId]` (not the old stale `/discover/[slug]`)
- [ ] Clicking a grant card → lands on a live grant detail page

## Page 3 — `/onboarding`

- [ ] As Visitor → redirects to `/login?returnTo=%2Fonboarding`
- [ ] As Admin → redirects to `/admin`
- [ ] As Org → redirects to `/`
- [ ] As Applicant (Alice) — **profile already complete** (default state):
  - [ ] **No yellow banner** at the top
  - [ ] Form pre-filled from her existing record (name, handle `alice`, bio, country, telegram)
  - [ ] Typing a new Display name → Handle auto-updates
  - [ ] Clicking the Handle field → it stops auto-updating, stays manual
  - [ ] Bio under 10 chars → Submit disabled
  - [ ] Click an interest pill → inverts; click again to unselect
  - [ ] "Skip for now" → routes to `/projects`, no toast
  - [ ] "Save and continue" → toast + routes to `/projects`
- [ ] As Applicant (Alice) — **profile incomplete**: flip the "Simulate new user" checkbox in the dev Role Switcher. Then:
  - [ ] Visit `/onboarding` directly → **yellow banner** at top: "Complete your profile to continue. Name, handle, and bio are required." Bio is empty (simulated).
  - [ ] "Skip for now" button is replaced with the hint "Profile required — skip is disabled until you finish."
  - [ ] Fill bio ≥ 10 chars → Submit becomes enabled → toast + routes to `/projects`
  - [ ] **Gate flow**: with Simulate new user still on, visit `/projects/proj_01/apply?grant=grant_defi` → server redirects you to `/onboarding?reason=apply&next=%2Fprojects%2Fproj_01%2Fapply%3Fgrant%3Dgrant_defi`.
    - [ ] Yellow banner reads: "Complete your profile to apply for a grant. Orgs reviewing your application see what you fill in here."
    - [ ] Submit button label changes to **"Save and continue to apply"**.
    - [ ] Fill + submit → toast + lands on `/projects/proj_01/apply?grant=grant_defi` with the grant pre-locked.
  - [ ] Turn off Simulate new user → `/projects/proj_01/apply?grant=grant_defi` loads directly (no gate).

## Page 4 — `/projects` (My Projects)

- [ ] As Visitor: redirects to `/login`
- [ ] As Admin: redirects to `/admin`
- [ ] As Org: redirects to `/dashboard/[slug]`
- [ ] As Applicant:
  - [ ] Shows 5 projects (proj_01 AvaSwap, proj_02 GlacierNFT, proj_03 SnowBridge PRIVATE, proj_04 CrystalLend PUBLIC, proj_06 IceType)
  - [ ] proj_05 Permafrost Indexer is **hidden** (archived)
  - [ ] Visibility pills: `CUSTOM · 1 hidden` for proj_01, `CUSTOM · 4 hidden` for proj_02, `PRIVATE` (inverted) for proj_03, `PUBLIC` for proj_04, `CUSTOM · 1 hidden` for proj_06
  - [ ] "Show archived" toggle → proj_05 appears with `ARCHIVED` pill + Unarchive button
  - [ ] "Show archived" again → archived hide, non-archived return
  - [ ] Archive button → confirm dialog → toast
  - [ ] Search "avaswap" → only proj_01 shows
  - [ ] Status pills filter by headline status (All / No apps / Draft / etc.)

## Page 5 — `/projects/new`

- [ ] As Applicant:
  - [ ] Visibility radio defaults to CUSTOM, `hiddenSections` prefilled with `["applications"]`
  - [ ] Click PUBLIC → Hide toggles beside fields disappear
  - [ ] Click PRIVATE → Hide toggles disappear, hint text changes
  - [ ] Click CUSTOM → Hide toggles reappear beside Problem statement, Website URL, Project URL, Smart contracts, Other links
  - [ ] Toggle "Hide" beside Problem statement → button flips to "Hidden"
  - [ ] Fill all required fields + logo/banner/pictures → Submit → toast mentions visibility + hidden count → redirects to `/projects/proj_new` (404, expected until real API)
- [ ] Direct URL `/projects/new?returnTo=/discover/grants/grant_minigrant` → Submit → bounces to grant detail (not `/projects/proj_new`)
- [ ] Cancel → `/projects`

## Page 6 — `/projects/[id]` (project detail)

- [ ] As Applicant on own `/projects/proj_01`:
  - [ ] Header shows name + visibility pill `CUSTOM · 1 hidden` + DeFi/Infra category pills
  - [ ] Applications card "Apply to grant" button → `/discover` (not `/projects/.../apply`)
  - [ ] Applications card lists 2 apps (DeFi IN_REVIEW, Infra ACCEPTED inverted)
  - [ ] Team / Files / Updates / Applications cards each show a small toggle in their header (`Public` or `Hidden`)
  - [ ] "Preview public view" button → `/projects/proj_01?preview=1`
- [ ] `/projects/proj_01?preview=1`:
  - [ ] Black banner: "Previewing as the public · 1 section hidden"
  - [ ] ProjectActions row disappears
  - [ ] Applications card **absent** (hidden per CUSTOM rules)
  - [ ] Team / Files / Updates still visible
  - [ ] "Exit preview" → normal view
- [ ] `/projects/proj_03?preview=1` (PRIVATE) → banner "project is private — non-owners get a 404", most sections hidden
- [ ] `/projects/proj_05?preview=1` → banner "project is archived — non-owners get a 404"
- [ ] Archive action → confirm → toast → `/projects`
- [ ] Non-owner applicant `/projects/proj_01` → redirects to `/showcase/proj_01`
- [ ] `/projects/proj_bogus` → 404

## Page 6.5 — `/showcase/[id]` (public project detail)

- [ ] As Visitor `/showcase/proj_04` (PUBLIC): full page including grant history card
- [ ] As Visitor `/showcase/proj_01` (CUSTOM, applications hidden): overview + team + files + updates but **no grant history card**
- [ ] As Visitor `/showcase/proj_02` (CUSTOM, many hidden): overview + updates only; no team / files / contracts / grant history
- [ ] As Visitor `/showcase/proj_03` (PRIVATE) → **404**
- [ ] As Visitor `/showcase/proj_05` (ARCHIVED) → **404**
- [ ] As Org (Oscar, Avalanche) `/showcase/proj_01`: black privileged-view banner "org Avalanche Foundation has an application from this project", grant history **visible** (override)
- [ ] As Admin `/showcase/proj_03`: black banner "platform admin", full page visible even though PRIVATE
- [ ] As Applicant (Alice, owner) `/showcase/proj_01` → redirects to `/projects/proj_01`
- [ ] `/showcase` listing:
  - [ ] Shows PUBLIC non-archived projects only
  - [ ] Featured section shows proj_04 CrystalLend
  - [ ] Filter bar search + categories + funding-status all work
  - [ ] proj_01 card shows **no** "Accepted for funding" badge even though proj_01 has 1 accepted grant (apps hidden)

## Page 7 — `/discover`

- [ ] Loads for everyone
- [ ] Flagship hero: Team1 Minigrant
- [ ] Spotlight grid: DeFi Builders + Infra & Tooling
- [ ] "All grants" list shows 7 grants (not the DRAFT one)
- [ ] Grant hero CTAs link to `/discover/grants/${grant.id}` (not `/discover/${slug}`)

## Page 8 — `/discover/grants/[grantId]`

- [ ] As Visitor `/discover/grants/grant_minigrant`: hero, description, requirements, 2 questions previewed, ApplyCTA says "Sign in to apply"
- [ ] As Visitor `/discover/grants/grant_draft` → **404** (isPublic=false, DRAFT)
- [ ] As Admin → redirected to `/admin`
- [ ] As Org (Oscar) → redirected to `/dashboard/avalanche-foundation`
- [ ] As Applicant (Alice, 5+ projects):
  - [ ] ApplyCTA says "You have N projects. Pick one to apply with, or create a new one."
  - [ ] "Pick a project" → modal shows projects **plus** a `+ Create a new project` row at the bottom linking to `/projects/new?returnTo=/discover/grants/grant_minigrant`
- [ ] Manually edit a grant's status to CLOSED → ApplyCTA shows the closed message

## Page 9 — `/projects/[id]/apply`

- [ ] As Applicant `/projects/proj_01/apply` (no `?grant=`) → **redirects to `/discover`** (grant-first rule)
- [ ] As Applicant `/projects/proj_01/apply?grant=grant_defi`:
  - [ ] Grant header is locked (no dropdown)
  - [ ] Cover note + funding + 3 DeFi questions rendered
  - [ ] Cancel → `/discover/grants/grant_defi` (not the project)
  - [ ] Submit with <10 char cover note → disabled
  - [ ] Submit with valid form → toast + redirect to `/projects/proj_01`
- [ ] `/projects/proj_01/apply?grant=grant_bogus` → `/discover`
- [ ] `/projects/proj_01/apply?grant=grant_draft` → `/discover`

## Page 10 — `/applications`

- [ ] As Applicant (Alice): 3 rows — app_01 DeFi IN_REVIEW / app_02 NFT SUBMITTED / app_04 Infra ACCEPTED (inverted)
- [ ] Status pill filters work (All / Draft / Submitted / In review / Accepted / Rejected / Withdrawn)
- [ ] Search "defi" → 1 row
- [ ] Sort by funding desc → DeFi / NFT / Infra
- [ ] Grant link in row → `/discover/grants/[grantId]`
- [ ] Project link in row → `/projects/[id]`
- [ ] "View" button → `/applications/[appId]`
- [ ] "Continue" button on a draft row → `/applications/[appId]`

## Page 11 — `/applications/[id]`

- [ ] `/applications/app_01` (IN_REVIEW):
  - [ ] Header: grant title + status pill + "View grant" + "Withdraw" buttons
  - [ ] Summary card: Project link, Grant link, Funding $50,000, dates
  - [ ] Cover note: "We're requesting funding..."
  - [ ] Answers card walks the 3 DeFi questions
  - [ ] Timeline: Draft → Submitted → In review (Current)
  - [ ] Withdraw → confirm dialog → toast → `/applications`
- [ ] `/applications/app_04` (ACCEPTED): status badge inverted, decided date shown, only "View grant" button (no withdraw)
- [ ] `/applications/bogus` → 404
- [ ] Visitor → `/login`, Admin → `/admin`, Org → dashboard

## Page 12 — `/u/[handle]` (applicant profile)

- [ ] As Visitor `/u/alice`: thin view — name, bio, public projects only (just proj_04). No grant history. No account card.
- [ ] As Alice `/u/alice`:
  - [ ] YOU pill
  - [ ] All projects with visibility pills
  - [ ] Grant history table with 3 rows
  - [ ] Competition history shows Summer Hack + ZK Challenge
  - [ ] Account card with email / wallet / etc
  - [ ] "Edit profile" link
- [ ] As Admin `/u/alice`: ADMIN pill, full access
- [ ] As Org (Oscar) `/u/alice`:
  - [ ] `ORG · AVALANCHE FOUNDATION` pill
  - [ ] Projects card titled "Projects applied to Avalanche Foundation", shows only proj_01
  - [ ] Grant history scoped to Avalanche's grants only
  - [ ] Competition history scoped to Avalanche's competitions
- [ ] `/u/me` as Alice → redirects to `/u/alice`
- [ ] `/u/bogus` → 404

## Pages 13 + 15 — `/hackathons`, `/challenges` (listings)

- [ ] `/hackathons`: 2 cards — Summer Hack (OPEN, 3 teams, $100k) and Subnet Jam (UPCOMING, 0 teams, $30k)
- [ ] `/challenges`: 2 cards — Smart Contract Security Challenge (OPEN, rolling, $250k) and ZK Infrastructure Challenge (OPEN, ~45 days left, $50k)

## Pages 14 + 16 — `/hackathons/[id]`, `/challenges/[id]` (details)

- [ ] `/hackathons/comp_summer_hack`:
  - [ ] Black hero: partner Ava Labs, status, title, description, pool, timing, team size, team count
  - [ ] Rules card
  - [ ] **Timeline card** (4 dated rows — hackathons only)
  - [ ] Main prizes card: 4 ranked prizes, exact amounts
  - [ ] Tracks card: 5 tracks
  - [ ] Teams panel: 3 team cards
    - [ ] AvaSwap Core visible (isPublic=true): shows roster + DeFi+Infra tracks + submitted
    - [ ] Glacier Builders locked (members private)
    - [ ] Solo Shipper locked
  - [ ] Participate panel: if you're Alice, Your Team block; otherwise Register/Create buttons
- [ ] `/challenges/comp_security_challenge`:
  - [ ] **No timeline card** (challenges don't render it)
  - [ ] **No main prizes card** (none seeded)
  - [ ] 3 severity tracks
  - [ ] 0 teams → empty state
  - [ ] As Alice: Register solo / Create team buttons
- [ ] Format mismatch `/challenges/comp_summer_hack` → 404
- [ ] `/hackathons/comp_bogus` → 404

## Team flow (on any competition detail page)

- [ ] As Visitor → "Sign in to participate" → `/login`
- [ ] As Admin/Org (non-applicant) → role-switcher hint
- [ ] As Applicant not on a team (e.g., Alice on Subnet Jam):
  - [ ] "Register solo" → toast
  - [ ] "Create a team" → modal with name input → toast on confirm
- [ ] As Alice on Summer Hack (she's LEAD of AvaSwap Core):
  - [ ] Your Team block: "You are the LEAD · 3 total · Public team"
  - [ ] Invite member → modal → type random email → success toast
  - [ ] Type `eddie.editor@avalanche.org` → inline red error + BLOCKED toast (uniqueness demo)
  - [ ] Submit project → modal with project picker + "+ Create a new project" row + track multi-select
  - [ ] Pick 2 tracks → Submit → toast
  - [ ] "+ Create new project" row → `/projects/new?returnTo=/hackathons/comp_summer_hack` → submit → bounces back
  - [ ] Withdraw submission → toast
  - [ ] Leave team → confirm dialog with lead-specific warning → toast

## Pages 17–19 — org dashboard, grants list, new grant

- [ ] As Visitor `/dashboard/avalanche-foundation` → `/login`
- [ ] As Applicant → 404 (not a member)
- [ ] As Admin → admitted (platform admin bypass)
- [ ] As Org (Oscar):
  - [ ] Sidebar on left, Overview active, Grants + New grant nested
  - [ ] 4 stat cards (Open grants / Applications received / Funding requested / Competitions)
  - [ ] Grants preview card lists Avalanche grants
  - [ ] Recent activity lists 3 app rows (drafts excluded)
  - [ ] "Create grant" header button → `/dashboard/avalanche-foundation/grants/new`
- [ ] `/dashboard/avalanche-foundation/grants`:
  - [ ] Table of 5 Avalanche grants
  - [ ] Filter pills (All / Open / Draft / Closed / Archived); Draft → DAO Infrastructure only
  - [ ] Search works
  - [ ] "Open" row button → applications list
  - [ ] Archive button → confirm → toast
- [ ] `/dashboard/avalanche-foundation/grants/new`:
  - [ ] Title → Slug auto-fills
  - [ ] Click slug → stops auto-updating
  - [ ] Publish status DRAFT / OPEN toggle → hint text changes
  - [ ] Public + Flagship checkboxes
  - [ ] "+ Add question" → new question block
  - [ ] Remove disabled when only 1 question remains
  - [ ] Pick SELECT type → Options input appears; empty → Submit disabled
  - [ ] Submit button label: "Save draft" vs "Publish grant"
  - [ ] Submit → toast + `/dashboard/avalanche-foundation/grants`
- [ ] `/dashboard/subnet-labs` as Oscar → works (WHITELISTED on org_subnet)
- [ ] `/dashboard/not-an-org` → 404

## Pages 20 + 21 — org applications list + review

- [ ] `/dashboard/avalanche-foundation/grants/grant_defi/applications`:
  - [ ] 1 row (app_01 IN_REVIEW) — app_03 is DRAFT and must NOT appear
  - [ ] Filter by ACCEPTED → no rows
  - [ ] Click Review → app detail
- [ ] `/dashboard/avalanche-foundation/grants/grant_defi/applications/app_01`:
  - [ ] Left: cover note + 3 DeFi answers + Ruth's APPROVE review
  - [ ] Right: Summary, Assigned reviewers (Ruth submitted, Gina pending), DecisionPanel
  - [ ] Feedback textarea
  - [ ] "Accept application" → confirm → toast
  - [ ] "Request changes" → needs ≥10 chars → toast
  - [ ] "Reject application" → destructive confirm → toast
- [ ] `/dashboard/avalanche-foundation/grants/grant_infra/applications/app_04` (ACCEPTED): DecisionPanel collapses to "already decided" hint
- [ ] `/dashboard/avalanche-foundation/grants/grant_defi/applications/app_03` (DRAFT) → 404
- [ ] Cross-org: `/dashboard/avalanche-foundation/grants/grant_nft/applications` → 404 (grant_nft is run by org_subnet)

## Pages 22 + 23 — reviewer queue + review form

- [ ] As Org (Oscar) `/reviews`:
  - [ ] **Pending · 1** — AvaSwap DEX / DeFi Builders / Due 4/20 / "Start review"
  - [ ] **Completed · 1** — Permafrost Indexer / Infra & Tooling / Due 2/25 / "Edit"
- [ ] Click "Start review" → `/reviews/app_01`:
  - [ ] Left: Alice's cover note + 3 DeFi answers
  - [ ] Right: Summary + ReviewForm (Approve default)
  - [ ] Type <10 chars feedback → Submit disabled
  - [ ] 1-10 score accepted
  - [ ] Submit → toast + `/reviews`
- [ ] Click "Edit" on Permafrost → `/reviews/app_04`:
  - [ ] Form pre-fills with Oscar's review (Approve, score 9, "Agree with Ruth…")
  - [ ] Card title "Your review", button "Update review"
- [ ] `/reviews/app_02` as Oscar → 404 (not assigned)
- [ ] As Admin (Paul) `/reviews/app_01` → full access (bypass)
- [ ] `/reviews/app_03` (DRAFT) → 404
- [ ] As Visitor `/reviews` → `/login`

---

## Cross-page flows (end-to-end)

- [ ] **Applicant apply flow**: Discover → click a grant → view detail → "Pick a project" → pick or create → apply form → submit → `/applications` → open app detail → withdraw → back to `/applications`
- [ ] **Applicant competition flow**: Hackathons → Summer Hack → (as Alice) → Submit project → pick tracks → team card shows SUBMITTED
- [ ] **Org review flow**: As Org → `/dashboard/avalanche-foundation` → click a grant's app count → app list → Review → make decision → status updates
- [ ] **Reviewer flow**: As Org → `/reviews` → pick Pending row → submit review → appears in Completed
- [ ] **Cross-org privacy**: As Oscar `/u/alice` — only Avalanche rows in grant history + competition history, Subnet Labs rows must NOT leak
- [ ] **Grant-first apply rule**: `/projects/proj_01` → "Apply to grant" in Applications card → lands on `/discover` (not the old apply form)

---

## Edge cases

- [ ] Every 404 path above returns the shared [app/not-found.tsx](../../app/not-found.tsx)
- [ ] Empty states render when data is absent (zero projects, apps, teams, reviews, grants)
- [ ] Role switch while on a role-gated page re-renders the guard on next nav (e.g., Org → Applicant on `/dashboard/...` → next navigation 404s)
- [ ] Keyboard-only: Escape dismisses modals; Tab cycles form fields in order

## Accessibility spot-checks

- [ ] Modals have accessible title + Escape closes
- [ ] Every form input has a `<label>` (or custom label row)
- [ ] Required fields marked with visible `*`
- [ ] Toggle pills have `aria-pressed`
- [ ] Every link + button has text or `aria-label`

---

## Known gaps (Tier 2 / later — not bugs)

- `/projects/[id]/edit`, `/projects/[id]/team`, `/projects/[id]/files`, `/projects/[id]/updates` — Tier 2
- Grant edit / dashboard / questions management / reviewers assignment / settings / funding disbursements — Tier 2
- `/settings/profile` (Edit profile link dead-ends) — Tier 2
- `/notifications`, `/invitations`, `/invite/[token]` — Tier 2
- Org-side hackathon/challenge create + manage pages — Tier 2
- `/admin`, `/admin/users`, `/admin/organizations`, `/admin/audit-log` — Tier 4
- `/organizations` (my orgs list) — Tier 2
- **Real persistence** — every mutation is a toast. Creating a project + navigating back won't show it.
- **Create-new-project from competition submit** bounces back but the new project isn't pre-selected in the submit modal (mock data is static).
