# Tier 4 — Manual QA Checklist

> **Phase:** Tier 4 (5 / 5 pages shipped · master list at 50 / 50) · **Status:** scoped (locked to Tier 4)
>
> **Prerequisites**:
> - Tier 1 + Tier 2 + Tier 3 complete — see [TIER1_QA_CHECKLIST.md](TIER1_QA_CHECKLIST.md), [TIER2_QA_CHECKLIST.md](TIER2_QA_CHECKLIST.md), [TIER3_QA_CHECKLIST.md](TIER3_QA_CHECKLIST.md)
>
> **Out of scope**:
> - Real SSO wiring — `/auth/callback` is still a mock landing
> - Real admin mutations — every action still toasts; state resets on refresh
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 4 shipped log
>
> Tier 4 is platform-admin only (plus `/auth/callback`). Test as Paul PlatformAdmin (`user_admin`).

Mock users:

| Role | User | Notes |
|---|---|---|
| Visitor | — | Logged-out |
| Applicant | Alice Applicant | Should 404 on every `/admin/*` route |
| Admin | Paul PlatformAdmin | Full access |
| Org | Oscar Owner | Should 404 on every `/admin/*` route |

---

## Automated (must stay green)

- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm lint` — 0 warnings
- [ ] `pnpm build` — all routes compile (50 routes)

---

## Cross-cutting (covers all 4 /admin/* pages)

### Shared gating (via `app/admin/layout.tsx`)

- [ ] As Visitor, every `/admin/*` route → `/login?returnTo=%2Fadmin...`
- [ ] As Applicant or Org, every `/admin/*` route → silent redirect to `/` (no 404 banner — intentional, don't leak admin routes)
- [ ] As Admin (Paul), every `/admin/*` route loads

### Shared sidebar

- [ ] Sidebar title reads "Platform · admin · Paul PlatformAdmin"
- [ ] Overview / Organizations / Users / Audit log links render for every admin page
- [ ] Active row inverts depending on current URL
- [ ] Group labels: Overview is top; Directory (Organizations + Users) + Compliance (Audit log) grouped underneath

### Navbar Admin link

- [ ] As Paul, navbar shows "Admin" link → `/admin`
- [ ] As anyone else, Admin link is absent

---

## Page 46 — `/auth/callback` (SSO Callback)

Three branches tested by editing the URL directly:

### Already-authenticated branch

- [ ] As Alice, visit `/auth/callback` (no params) → redirects to `/projects` (onboardingCompleted)
- [ ] As Alice with `Simulate new user` toggled on, visit `/auth/callback` → redirects to `/onboarding`
- [ ] As Alice, visit `/auth/callback?returnTo=%2Fapplications` → redirects to `/applications`
- [ ] As Alice, visit `/auth/callback?returnTo=https%3A%2F%2Fevil.example` → falls back to `/projects` (open-redirect guard)

### Error branch

- [ ] As Visitor, visit `/auth/callback?error=access_denied&error_description=User+declined` → error card renders with the code + description + "Try again" / "Back home" CTAs
- [ ] "Try again" → `/login`

### Missing code/state fallback

- [ ] As Visitor, visit `/auth/callback` (no params) → "Awaiting BuilderHub…" card with the 3-step handshake explainer + "Back to login" CTA

### Happy-path preview

- [ ] As Visitor, visit `/auth/callback?code=abc&state=xyz` → "Exchanging code with BuilderHub…" card showing the code + state in a monospace dl
- [ ] Card footer note reminds this is a mock preview; real backend sets cookie + 302s

## Page 47 — `/admin` (Platform Dashboard)

### Gating (shared across every /admin/* route)

- [ ] As Visitor `/admin` → `/login?returnTo=%2Fadmin`
- [ ] As Applicant (Alice) → silent redirect to `/`
- [ ] As Org (Oscar) → silent redirect to `/`
- [ ] As Admin (Paul) → loads
- [ ] Same gating holds on `/admin/organizations`, `/admin/users`, `/admin/audit-log` (direct URL)

### Sidebar

- [ ] DashboardShell sidebar shows "Platform · admin · Paul PlatformAdmin" title
- [ ] Overview / Organizations / Users / Audit log links render
- [ ] Active page row inverts (Overview highlighted on /admin)

### Stats + panels

- [ ] 4 stat cards render: Organizations (2 non-deleted) / Users (with admin count hint) / Live grants (with open vs other) / Applications (with accepted count)
- [ ] "View full audit log" header button → `/admin/audit-log`
- [ ] Recent audit trail shows top 5 newest entries; each row has action badge + resource + actor + timestamp
- [ ] Quick actions card links to the 3 other admin routes
- [ ] System health card reads: Mock API LIVE / Real backend PENDING / BuilderHub SSO MOCK

## Page 48 — `/admin/organizations`

### Display

- [ ] As Paul `/admin/organizations` → 2 rows: Avalanche Foundation (ACTIVE) + Subnet Labs (ACTIVE)
- [ ] Each row shows name link + slug badge + status badge + description + meta line (members · grants · open)
- [ ] Row "Open" button → `/dashboard/[orgSlug]`
- [ ] Search by name `ava` → filters to Avalanche Foundation only
- [ ] Search by slug `subnet` → filters to Subnet Labs

### Filter chips

- [ ] "all / active / suspended" pills toggle the list
- [ ] With filter=suspended and no mock suspensions → empty state

### Suspend / restore flow

- [ ] Active row Suspend → confirm dialog explains members lose access + grants stop accepting
- [ ] Confirm → toast + row badge flips to SUSPENDED + Suspend button becomes Restore
- [ ] Switch filter to suspended → the row appears
- [ ] Restore → confirm (non-destructive) → toast + badge back to ACTIVE

## Page 49 — `/admin/users`

### Display

- [ ] Header counter: "Users · N · M admins" where M = active admins
- [ ] Per-row name is a link to `/u/[handle]`; handle badge, ADMIN badge (if any), YOU badge on Paul's own row, DELETED / ONBOARDING badges as applicable
- [ ] Meta line: `<n> orgs · <m> applications · joined <date>`

### Search + filter

- [ ] Search `alice` → filters to Alice
- [ ] Search `owner@` → Oscar's row
- [ ] Filter chip `admins` → only rows with isPlatformAdmin=true (just Paul in mock)
- [ ] Filter chip `deleted` → empty state until you soft-delete someone

### Promote / demote guards

- [ ] On any non-admin row → "Make admin" button → confirm → toast + ADMIN badge appears + admin counter increments
- [ ] Paul's own row: "Demote" disabled with title "You can't demote yourself"
- [ ] With Paul the only admin: "Demote" disabled on his row (last-admin guard)
- [ ] Promote another user to admin, then demote Paul → works (not last admin anymore)

### Delete guard

- [ ] Paul's own row: Delete disabled with title "Use /settings/account to delete yourself"
- [ ] Delete any other row → destructive confirm mentions PII scrub + org-membership retention
- [ ] Confirm → toast + DELETED badge appears; filter chip `deleted` picks it up

## Page 50 — `/admin/audit-log`

### Pre-fill

- [ ] Counter reads "12 entries · newest first" (mock now has 12 rows)
- [ ] Each row: action badge (inverted) + `resourceType/resourceId` + actor link (`by <name>` → `/u/[handle]`) + timestamp + IP (mono) + optional Metadata `<details>`
- [ ] Metadata expansion shows JSON payload in monospace

### Filter controls

- [ ] Search by `grant_defi` → rows narrow to those referencing that grant (metadata + resourceId match)
- [ ] Action dropdown lists every unique action from the 12 entries
- [ ] Select `application.status.change` → counter drops to 2 rows (audit_02 + audit_04)
- [ ] Resource type dropdown → pick `disbursement` → 1 row (audit_10)
- [ ] Actor dropdown → pick Alice → all her-originated rows appear
- [ ] From `2026-03-01` + To `2026-03-31` → only March rows render
- [ ] "Clear" → resets every filter; button disabled when no filters active
- [ ] "Active" suffix in the Filters card title appears only when at least one filter is set

### Export

- [ ] Export CSV → toast "Exporting N entries (mock)" where N = current visible count
- [ ] Export respects the currently applied filters (toast number matches table count)

### Actor deletion

- [ ] Manually set a user's `deletedAt` in `lib/mock/users.ts` → their audit rows show "actor deleted" instead of a profile link (FK-null behavior)

---

## Cross-page flows (end-to-end)

### A. Platform admin walk

- [ ] Sign in as Paul → navbar Admin link appears → click → `/admin` loads
- [ ] Sidebar Organizations → 2 rows; click Open on Avalanche Foundation → `/dashboard/avalanche-foundation` (bypass still works — Paul isn't a member but gets through the layout guard)
- [ ] Back to `/admin/users` → Search `alice` → one row → click Profile → `/u/alice`
- [ ] Back to `/admin/audit-log` → filter Actor = Alice → only her rows render

### B. Suspension + restore drill

- [ ] On `/admin/organizations`, Suspend Subnet Labs → Toast + SUSPENDED badge
- [ ] Switch filter to `suspended` → Subnet Labs appears
- [ ] Restore → badge flips ACTIVE
- [ ] Page refresh → state resets to seeded (mock doesn't persist — expected)

### C. Admin demotion guard

- [ ] On `/admin/users`, promote Oscar → Now 2 admins
- [ ] Try to demote Paul (yourself) → button disabled, tooltip "You can't demote yourself"
- [ ] Demote Oscar → 1 admin remaining
- [ ] Try to demote Paul again → still disabled (last-admin)

### D. Audit log forensics

- [ ] Filter Action = `application.status.change` + From = `2026-02-01` + To = `2026-02-28` → 1 row (audit_04, app_04 accepted)
- [ ] Switch Resource type = `disbursement` → 1 row (audit_10)
- [ ] Clear → all 12 rows back

---

## Edge cases

- [ ] Direct URL with query string survives login redirect: `/admin/audit-log?action=grant.create` as Visitor → bounces to `/login?returnTo=%2Fadmin%2Faudit-log%3Faction%3Dgrant.create` → sign in as Paul → lands back with query preserved
- [ ] Bogus sub-route under `/admin` (`/admin/not-a-page`) → Next.js 404 (layout still gates non-admins before the 404 — verified by Visitor hitting `/admin/not-a-page` → `/login`)
- [ ] Role switch while on an admin page → next navigation re-applies layout gating (Paul → Applicant on `/admin/users` → next nav silent redirect to `/`)
- [ ] Keyboard-only: every filter control reachable via Tab; Escape dismisses any confirm dialog

## Accessibility spot-checks

- [ ] Every filter Select + Input has a `<label>`
- [ ] `aria-current="page"` on the active admin sidebar row
- [ ] Badges carry semantic text (not icon-only)
- [ ] Every destructive action (Suspend / Demote / Delete) is behind a ConfirmDialog
- [ ] Disabled buttons (last-admin, self-demote, self-delete) have `title` attribute explaining why
- [ ] `<details>` blocks on audit-log metadata expand with Enter

---

## Known gaps (post-Tier 4 — not bugs)

- Real SSO wiring — `/auth/callback` is still a mock landing; the real BuilderHub exchange happens server-side in Phase 1 backend.
- Real admin mutations — toggling `isPlatformAdmin`, suspending orgs, etc. all toast but don't persist.
- Audit log CSV export — UI only; backend generation TBD.
