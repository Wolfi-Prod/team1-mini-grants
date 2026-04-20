# Tier 2 — Manual QA Checklist

> **Phase:** Tier 2 (in progress — see [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) for live status) · **Status:** scoped (locked to Tier 2 — Tier 3 gets its own checklist)
>
> **Prerequisites** (what you need shipped to run this):
> - Tier 1 complete — see [TIER1_QA_CHECKLIST.md](TIER1_QA_CHECKLIST.md)
> - The Tier 2 page being tested — see [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) Tier 2 table for status
>
> **Out of scope** (pointers, not content):
> - Tier 1 regressions — keep running the Tier 1 checklist; this doc only covers new Tier 2 surfaces
> - Tier 3+ features (settings, notifications, updates, versions, disbursements, admin) → see "Known gaps" at the bottom
> - Real API persistence — every mutation is still a mock toast → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 2 shipped log (cross-reference commit → page)
>
> Walk through this as each Tier 2 page ships. Run `pnpm dev` and hit each bullet in a browser. Sections land incrementally — if a page isn't in the Shipped log yet, its section reads _pending_.

Mock users behind each role (unchanged from Tier 1 — from [../../lib/mock/roleBindings.ts](../../lib/mock/roleBindings.ts)):

| Role | User | Notes |
|---|---|---|
| Visitor | — | Logged-out |
| Applicant | Alice Applicant (`user_applicant`) | Owns proj_01…proj_06, on team_sh_01 + team_zk_01 |
| Admin | Paul PlatformAdmin (`user_admin`) | Platform admin, sees everything |
| Org | Oscar Owner (`user_owner`) | OWNER of org_avalanche, WHITELISTED on org_subnet |

---

## Automated (must stay green)

- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm lint` — 0 warnings
- [ ] `pnpm build` — all routes compile

---

## Page 24 — `/projects/[id]/edit` (Edit Project)

Owner-only edit of the project record. Mirrors `/projects/new` but pre-filled, with existing assets shown as previews and optional replacement. Mock note — Submit is a toast + redirect; mock data is not mutated, so the detail page after submit shows the **pre-edit** values. That's expected until the real API lands.

### Role gating

- [x] As Visitor `/projects/proj_01/edit` → redirects to `/login?returnTo=%2Fprojects%2Fproj_01%2Fedit`
- [x] As Admin → `/admin`
- [x] As Org (Oscar) → `/dashboard/avalanche-foundation`
- [x] As Applicant (Alice) on her own `proj_01`/`proj_02`/`proj_04`/`proj_06` → page loads
- [x] As Applicant on `/projects/proj_bogus/edit` → 404
- [ ] As Applicant on a project she doesn't own (manually set e.g. `/projects/proj_x/edit` where `proj_x.userId !== user_applicant` — none seeded today; retest once more owners are added) → redirects to `/showcase/[id]`

### Pre-fill

- [x] Open `/projects/proj_01/edit` — form shows "Edit AvaSwap DEX" in the header
- [x] Breadcrumb "← Back to project" links to `/projects/proj_01`
- [x] MockApiBadge shows `POST /api/upload` + `PATCH /api/projects/:id`
- [x] Name input pre-filled with "AvaSwap DEX"
- [x] Description pre-filled from mock
- [x] Problem statement pre-filled (where non-null); empty textarea if null
- [x] Visibility radio shows CUSTOM (active)
- [ ] Hidden count reads "1 section hidden"
- [ ] Hide toggles beside Problem statement / Website / Project URL / Smart contracts / Other links / Team / Files / Updates / Applications — only the Applications one reads "Hidden"
- [ ] Categories pills show DeFi + Infra as active
- [ ] Website URL pre-filled with `https://avaswap.example`
- [ ] Project URL pre-filled with `https://app.avaswap.example`
- [ ] Other links list shows `https://github.com/avaswap`
- [ ] Contract addresses list empty (proj_01 has none)

### Archived banner

- [ ] `/projects/proj_05/edit` (Permafrost Indexer, archived): above the form, an ARCHIVED card with a warning message + `ARCHIVED` badge
- [ ] Non-archived projects (proj_01, _02, _03, _04, _06) **never** show the archived banner

### Assets

