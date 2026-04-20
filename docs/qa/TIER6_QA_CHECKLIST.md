# Tier 6 — Manual QA Checklist

> **Phase:** Tier 6 (in progress) · **Status:** scoped (locked to Tier 6)
>
> **Prerequisites**:
> - Tier 1–5 complete
>
> **Out of scope**:
> - Real backend — everything is still mock; data resets on refresh
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 6 shipped log
>
> Ecosystem addons: org analytics, email digests, webhooks, public API keys, grant embed widget, grant templates.

---

## Automated (must stay green)

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build` — 62 routes

---

## Page 57 — `/dashboard/[orgSlug]/analytics` (Org Analytics)

### Access (dashboard layout)

- [ ] Visitor → login; non-member applicant → 404; cross-org 404
- [ ] As Oscar `/dashboard/avalanche-foundation/analytics` → loads
- [ ] Sidebar "Analytics" link highlighted

### Data

- [ ] Active grants count excludes deleted grants
- [ ] Applications count covers every app whose grantId is owned by this org
- [ ] Disbursed = sum of COMPLETED disbursements across every app on this org's grants
- [ ] Funnel bars percentage computed over total applications
- [ ] Category breakdown uses first category of each applied project

### Per-grant leaderboard

- [ ] Row per grant showing apps + accepted + pending counts
- [ ] Grant title link → `/dashboard/[orgSlug]/grants/[grantId]`
- [ ] Rows sorted by total applications desc

## Page 58 — `/dashboard/[orgSlug]/digest` (Email Digest Settings)

### Cadence controls

- [ ] Frequency `off` → day + time pickers disappear; preview card shows "Digest is off"
- [ ] Frequency `weekly` → day dropdown appears with 5 options
- [ ] Frequency `daily` → only time picker shows (no day)

### Recipients

- [ ] Default is "Owners only"
- [ ] Copy reminds individual users can mute under `/settings/notifications`

### Section toggles + preview

- [ ] All 4 toggles default on (stats defaults off)
- [ ] Preview card Body list shows a bullet per enabled section with live counts
- [ ] Uncheck "New applications" → bullet disappears from preview
- [ ] Subject text changes between "Your [org] week in grants" and "Today at [org]" based on cadence

### Send now

- [ ] Button disabled when cadence=off
- [ ] Click → toast "Digest queued for [org] (mock)"

## Page 59 — `/dashboard/[orgSlug]/webhooks` (Webhooks)

### Pre-fill + display

- [ ] Seed row: Slack hook, 2 events (application.submitted + application.status.changed), enabled, last delivered + OK badge
- [ ] Each row shows URL + enabled/disabled badge + last status badge + event chips + secret + action buttons

### Add flow

- [ ] Add webhook → modal opens
- [ ] `http://foo.bar` → "Must be an https:// URL" error
- [ ] Pick zero events → Register button disabled + red "Pick at least one event" hint
- [ ] Valid submit → toast reveals secret + new row appears at top

### Per-row actions

- [ ] Send test → toast + lastDeliveredAt updates + lastStatus = OK
- [ ] Rotate secret → toast reveals new secret; row secret text updates
- [ ] Disable → badge flips; button flips to "Enable"
- [ ] Edit → modal pre-fills URL + events; changes save in place
- [ ] Remove → confirm → toast + row drops

## Page 60 — `/dashboard/[orgSlug]/api-keys` (Public API Keys)

### Pre-fill + display

- [ ] Header counter: "Keys · 2 active"
- [ ] Each row shows label + scope badge + ACTIVE / REVOKED badge + masked prefix + created + last used timestamps

### Mint flow

- [ ] New key → modal; label required; Create disabled until label filled
- [ ] Create → first modal closes, second modal opens with plaintext key + Copy button
- [ ] Copy → clipboard updated + toast "Copied to clipboard"
- [ ] Close the plaintext modal → list shows the new row with masked prefix (no way to re-reveal)

### Revoke

- [ ] Active row → Revoke → confirm dialog explains 401s + permanence
- [ ] Confirm → toast + row flips to REVOKED + Revoke button disappears + active count decrements

## Page 61 — `/dashboard/[orgSlug]/grants/[grantId]/embed` (Grant Embed Widget)

### Configurator

- [ ] Theme dropdown: Light / Dark
- [ ] Size dropdown: Full / Compact
- [ ] Changing theme updates the preview card background + text color immediately
- [ ] Changing size switches preview content between "full" (shows pool + countdown) and "compact" (title + CTA only)

### Snippets

- [ ] Iframe snippet URL reflects selected params — default (light/full) has no query string, dark+compact shows `?theme=dark&compact=1`
- [ ] Iframe height changes (360 for full, 180 for compact)
- [ ] Script tag carries `data-theme` + `data-compact` attributes matching selection
- [ ] Copy buttons copy the snippet to clipboard + show toast

## Page 62 — `/dashboard/[orgSlug]/grants/templates` (Grant Templates)

### Listing

- [ ] One row per existing non-deleted grant owned by this org
- [ ] Rows sorted newest-first by createdAt
- [ ] Row shows title + status badge + FLAGSHIP badge when applicable + question count + funding pool + requirements preview (line-clamp-2)

### Clone flow

- [ ] Click Clone → confirm dialog mentions the template title + fields that copy vs reset (title/slug/deadline fresh)
- [ ] Confirm → toast "Cloned … as a new DRAFT (mock)"
- [ ] Routes back to `/dashboard/[orgSlug]/grants` (mock can't persist the new row; real API would open `/grants/<clonedId>/edit`)

### Empty state

- [ ] An org with zero grants → empty state copy says "Ship your first grant, then return"

---

## Known gaps (post-Tier 6 — blocked on backend)

- Real persistence — every mutation is still a mock toast
- Real webhook delivery, real API key issuance, real digest email fan-out — all surfaced as mock toasts + UI; backend work is tracked in [../planning/IMPLEMENTATION_PHASES.md](../planning/IMPLEMENTATION_PHASES.md) Phase 6.
