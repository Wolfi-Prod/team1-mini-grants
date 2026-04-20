# Tier 3 — Manual QA Checklist

> **Phase:** Tier 3 (11 / 11 pages shipped) · **Status:** scoped (locked to Tier 3 — Tier 4 gets its own checklist)
>
> **Prerequisites**:
> - Tier 1 + Tier 2 complete — see [TIER1_QA_CHECKLIST.md](TIER1_QA_CHECKLIST.md) + [TIER2_QA_CHECKLIST.md](TIER2_QA_CHECKLIST.md)
>
> **Out of scope** (pointers, not content):
> - Tier 1 / 2 regressions — keep running those checklists alongside this one
> - Real API persistence — every mutation is a mock toast → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 3 shipped log
>
> Walk through this as each Tier 3 page ships. Sections land incrementally; unshipped pages read _pending_.

Mock users (unchanged from Tier 1 + 2):

| Role | User | Notes |
|---|---|---|
| Visitor | — | Logged-out |
| Applicant | Alice Applicant (`user_applicant`) | |
| Admin | Paul PlatformAdmin (`user_admin`) | |
| Org | Oscar Owner (`user_owner`) | OWNER of org_avalanche, WHITELISTED of org_subnet |

---

## Automated (must stay green)

- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm lint` — 0 warnings
- [ ] `pnpm build` — all routes compile (45 routes)

---

## Seeded mock data reference (per role)

Use this table while testing — saves grep time.

| Role → | Alice (Applicant) | Oscar (Org) | Paul (Admin) |
|---|---|---|---|
| Notifications | 2 (notif_01 IN_REVIEW, notif_02 deadline) | 1 (notif_04 new app) | 0 |
| Org memberships | none | org_avalanche OWNER + org_subnet WHITELISTED | none (platform admin bypass) |
| Pending invitations (to their email) | 2 (inv_01 subnet ORG, inv_03 infra REVIEWER) | 0 | 0 |
| Live applications | 2 (app_01 IN_REVIEW + app_02 SUBMITTED) | n/a | n/a |
| Owned projects | 5 (proj_01/02/04/06 live + proj_03 PRIVATE; proj_05 archived) | n/a | n/a |
| Org memberships seen on /dashboard/avalanche-foundation/members | — | 3 rows (Oscar OWNER, Wendy + Eddie WHITELISTED) | 3 rows (bypass access) |
| Grant permissions on grant_defi (Page 43) | — | 2 rows (Eddie EDITOR, Gina REVIEWER) | same |
| Disbursements on app_04 (Page 44) | read-only (not her app) | 2 (disb_01 COMPLETED $7500, disb_02 PENDING $7500) | same |

---

## Cross-cutting (covers all 11 Tier 3 pages)

### Navbar

- [ ] As any authenticated role, "Settings" link appears in the navbar → opens `/settings/profile`
- [ ] "Notifications" link opens `/notifications`
- [ ] "Organizations" link still works (Tier 2)
- [ ] "Invitations" link still works (Tier 2)
- [ ] As Visitor, none of these four links appear
- [ ] "FAQ" link opens `/faq` for everyone

### SettingsSidebar (mounted on all 3 /settings/* pages)

- [ ] Profile → sidebar has "Profile" highlighted (inverted pill)
- [ ] Account → sidebar "Account" highlighted
- [ ] Notifications → sidebar "Notifications" highlighted
- [ ] Clicking a non-active pill navigates — no full-page reload needed
- [ ] `aria-current="page"` on the active row (devtools inspection)

### Org dashboard sidebar (under `/dashboard/[orgSlug]/...`)

- [ ] Sidebar now has an "Org" group with "Members" + "Settings" links (added in Commit 9)
- [ ] Links highlight when their page is active
- [ ] Non-members still get 404 on these routes even if they try direct URL

### Toasts + modals (inherit from Tier 1 primitives)

- [ ] Every mutation lands a top-right sonner toast, auto-dismisses in ~4s
- [ ] Every Modal dismissible via Escape + backdrop click
- [ ] Every ConfirmDialog dismissible via Escape + backdrop click

---

## Page 35 — `/notifications` (Notifications Inbox)

### Role gating

- [ ] As Visitor → `/login?returnTo=%2Fnotifications`
- [ ] As Applicant (Alice) → loads with 2 notifications (both unread)
- [ ] As Org (Oscar) → loads with 1 notification (unread)
- [ ] As Admin (Paul) → loads with empty state (no mock notifications for Paul)

### Header + counter

- [ ] Counter reads "Notifications · N · M unread" when M > 0, else just "Notifications · N"
- [ ] "Mark all read" button is disabled when unreadCount is 0
- [ ] Click Mark all read → toast + every unread row flips to read; filter pill "unread · X" drops X

### Filter pills

- [ ] All / Unread / Read pills render
- [ ] Unread shows a count suffix when > 0
- [ ] Click Unread → list filters; click Read → flips; click All → shows everything

### Row behavior

- [ ] Unread row: filled black dot + NEW badge + "Mark read" link
- [ ] Click "Mark read" → row flips to read style (hollow dot, no NEW badge, no Mark-read link)
- [ ] Click "Open" → navigates to notification.link AND marks read (check the count drops)
- [ ] Empty state copy when filter is "unread" and nothing unread: "All caught up"

## Page 36 — `/settings/profile` (Profile Settings)

### Role gating + sidebar

- [ ] As Visitor → `/login?returnTo=%2Fsettings%2Fprofile`
- [ ] Shared SettingsSidebar shows Profile active + Account + Notifications links
- [ ] Clicking Account / Notifications in the sidebar navigates without redirect

### Pre-fill

- [ ] Display name, Handle, Bio, Telegram, Country, State, Wallet all match mock user
- [ ] Public profile checkbox reflects `user.isProfilePublic`

### Validation

- [ ] Clear Display name → Save disabled
- [ ] Handle `ab` (too short) → red error + Save disabled
- [ ] Handle `Bad Handle!` → slugifier auto-cleans to `bad-handle` on input
- [ ] Bio with 5 chars → red error "At least 10 characters"
- [ ] Empty bio → ok, Save enabled

### Save + navigate

- [ ] Save → toast + page refreshes; values stay (mock is static)
- [ ] "View public profile →" link goes to `/u/<handle>`

## Page 37 — `/settings/account` (Account Settings)

### Sign-in card

- [ ] Email + BuilderHub ID rendered from mock user
- [ ] Badge: "Active" (inverted) when onboardingCompletedAt is set; "Onboarding incomplete" otherwise
- [ ] PLATFORM ADMIN badge appears only for Paul
- [ ] Footer note says email is managed by BuilderHub SSO

### Danger zone

- [ ] Counts: "You own N projects" + "M of your applications are still live"
- [ ] As Alice: live-apps count is 2 (IN_REVIEW + SUBMITTED); delete button disabled; blocked-warning visible
- [ ] Withdraw or decline apps manually in mock before testing the unblocked path (or test as a role with 0 live apps)
- [ ] Delete → confirm dialog opens, requires typing DELETE; different text keeps button disabled
- [ ] Type DELETE → button enables → click → toast + routes to `/`

## Page 38 — `/settings/notifications` (Notification Preferences)

### Role gating

- [ ] As Visitor → `/login?returnTo=%2Fsettings%2Fnotifications`
- [ ] All other roles can load it

### Groups + rows

- [ ] 4 groups render in order: Applicant, Reviewer, Org Admin, Account
- [ ] Applicant has 3 events; Reviewer has 2; Org Admin has 2; Account has 1
- [ ] Each row shows label + description + Email checkbox + In-app checkbox

### Defaults

- [ ] Email ON by default for: application_status_changed, reviewer_assigned, invitation_received, funding_disbursed (four rows have the email box ticked)
- [ ] Every row's in-app checkbox is ticked by default

### Toggles + batch mute

- [ ] Click a row's Email or In-app checkbox → toggles that single cell
- [ ] Click "Mute email" → every email checkbox flips off in one action
- [ ] Click "Mute in-app" → every in-app checkbox flips off
- [ ] Save → toast "Notification preferences saved (mock)"

## Page 39 — `/projects/[id]/updates` (Manage Updates)

Owner-only CRUD for project updates. Same local-optimistic pattern as Team / Files.

### Role gating

- [ ] Visitor → login; Admin → /admin; Org → dashboard; Applicant (non-owner) → `/discover/projects/[id]`
- [ ] Bogus id → 404
- [ ] As Alice `/projects/proj_01/updates` → 2 updates pre-seeded, newest first
- [ ] As Alice `/projects/proj_02/updates` → empty state with "Post update" CTA

### Add / edit

- [ ] Post update → modal; title required, body min 20 chars
- [ ] Body with 10 chars → red error "At least 20 characters"
- [ ] Valid submit → toast + new row appears at the top
- [ ] Edit on existing row → pre-fills title + body; Save updates in place
- [ ] Body preserves newlines on display (whitespace-pre-wrap)

### Remove

- [ ] Remove → confirm with update title in copy
- [ ] Confirm → toast + row drops; counter decrements
- [ ] Empty state returns when last row removed

## Page 40 — `/projects/[id]/versions` (Project Versions)

Read-only history viewer (no edit controls).

### Role gating

- [ ] Visitor / Admin / Org / non-owner applicant → same redirects as updates page
- [ ] Alice `/projects/proj_01/versions` → 2 versions, newest first

### Display

- [ ] Version 2 row shows "Latest" inverted badge; Version 1 does not
- [ ] Each row shows change log text + author + timestamp
- [ ] Click the Snapshot `<details>` → JSON payload expands with monospace formatting
- [ ] Projects with zero versions render empty state
- [ ] MockApiBadge lists GET endpoints for list + single version

## Page 41 — `/dashboard/[orgSlug]/members` (Org Members)

Inherits auth gating from the `/dashboard/[orgSlug]/layout.tsx` (applicant → 404, visitor → login, admin → allowed).

### Display

- [ ] `/dashboard/avalanche-foundation/members` as Oscar: 3 members — Oscar (OWNER), Wendy Whitelisted, Eddie Editor (both WHITELISTED)
- [ ] Each row shows name + email + joined date + role Select + role badge + Remove button

### Role changes

- [ ] Change Wendy's Select from WHITELISTED → OWNER → toast + badge updates + row shows two owners
- [ ] Change only remaining owner back to WHITELISTED → toast error "At least one owner is required"; role stays OWNER

### Remove + last-owner guard

- [ ] Remove button disabled when the row is the only OWNER (title tooltip explains)
- [ ] Remove a WHITELISTED member → confirm → toast + row drops
- [ ] Try to remove a single-owner row via direct confirm (shouldn't be reachable from UI; if tested manually through dev tools) → toast error

### Invite flow

- [ ] Invite member → modal with email + role select (Whitelisted default)
- [ ] Invalid email → inline red error + Send disabled
- [ ] Already-member email → toast error, no invite sent
- [ ] Valid invite → toast mentions /invitations, modal closes, member list unchanged (they appear only after accepting)

## Page 42 — `/dashboard/[orgSlug]/settings` (Org Settings)

### Role gating + sidebar

- [ ] Inherits dashboard layout gating (visitor → login; non-member → 404)
- [ ] Sidebar now shows "Members" + "Settings" under an Org group (left-of-main column)
- [ ] Settings row is highlighted when on this page

### Pre-fill

- [ ] Name, Slug, Description, Website, Logo URL all match the mock org
- [ ] Slug change edit shows hint about `/dashboard/<new-slug>`
- [ ] Invalid slug `ab` / `Bad Slug` → red error + Save disabled

### Submit

- [ ] Save without slug change → toast + page stays (refresh)
- [ ] Save with slug change → router.push to `/dashboard/<new-slug>/settings`

### Delete guard

- [ ] Avalanche Foundation has live grants → Delete button disabled + "Delete blocked" note
- [ ] If you archive every grant manually in mock, Delete enables (re-run with Subnet Labs which has fewer live grants)
- [ ] Confirm dialog requires typing the current slug → Delete stays disabled until match
- [ ] Match slug → Delete → toast + routes to `/organizations`

## Page 43 — `/dashboard/[orgSlug]/grants/[grantId]/settings` (Grant Permissions)

### Display

- [ ] `/dashboard/avalanche-foundation/grants/grant_defi/settings` shows 2 rows (Eddie EDITOR, Gina REVIEWER)
- [ ] `/dashboard/avalanche-foundation/grants/grant_infra/settings` shows 1 row (Gina VIEWER)
- [ ] Breadcrumb "← Dashboard" returns to grant dashboard
- [ ] Empty state on grants with zero permissions, with a CTA

### Role change

- [ ] Change Eddie EDITOR → VIEWER via Select → toast + badge updates
- [ ] Change Gina VIEWER → REVIEWER → toast

### Add collaborator

- [ ] Add modal → user dropdown excludes already-assigned users
- [ ] If every registered user is already assigned → modal says "every registered user already has permissions"
- [ ] Add with no user selected → button disabled
- [ ] Valid add → toast + new row appears

### Remove

- [ ] Remove → confirm → toast + row drops

## Page 44 — `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` (Disbursements)

### Pre-fill + state gating

- [ ] `/dashboard/avalanche-foundation/grants/grant_infra/applications/app_04/funding` as Oscar: 2 disbursements (Completed $7500, Pending $7500), totals match
- [ ] 3 stat cards show Completed / Pending / Funding requested
- [ ] `/dashboard/.../applications/app_01/funding` (IN_REVIEW): read-only banner appears + Record button hidden + each row's Edit/Remove hidden
- [ ] Cross-org: `/dashboard/avalanche-foundation/grants/grant_nft/applications/app_02/funding` → 404 (grant_nft is org_subnet's)
- [ ] Bogus appId → 404

### Record flow

- [ ] Click Record → modal with amount + currency + status + milestone + date + note
- [ ] Amount `0` or blank → red error "Enter a positive number" + Record disabled
- [ ] Status = Completed, date left blank → submit stamps today's date
- [ ] Save → toast + row appears at top + totals recompute

### Edit + remove

- [ ] Click Edit on a row → modal pre-fills every field (date in yyyy-mm-dd)
- [ ] Change status from PENDING → COMPLETED → row badge flips + totals move between buckets
- [ ] Remove → confirm shows amount + status in copy → confirm → row drops, totals recompute

## Page 45 — `/faq`

### Access + layout

- [ ] `/faq` loads for every role (Visitor, Applicant, Org, Admin)
- [ ] 5 section cards render in order: Getting started / Applying for grants / Hackathons & challenges / For org admins / Privacy & data
- [ ] Top of page shows nav chips — clicking each jumps to the matching section via anchor
- [ ] "Still stuck?" footer card with a link back to `/`

### Entries

- [ ] Each section has 3–4 Q&A entries
- [ ] Clicking a question expands the `<details>` to show the answer
- [ ] Multiple details can be open simultaneously
- [ ] Keyboard: Tab moves to each `<summary>`, Enter toggles open/closed

---

## Cross-page flows (end-to-end)

Each flow is one clean walkthrough. All are valid against the mock layer; state resets on refresh (noted where relevant).

### A. Applicant self-maintenance loop

- [ ] Sign in as Alice → click navbar Profile badge → `/u/alice` renders
- [ ] Click "Edit profile" on `/u/alice` → lands on `/settings/profile`
- [ ] Change Display name → Save → toast
- [ ] Click "View public profile →" → back on `/u/alice` (name still pre-edit because mock is static — expected)
- [ ] Navigate to `/settings/account` → Delete button disabled (2 live apps) + blocked copy shows
- [ ] Navigate to `/settings/notifications` → mute email → save → toast
- [ ] Navigate to `/notifications` → 2 unread rows visible → Mark all read → counter drops to 0

### B. Project update timeline loop

- [ ] As Alice on `/projects/proj_01` → Updates card shows 2 updates (from Tier 1 mock)
- [ ] Click "Manage" on Updates card → `/projects/proj_01/updates`
- [ ] Post a new update → appears at top of /updates list
- [ ] Back to `/projects/proj_01` → Updates card **still shows 2** (mock is static — expected)
- [ ] `/discover/projects/proj_01` as Visitor → Updates section renders the 2 seeded updates (when PUBLIC / not hidden via CUSTOM)
- [ ] Navigate to `/projects/proj_01/versions` → 2 versions, newest labeled "Latest", JSON snapshot expands

### C. Org admin loop

- [ ] As Oscar on `/dashboard/avalanche-foundation` → sidebar shows Overview / Grants / Members / Settings
- [ ] Click Members → 3 rows → promote Wendy to OWNER → toast, she gets an inverted badge
- [ ] Click Settings → edit description → Save → toast
- [ ] Try Delete → blocked by live grants; banner explains; Delete button disabled
- [ ] Drill into a grant: `/dashboard/avalanche-foundation/grants/grant_defi` (Tier 2 dashboard)
- [ ] Click "Manage" on Questions card → questions page (Tier 2)
- [ ] Click "Manage" on Reviewers card → reviewers page (Tier 2)
- [ ] Go to grant's Permissions (settings URL) → grant permissions CRUD works (Tier 3 Page 43)
- [ ] Open an accepted app: `/dashboard/avalanche-foundation/grants/grant_infra/applications/app_04/funding` → 2 disbursements render with totals

### D. Invitation loop (cross-Tier, useful for Tier 3 regression)

- [ ] As Oscar on `/dashboard/avalanche-foundation/members` → Invite member → email `new@example.com`, role WHITELISTED → Send
- [ ] Toast mentions /invitations (invite row is mock — doesn't actually appear for new@example.com)
- [ ] Switch to Alice → `/invitations` → her 4 mock invites appear (2 pending + 2 past)
- [ ] Pending row "Review" → `/invite/tok_subnet_member_01` → Accept → toast + routes to `/dashboard/subnet-labs`

### E. Disbursement visibility (future integration — currently mock-only)

- [ ] On `/dashboard/avalanche-foundation/grants/grant_infra/applications/app_04/funding` record a new COMPLETED disbursement of $500
- [ ] Totals recompute (Completed moves from $7,500 → $8,000)
- [ ] Refresh → resets to seeded 2 disbursements (expected until PATCH wires real data)
- [ ] Tier 4 follow-up: this total should appear on the applicant's `/applications/app_04` + `/u/alice` "Funding received" field — out of scope here

---

## Edge cases

- [ ] Every 404 path (bogus id / cross-org access) returns the shared [app/not-found.tsx](../../app/not-found.tsx)
- [ ] Switching role via the Role Switcher while on a Tier 3 owner-gated page → next nav re-applies guard (e.g. Org → Applicant on `/dashboard/...` → next navigation 404s or redirects)
- [ ] Keyboard-only: Escape dismisses every modal (add / edit / confirm dialogs)
- [ ] Direct URL with query string survives login redirect: visit `/settings/profile` as Visitor → bounces to `/login?returnTo=%2Fsettings%2Fprofile` → sign in → lands back on settings
- [ ] Open-redirect safety still holds on new routes: `/login?returnTo=https://evil.example` → hint hidden, fallback routing kicks in (verified on Tier 1 — new routes inherit the same helper)
- [ ] Disabled buttons have `disabled` attribute + `title` attribute explaining why (last-owner guard, delete blocked, etc.) — inspect with devtools

## Accessibility spot-checks

- [ ] Every Tier 3 form input has a `<label>` (Profile / Account / Notifications prefs / Updates / Disbursements / Org members invite modal / Grant permissions add modal)
- [ ] Required inputs marked with visible `*`
- [ ] Select + checkbox inputs are keyboard-operable (Tab, arrow keys, Space)
- [ ] Modal focus traps to the modal content (Tab cycles inside, doesn't escape behind)
- [ ] Every destructive action is behind a ConfirmDialog
- [ ] Every icon-only button has `aria-label` (remove X on pictures, up/down chevrons on questions reorder)
- [ ] Anchor-nav chips on `/faq` are `<a href="#id">`, work with keyboard + screen-reader jump
- [ ] `<details>` blocks on /faq + Versions snapshot expand with Enter

---

## Known gaps (Tier 4 — not bugs)

- `/admin`, `/admin/users`, `/admin/organizations`, `/admin/audit-log` — Tier 4
- `/auth/callback` — Tier 4
- Real persistence — every mutation is still a mock toast; state resets on refresh
- Cross-page data propagation (edit profile → see on /u/[handle]; post update → see on project detail) is blocked on real API — tests above note where mock staleness is expected