- [x] Seeded projects don't have logo/banner/pictures in mock, so those slots render as the dashed-border upload buttons
- [x] Click "Upload logo" → file picker opens; pick a PNG → preview renders, filename shown, Replace + Remove buttons appear
- [x] Click Replace → file picker re-opens; picking a different file replaces the preview
- [x] Click Remove → preview clears, dashed button returns
- [x] Banner behaves the same
- [x] Pictures: upload multi-select → all render in the grid; X button removes one at a time
- [x] Page refresh (no save) → previews gone (mock, in-memory)
- [x] Unmounting the page after picking new files doesn't leak (use DevTools → Memory → nothing abnormal)

### Visibility edit

- [ ] Flip PUBLIC → Hide toggles disappear, hint text changes, hidden-count line gone
- [ ] Flip PRIVATE → Hide toggles disappear, hint text changes to "Only you (and orgs you apply to) can see this project."
- [ ] Flip back to CUSTOM → Hide toggles re-appear, preserving prior selection (`applications` still hidden)
- [ ] Toggle a field's Hide pill → button flips to Hidden, hidden count increments
- [ ] Toggle again → unhidden, count decrements

### Categories + links + contracts

- [ ] Click a category pill → toggles active/inactive
- [ ] Deselect all categories → Save disabled (form invalid)
- [ ] Clear the Website URL → Save disabled
- [ ] Clear the Project URL → Save disabled
- [ ] Add a new link `https://docs.example` → appears in list + input clears
- [ ] Try to add the same link twice → toast "Link already added"; list unchanged
- [ ] Remove a link → drops from list
- [ ] Add a contract address → same behavior (+ toast on duplicate)

### Submit + cancel

- [ ] Click Cancel → `/projects/proj_01` (no prompt, no toast)
- [ ] Click Save changes with valid form → toast `Saved "AvaSwap DEX" (mock). Visibility: CUSTOM · 1 hidden...` + redirect to `/projects/proj_01`
- [ ] Submit while disabled (required field empty) → nothing happens
- [ ] Pick a new logo + banner + 2 pictures → Save → toast mentions "logo updated · banner updated · 2 new pictures"
- [ ] After submit, the redirected `/projects/proj_01` still shows the **pre-edit** values (mock data is static — expected)

### A11y spot-checks

- [ ] Every form input has a `<label>` or `FieldLabelRow` label
- [ ] Required inputs marked with `*`
- [ ] Hide toggles have `aria-pressed`
- [ ] Visibility radios have `aria-pressed`
- [ ] Remove buttons on links / contracts / pictures have `aria-label`
- [ ] Tab order walks through logo → banner → visibility → name → description → problem → categories → pictures → website → project URL → contracts → links → cancel → save

---

## Page 25 — `/projects/[id]/team` (Manage Team)

Owner-only roster. Add / edit / remove team members. Changes stay in local React state (mock), so adds appear in the list immediately but vanish on refresh — that's expected until the real API lands.

### Role gating

- [ ] As Visitor `/projects/proj_01/team` → `/login?returnTo=%2Fprojects%2Fproj_01%2Fteam`
- [ ] As Admin → `/admin`
- [ ] As Org (Oscar) → `/dashboard/avalanche-foundation`
- [ ] As Applicant (Alice) on her own projects → page loads
- [ ] `/projects/proj_bogus/team` → 404

### Pre-fill

- [ ] `/projects/proj_01/team`: "Manage team — AvaSwap DEX" header; counter reads "Team · 2 members"
- [ ] Rows: Alice Applicant (Founder) + Bob Builder (Smart Contract Engineer)
- [ ] Alice row shows `GH: alice · X: @alice`, no LI line
- [ ] Bob row shows `GH: bob · LI: bob-builder`, no X line
- [ ] `/projects/proj_02/team`: 1 row (Alice, Product)
- [ ] `/projects/proj_03/team`: empty state with a primary "Add member" CTA
- [ ] Breadcrumb "← Back to project" → `/projects/proj_01`
- [ ] Header right-side has an "Add member" primary button
- [ ] MockApiBadge lists GET / POST / PATCH / DELETE on `/api/projects/:id/team`

### Add member

