# Tier 5 — Manual QA Checklist

> **Phase:** Tier 5 (in progress) · **Status:** scoped (locked to Tier 5 — Tier 6 gets its own)
>
> **Prerequisites**:
> - Tier 1–4 complete — see [TIER1_QA_CHECKLIST.md](TIER1_QA_CHECKLIST.md), [TIER2_QA_CHECKLIST.md](TIER2_QA_CHECKLIST.md), [TIER3_QA_CHECKLIST.md](TIER3_QA_CHECKLIST.md), [TIER4_QA_CHECKLIST.md](TIER4_QA_CHECKLIST.md)
>
> **Out of scope**:
> - Real backend — everything is still mock; data resets on refresh
>
> **Also see:**
> - [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md) — Tier 5 shipped log
>
> Power-user surfaces: search, app versioning, reviewer dashboards, analytics, COI audit, cross-grants visibility.

---

## Automated (must stay green)

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build` — 62 routes after Tier 5 + 6 close

---

## Page 51 — `/search` (Global Search)

### Role gating

- [ ] As Visitor `/search` → `/login?returnTo=%2Fsearch`
- [ ] As any authenticated role → loads with corpus
- [ ] Navbar link or direct-URL entry both valid

### Query behavior

- [ ] Query < 2 chars → "Start typing to search" empty state
- [ ] Query `ava` → returns at least the Avalanche Foundation org + AvaSwap project + Ava Labs references
- [ ] Scope chips filter the result sections (pick Grants → only grants show)
- [ ] Scope=All shows one section per resource type with per-type counts

### URL sync

- [ ] Typing updates `?q=` in the URL in real time (shallow replace, no history bloat)
- [ ] Scope click updates `?scope=`
- [ ] Visit `/search?q=avaswap&scope=projects` directly → input pre-filled + correct chip active

### Per-result links

- [ ] Project row → `/discover/projects/[id]`
- [ ] Grant row → `/discover/grants/[grantId]`
- [ ] Application row → `/applications/[id]`
- [ ] User row → `/u/[handle]`
- [ ] Org row → `/dashboard/[orgSlug]`

## Page 52 — `/applications/[id]/versions` (Application Version History)

### Access control

- [ ] As Visitor `/applications/app_01/versions` → `/login?returnTo=...`
- [ ] As Alice (owner of proj_01) → loads, shows 2 versions
- [ ] As Oscar (Avalanche runs grant_defi) → loads, shows 2 versions
- [ ] As Paul admin → loads
- [ ] As Alice on `/applications/app_bogus/versions` → 404

### Version display (app_01 has 2 versions — main diff demo)

- [ ] Version 1 shows "Initial" badge; Version 2 shows "Latest" inverted badge
- [ ] Both show submittedBy (Alice) + timestamp
- [ ] Version 2 flags cover note + funding + 3 answers as changed (left border + "· changed" label)
- [ ] Click a "Previous" `<details>` → reveals the v1 value in a neutral-50 box

### Single-version apps (app_02, app_04)

- [ ] `/applications/app_02/versions` → 1 version with Initial + Latest badges; no diff markers
- [ ] `/applications/app_04/versions` → 1 version; same

### Empty state

- [ ] App with zero versions (manually delete mock rows) → empty state card

## Page 53 — `/reviews/dashboard` (Reviewer Dashboard)

### Access gating

- [ ] As Visitor → `/login?returnTo=%2Freviews%2Fdashboard`
- [ ] As Alice (no review assignments) → empty state
- [ ] As Oscar (2 assignments: app_01 pending, app_04 completed) → dashboard populated

### Stats (as Oscar)

- [ ] Pending = 1, Completed = 1 (counts match mock)
- [ ] Avg score shows computed value (mock has rev_02 with score 9 from Oscar → 9.0)
- [ ] Avg turnaround computed from assignedAt → review.createdAt in days

### Decision distribution

- [ ] 1 APPROVE bar at 100%, others at 0% (Oscar only has 1 review — rev_02 with decision APPROVE)
- [ ] Bar widths match the percentages

### Upcoming queue

- [ ] Shows app_01 pending row sorted by due date
- [ ] OVERDUE badge if due date is past; otherwise shows the due date
- [ ] "Start" button → `/reviews/app_01`

### Empty state (as Alice)

- [ ] Copy says "You're not on any review panels yet"

## Page 54 — `/dashboard/[orgSlug]/grants/[grantId]/analytics` (Grant Analytics)

### Access (inherited from dashboard layout)

- [ ] As Visitor / Applicant / cross-org → 404 or login
- [ ] As Oscar `/dashboard/avalanche-foundation/grants/grant_defi/analytics` → loads

### Stat cards

- [ ] Applications count matches `/applications` count for this grant
- [ ] Accept rate = accepted / (accepted + rejected). If no decisions yet → "—" + "no decisions yet" hint
- [ ] Avg decision time computed from submittedAt → decidedAt in days

### Funnel

- [ ] DRAFT bar uses (draft / total) percentage
- [ ] Non-draft rows use (n / total-non-draft) percentage
- [ ] Counts add up to the full applications count

### Categories

- [ ] Each row uses (n / total applications)
- [ ] Bars sorted descending by count
- [ ] Empty state when no applications exist

### Reviewer performance

- [ ] One row per reviewer assigned on this grant (across all its applications)
- [ ] Columns: assigned / completed / avg score / turnaround days
- [ ] Sort: completed desc, then assigned desc
- [ ] Empty state when zero reviewers

## Page 55 — `/admin/reviewers` (Platform Reviewer Audit)

### Access

- [ ] Admin-only (layout gating via `app/admin/layout.tsx`) — covered by Tier 4 cross-cutting checks
- [ ] Sidebar "Reviewers" link in the Compliance group is highlighted when on this page

### Stats

- [ ] Reviewers count matches unique reviewerIds across `mockReviewerAssignments`
- [ ] Active assignments = sum of (assigned - completed) across rows
- [ ] COI flags count = sum of every reviewer's coiFlags

### Row sort

- [ ] Rows with COI flags sort to the top
- [ ] Within equal COI count, sort by assigned count desc

### COI details

- [ ] `SAME_ORG_AS_APPLICANT` flag fires when reviewer + applicant share an org
- [ ] `APPLICANT_IS_SELF` flag fires when someone reviews their own application
- [ ] `<details>` expands with list of flagged applications, each showing kind + app + project + grant

## Page 56 — Cross-Grants Panel (`/dashboard/.../applications/[appId]/cross-grants`)

### Access + gating

- [ ] Cross-org URL tampering → 404 (layout guard + grant.organizationId check)
- [ ] As Oscar on Alice's app_01 → loads
- [ ] "Cross-grants" CTA in `/dashboard/.../applications/app_01` header lands here

### Applicant aggregates

- [ ] Total applications count = number of apps owned by the applicant (including this one)
- [ ] Accepted count = apps with status ACCEPTED (alice has 1 — app_04)
- [ ] Funding received = sum of COMPLETED disbursements across all their apps

### Other-apps list

- [ ] Excludes the current application; shows the other ones
- [ ] Each row: grant title + org badge + status badge + submittedAt + requested + received
- [ ] NO answers / feedback / scores / reviewers / decision reasoning shown

### "What's not shown" card

- [ ] Lists 3 excluded fields explicitly (answers / feedback / reviewer identity)
- [ ] Footer note reinforces backend ACL boundary

---

## Known gaps (Tier 6 — not bugs)

- Org-wide analytics / digests / webhooks / API keys / embed / templates → Tier 6