- [ ] Click "Add member" → modal opens: title "Add team member", Name + Email required
- [ ] Submit disabled until Name is non-empty AND email matches `x@y.z`
- [ ] Enter invalid email like `not-an-email` → inline red `Enter a valid email`
- [ ] Try to add Alice's email again → toast `alice.applicant@example.com is already on the team`; row not added
- [ ] Add a fresh member (name + new email, role optional) → toast "Added …" + row appears at bottom of list; counter increments
- [ ] Close the modal (X button) or Escape → modal dismisses, draft cleared

### Edit member

- [ ] Click Edit on Bob → modal title "Edit Bob Builder", fields pre-filled (name, email, role = Smart Contract Engineer, github = bob, linkedIn = bob-builder)
- [ ] Change role to "Lead Engineer" → Save changes → toast + row updates in place

### Remove member

- [ ] Click Remove on any row → confirm dialog with member name + email in the copy
- [ ] Cancel → nothing happens
- [ ] Confirm → toast + row disappears + counter decrements
- [ ] Empty state returns when last row removed

### A11y / keyboard

- [ ] Tab order inside the Add modal: Name → Email → Role → GitHub → Twitter → LinkedIn → Cancel → Add member
- [ ] Escape closes the add modal and confirm dialog
- [ ] Every Input has a `<label>`

---

## Page 26 — `/projects/[id]/files` (Manage Files)

Owner-only file-link list (no upload — users paste URLs pointing to Drive / Notion / GitHub / Loom / wherever). Add / edit / remove. Same local-state mock pattern.

### Role gating

- [ ] As Visitor `/projects/proj_01/files` → `/login?returnTo=%2Fprojects%2Fproj_01%2Ffiles`
- [ ] As Admin → `/admin`
- [ ] As Org (Oscar) → `/dashboard/avalanche-foundation`
- [ ] As Applicant (Alice) on her own projects → page loads
- [ ] `/projects/proj_bogus/files` → 404

### Pre-fill

- [ ] `/projects/proj_01/files`: "Manage files — AvaSwap DEX"; counter "Files · 2 attached"
- [ ] Rows: "AvaSwap Pitch Deck" + "AvaSwap Whitepaper"
- [ ] Each row's URL is a clickable link that opens in a new tab
- [ ] Type line reads "Other" (mock seeds use `application/pdf`; the label falls through to the raw string since it isn't in the predefined list)
- [ ] `/projects/proj_02/files`: empty state with a primary "Attach file link" CTA
- [ ] MockApiBadge lists GET / POST / PATCH / DELETE on `/api/projects/:id/files`

### Add file link

- [ ] Click "Attach file link" → modal opens: Name + URL required, Type defaults to "Pitch deck"
- [ ] Enter `not-a-url` in URL → inline red `Enter a full http:// or https:// URL`
- [ ] Submit disabled until both Name + valid URL
- [ ] Try to attach an already-listed URL → toast `That URL is already attached`; row not added
- [ ] Attach a fresh URL + pick Type "Whitepaper" → toast "Attached …" + row appears at the **top** of the list (newest first); counter increments

### Edit file link

- [ ] Click Edit on any row → modal pre-fills Name + URL + Type
- [ ] Change the URL to a new valid URL → Save → toast + row updates in place, moves position if sort logic changes (currently newest-first only on add)

### Remove file link

- [ ] Click Remove → confirm dialog with file name in copy
- [ ] Cancel → nothing happens
- [ ] Confirm → toast + row removed + counter decrements
- [ ] Empty state returns when last row removed

### Cross-page integrity

- [ ] After removing a file via this page and going back to `/projects/proj_01` → Files card still shows the original 2 files (mock data is static — expected until PATCH wires real data)

## Page 27 — `/discover/projects/[id]` (Public Project Detail)

Canonical public project page. Replaces the Tier-1 `/showcase/[id]` route, which now serves a permanent 301/308 redirect. All internal links previously pointing at `/showcase/${id}` have been swept to `/discover/projects/${id}`.

### Redirect from old route

- [ ] Visit `/showcase/proj_04` → redirected permanently to `/discover/projects/proj_04`
- [ ] Any bookmarked `/showcase/proj_0x` URL lands on the new route
- [ ] Dev tools Network tab: the response to `/showcase/proj_04` is a 308 (Next.js `permanentRedirect` uses 308)

### Visibility gating (mirror of Tier-1 showcase QA, now under the new URL)

- [ ] As Visitor `/discover/projects/proj_04` (PUBLIC): full page — overview, team, files, updates, grant history
- [ ] As Visitor `/discover/projects/proj_01` (CUSTOM, applications hidden): overview + team + files + updates but **no grant history card**
- [ ] As Visitor `/discover/projects/proj_02` (CUSTOM, many hidden): overview + updates only; no team / files / contracts / grant history
- [ ] As Visitor `/discover/projects/proj_03` (PRIVATE) → **404**
- [ ] As Visitor `/discover/projects/proj_05` (ARCHIVED) → **404**
- [ ] As Org (Oscar, Avalanche) `/discover/projects/proj_01`: privileged-view banner at top, grant history **visible** (override)
- [ ] As Admin `/discover/projects/proj_03`: privileged banner, full page even though PRIVATE
- [ ] As Applicant (Alice, owner) `/discover/projects/proj_01` → redirects to `/projects/proj_01`

### Internal link audit (should all land on `/discover/projects/...`, not `/showcase/...`)

- [ ] `/showcase` (listing, still alive) row click → lands on `/discover/projects/[id]` directly (no redirect flash)
- [ ] `/u/alice` (as Visitor) project grid links → `/discover/projects/[id]`
- [ ] `/projects/proj_x` as Applicant where `proj_x` isn't Alice's → bounces to `/discover/projects/proj_x` (not `/showcase/*`)
- [ ] Org review page `/dashboard/avalanche-foundation/grants/grant_defi/applications/app_01` → project link in Summary → `/discover/projects/[id]`
- [ ] Reviewer page `/reviews/app_01` → project link in Summary → `/discover/projects/[id]`
- [ ] Competition team card's project link (on hackathon/challenge details) → `/discover/projects/[id]`

### Copy + back-link

- [ ] "← Discover" breadcrumb (replaces the old "← Showcase") links back to `/discover`
- [ ] MockApiBadge lists `/api/discover/projects/:id/*` endpoints (not `/api/showcase/...`)

## Page 28 — `/dashboard/[orgSlug]/grants/[grantId]` (Grant Dashboard)

Org-owner-only grant landing with stats + pipeline + recent apps + Questions / Reviewers summary.

### Role gating (inherited from `/dashboard/[orgSlug]/layout.tsx`)

- [ ] As Visitor → `/login?returnTo=...`
- [ ] As Applicant → 404 (not a member of any org)
- [ ] As Admin (Paul) → admitted (platform admin bypass)
- [ ] As Org (Oscar) on `/dashboard/avalanche-foundation/grants/grant_defi` → admitted
- [ ] Cross-org: `/dashboard/avalanche-foundation/grants/grant_nft` (grant_nft belongs to org_subnet) → 404

### Header

- [ ] Title reads the grant title (e.g. "DeFi Builders")
- [ ] Breadcrumb shows `← Grants · [status badge]` and optional `Private` badge if not public
- [ ] Header actions: `View applications` (secondary) + `Edit grant` (primary)

### Stat cards (4 across)

- [ ] Total applications count matches mock (draft + non-draft)
- [ ] Submitted / in review count excludes drafts + accepted + rejected + withdrawn
- [ ] Accepted count matches applications with `status: ACCEPTED`
- [ ] Funding committed reads as `USD $<sum of accepted funding>` with `of $<pool>` hint line

### Pipeline card

- [ ] Lists all 6 statuses: DRAFT, SUBMITTED, IN REVIEW, ACCEPTED, REJECTED, WITHDRAWN
- [ ] Count beside each matches mock data

### Recent applications card

- [ ] Shows up to 5 non-DRAFT applications sorted newest-first (by submittedAt, falling back to createdAt)
- [ ] Drafts never appear in this card
- [ ] Click a project name → navigates to the org app review page `.../applications/[appId]`
- [ ] Actions row has an "All <n>" button linking to `.../applications`
- [ ] If the grant has zero applications → empty state, no "All" button

### Questions + Reviewers summary cards (bottom row)

- [ ] Questions card reads "N questions configured. M required." (M only if > 0)
- [ ] Questions "Manage" button → `.../questions` (Page 30)
- [ ] Reviewers card reads "N assignments across M reviewers. K pending." (K only if > 0, "pending" = no Review written yet)
- [ ] Reviewers "Manage" button → `.../reviewers` (Page 31)

### Grant summary

- [ ] Deadline reads "Rolling" when null
- [ ] Visibility reads "Public · Flagship" for flagship grants, just "Public" otherwise
- [ ] Funding requested (sum) adds up every application's `fundingRequested`
- [ ] Created date renders as a local date string

## Page 29 — `/dashboard/[orgSlug]/grants/[grantId]/edit` (Edit Grant)

Org-owner-only grant-level edit form. Mirror of `/grants/new` pre-filled. Questions are edited on Page 30, not here.

### Role gating + routing

- [ ] Visitor / Applicant / cross-org → 404 or login (same as Page 28)
- [ ] As Oscar `/dashboard/avalanche-foundation/grants/grant_defi/edit` → form loads
- [ ] Breadcrumb "← Dashboard" → Grant Dashboard (Page 28)

### Pre-fill

- [ ] Title, Description, Requirements all match mock data
- [ ] Slug shown; slugTouched already true (won't auto-update from title edits)
- [ ] Funding pool shows the raw number (or blank for null)
- [ ] Currency dropdown shows current (usually USD)
- [ ] Deadline shows yyyy-mm-dd in the date picker (or blank for rolling)
- [ ] Status dropdown shows current status with the matching option highlighted
- [ ] Public + Flagship checkboxes reflect current values

### Slug behavior

- [ ] Enter an empty slug → red error + Save disabled
- [ ] Enter `Bad Slug!` → red error (only a-z / 0-9 / dashes)
- [ ] Type in title → slug does NOT auto-update (slugTouched is true for the edit form)

### Funding validation

- [ ] Clear the funding pool → Save stays enabled (null is allowed)
- [ ] Enter `-10` → red error, Save disabled

### Status-driven copy

- [ ] Change status to "Archived" → the "Archive grant" destructive button at the bottom is replaced with "Archived · Edit status above to restore" hint
- [ ] Change status back to OPEN / DRAFT / CLOSED → Archive button returns

### Actions

- [ ] Cancel → `/dashboard/[orgSlug]/grants/[grantId]` (Dashboard)
- [ ] Save changes (valid form) → toast + route to Dashboard
- [ ] Archive grant → toast + route to `/dashboard/[orgSlug]/grants` (the grants list)

## Page 30 — `/dashboard/[orgSlug]/grants/[grantId]/questions` (Grant Questions)

Org-owner-only CRUD + reorder for `GrantQuestion`. Local optimistic state; resets on refresh.

### Pre-fill

- [ ] As Oscar `/dashboard/avalanche-foundation/grants/grant_defi/questions` → loads, counter matches the mock questions for grant_defi
- [ ] Each row shows: numbered badge + label + type badge + Required badge (if required) + optional helper text + options preview for SELECT types
- [ ] Breadcrumb "← Dashboard" returns to the grant dashboard
- [ ] MockApiBadge lists GET / POST / PATCH / DELETE / POST-reorder

### Add question

- [ ] "Add question" button opens the modal
- [ ] Label required; Save disabled until non-empty
- [ ] Pick SELECT → Options input appears; empty or only 1 option → inline red `Enter at least 2 options` + Save disabled
- [ ] Pick TEXT / TEXTAREA / URL / NUMBER → Options input hidden
- [ ] Toggle Required off → question saves with `isRequired: false`; row badge disappears
- [ ] Submit → toast + row appears at the **bottom** with sortOrder = old length

### Edit question

- [ ] Click Edit → modal pre-fills label, helper, type, options (comma-joined), required flag
- [ ] Change type from SELECT → TEXT → Options field disappears; existing options value stays in state but is dropped on save
- [ ] Save → row updates in place

### Reorder (up / down chevrons)

- [ ] Up arrow on first row disabled
- [ ] Down arrow on last row disabled
- [ ] Click Down on row 1 → row 1 and row 2 swap; numbered badges re-index to 1 / 2
- [ ] Click Up on row 3 → row 3 moves to position 2

### Remove

- [ ] Remove → destructive confirm with question label in the copy
- [ ] Confirm → row disappears, remaining rows renumber (sortOrder 0..n-1)
- [ ] Cancel → nothing happens

### Empty state

- [ ] Remove every question → empty state with a primary "Add question" CTA

## Page 31 — `/dashboard/[orgSlug]/grants/[grantId]/reviewers` (Reviewers)

Org-owner-only per-application reviewer assignment. Pending / Completed state driven by `isAssignmentComplete`.

### Layout

- [ ] One card per non-draft application in this grant
- [ ] Drafts never appear (even though they have a projectId)
- [ ] Card header has the project name; actions slot has "Assign reviewer"
- [ ] Empty state appears on grants with zero non-draft applications
- [ ] Each card shows the app status badge + applicant name + submitted date

### Pre-fill

- [ ] As Oscar `/dashboard/avalanche-foundation/grants/grant_defi/reviewers` → shows Alice's application app_01 with 3 reviewers (Ruth, Gina, Oscar)
- [ ] Oscar's row on app_01 reads "Pending" (he hasn't written a review); Ruth's reads "Completed" (review exists)
- [ ] `/dashboard/avalanche-foundation/grants/grant_infra/reviewers` → app_04 with Oscar (Completed)

### Assign modal

- [ ] Click "Assign reviewer" → modal opens: reviewer dropdown + optional due date
- [ ] Dropdown excludes the applicant (Alice never assignable to her own projects)
- [ ] Dropdown excludes reviewers already on this application
- [ ] Assign with valid selection → toast + new row appears under that application with Pending badge
- [ ] Assign with no selection → Assign button disabled
- [ ] Set due date → row shows `due <date>` line under the reviewer's email

### Remove

- [ ] Pending row: Remove button enabled → confirm → row disappears
- [ ] Completed row: Remove button **disabled** (title tooltip explains why)
- [ ] Cancel on confirm → nothing happens

### Empty reviewers card

- [ ] If an app has no reviewers → "No reviewers assigned yet. Click above to pick someone." copy appears

## Page 32 — `/organizations` (My Organizations)

Lists orgs the current user belongs to. Platform admins see everything.

### Role gating

- [ ] As Visitor `/organizations` → `/login?returnTo=%2Forganizations`
- [ ] As Applicant (Alice, no org memberships) → page loads with empty state (links to `/invitations`)
- [ ] As Org (Oscar, OWNER of org_avalanche + WHITELISTED of org_subnet) → both orgs listed
- [ ] As Admin (Paul, no memberships, but platform admin) → all non-deleted orgs listed with ADMIN VIEW badge

### Rows

- [ ] Each row shows org name (linked), role badge (OWNER inverted / WHITELISTED default / ADMIN VIEW for admins), description, and a meta line "N members · M grants · K open" (the K open clause only appears when > 0)
- [ ] Row "Open dashboard" primary button → `/dashboard/[orgSlug]`
- [ ] Clicking the org name (underlined link) → also `/dashboard/[orgSlug]`

### Empty state (Alice)

- [ ] Empty state copy mentions orgs are invite-only
- [ ] Empty-state CTA "Check invitations" → `/invitations`

## Page 33 — `/invite/[token]` (Public Invite Accept)

Works WITHOUT login. Shows invite context + state-aware CTA.

### Mock invitations (added in this commit)

- `tok_subnet_member_01` — Alice pending ORG invite to org_subnet (WHITELISTED)
- `tok_infra_reviewer_03` — Alice pending GRANT invite on grant_infra (REVIEWER)
- `tok_past_04` — Alice accepted GRANT invite on grant_defi (VIEWER)
- `tok_expired_05` — Alice expired ORG invite to org_avalanche (WHITELISTED)
- `tok_defi_reviewer_02` — Ruth accepted GRANT invite on grant_defi (REVIEWER)

### Render logic

- [ ] `/invite/tok_subnet_member_01` as Visitor: page loads without auth; shows "Organization invite" title, PENDING badge, expires date, Role = WHITELISTED, Org = Subnet Labs, invited by Oscar Owner
- [ ] `/invite/tok_bogus` → 404
- [ ] `/invite/tok_expired_05` as Visitor: EXPIRED badge; "this invitation has expired" copy; no Accept/Decline buttons
- [ ] `/invite/tok_past_04` as Visitor (accepted): ACCEPTED badge; receipt copy "you already accepted on <date>"; no action buttons
- [ ] `/invite/tok_infra_reviewer_03` as Visitor (grant invite): shows Grant Infra & Tooling · Avalanche Foundation; Role = REVIEWER

### Auth-aware behavior

- [ ] As Visitor on pending invite: "You'll need to sign in… Sign in →" hint with returnTo back to this token page
- [ ] Click Accept as Visitor → routed to `/login?returnTo=%2Finvite%2Ftok_subnet_member_01`
- [ ] As Applicant (Alice) on her own pending invite: Accept button reads "Accept" (not "Sign in to accept"); Decline button present
- [ ] As Applicant (Alice) on someone else's token (Ruth's `tok_defi_reviewer_02`): "You're signed in as alice… but this invite was sent to ruth…" nudge; no action buttons

### Actions

- [ ] Accept → toast "Invitation accepted (mock)" + route to `/dashboard/<orgSlug>` (ORG invite) or `/dashboard/<orgSlug>/grants/<grantId>` (GRANT invite)
- [ ] Decline → confirm dialog; confirm → toast "Invitation declined (mock)" + route to `/`
- [ ] Decline dialog is dismissible via Escape + backdrop

---

## Page 34 — `/invitations` (Invitations Inbox)

Logged-in view of the same invitations, bucketed into Pending + Past.

### Role gating

- [ ] As Visitor → `/login?returnTo=%2Finvitations`
- [ ] As Applicant (Alice) → page loads
- [ ] As Admin / Org → also loads (their own email-scoped invites; inbox is per-email not per-role)

### Buckets + counters

- [ ] As Alice: Pending card reads "Pending · 2" (subnet ORG invite + grant_infra REVIEWER invite)
- [ ] Past card reads "Past · 2" (grant_defi accepted + org_avalanche expired)
- [ ] No mock invites match Oscar or Paul's emails → both sections show empty-state copy
- [ ] Pending empty state: "When someone invites you to an org or a grant, it'll show up here."
- [ ] If Past has zero rows → the Past card is not rendered at all (only the Pending card)

### Row contents

- [ ] Each row shows target name + Org/Grant type badge + state badge (PENDING inverted, ACCEPTED default, EXPIRED outline)
- [ ] Meta line: Role · invited by · state-specific timestamp (expires / accepted / declined / expired)
- [ ] Pending rows have a "Review" primary button → `/invite/<token>`
- [ ] Non-pending rows have a "View" secondary button → `/invite/<token>` (receipt view)

### Cross-page integration

- [ ] From `/organizations` empty state, "Check invitations" → `/invitations`
- [ ] From `/invite/<token>` Accept → destination → back to `/invitations` shows the invite moved into Past with ACCEPTED badge (mock is static — this won't actually happen until real API; test only verifies the link path)

---

## Cross-page flows (end-to-end)

_Will expand as pages ship. Kick-off flow:_

- [ ] **Edit → Detail → Showcase**: Open `/projects/proj_01` → click Edit in the header → change the name (don't save) → Cancel → back on `/projects/proj_01` with original name. (Mock: Save also returns to the same page with pre-edit values.)

---

## Edge cases

- [ ] Every 404 path above returns the shared [app/not-found.tsx](../../app/not-found.tsx)
- [ ] Role switch while on a Tier 2 owner-gated page (e.g. Edit) → next nav re-applies guard (switch to Org → Edit page shell bounces to dashboard on next nav)
- [ ] Keyboard-only: Escape dismisses any modal; Tab cycles form fields in order
- [ ] Direct URL with query string survives login redirect (same pattern as Tier 1)

---

## Known gaps (Tier 3 / later — not bugs)

- `/projects/[id]/updates`, `/projects/[id]/versions` — Tier 3
- `/settings/*` — Tier 3
- `/notifications` — Tier 3
- Grant `/settings` (permissions) + `/applications/[appId]/funding` (disbursements) — Tier 3
- `/admin/*` — Tier 4
- **Real persistence** — every mutation is a toast. Edits don't survive a refresh.
- **Edit form Save doesn't reflect in /projects/[id]** — mock data is static; the detail page will show real updates only after the backend PATCH is wired.
