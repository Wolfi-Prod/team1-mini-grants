# Team1 Grants — Pages & Flows

> **Status:** living (tick boxes as pages ship) · **Applies to:** scope + ship tracking
>
> **Prerequisites** (read first):
> - [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) — entities that drive the page list
> - [USER_AND_ROLE_FLOWS.md](USER_AND_ROLE_FLOWS.md) — which role needs which page
>
> **Out of scope** (pointers, not content):
> - Commit-level ship plan + shipped log → [FRONTEND_IMPLEMENTATION_PLAN.md](FRONTEND_IMPLEMENTATION_PLAN.md)
> - Per-page design details → the spec doc for that feature (e.g., [specs/HACKATHONS_CHALLENGES.md](../specs/HACKATHONS_CHALLENGES.md))
> - Manual verification walkthroughs → [qa/TIER1_QA_CHECKLIST.md](../qa/TIER1_QA_CHECKLIST.md)
>
> Complete list of pages to build, organized by user flow.

---

## Audiences

1. **Visitor** — not logged in, browsing publicly
2. **Applicant** — logged-in user who owns projects and applies for grants
3. **Reviewer** — logged-in user assigned to review applications (per-grant role)
4. **Org Admin** — owner or whitelisted member managing grants for an organization
5. **Platform Admin** — super user with `isPlatformAdmin = true`

A single user can wear multiple hats at once (e.g., apply to Org A's grant while reviewing for Org B).

---

## Flow 1 — Visitor discovers the platform

```
Landing → Discover → Project/Grant detail → Login → Onboarding → My Projects
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Landing | `/` | Hero, value prop, CTAs |
| 2 | Discover | `/discover` | Featured projects + open grants, search/filter |
| 3 | Public project detail | `/discover/projects/[id]` | Read-only, with update timeline |
| 4 | Public grant detail | `/discover/grants/[grantId]` | Grant info + questions preview + "Apply" CTA |
| 5 | FAQ | `/faq` | Static help content |
| 6 | Login | `/login` | BuilderHub SSO button |
| 7 | Auth callback | `/auth/callback` | SSO redirect handler (invisible) |

---

## Flow 2 — First-time user onboarding

```
SSO callback → Onboarding (complete profile) → My Projects
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Onboarding | `/onboarding` | Telegram, country, state, wallet. Only shown on first login |

---

## Flow 3 — Applicant creates a project and applies

```
My Projects → New Project → Project Detail → Edit → Apply → Application Detail
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | My Projects | `/projects` | List of projects I own |
| 2 | New Project | `/projects/new` | Create form (name, description, image, categories, links) |
| 3 | Project Detail | `/projects/[id]` | Overview, team, files, updates, applications |
| 4 | Edit Project | `/projects/[id]/edit` | Auto-creates `ProjectVersion` on save |
| 5 | Project Versions | `/projects/[id]/versions` | Version history diff viewer |
| 6 | Manage Team | `/projects/[id]/team` | Add/remove `ProjectTeamMember` |
| 7 | Manage Files | `/projects/[id]/files` | Upload/remove `FileLink` (decks, docs) |
| 8 | Manage Updates | `/projects/[id]/updates` | Post progress updates |
| 9 | Apply to Grant | `/projects/[id]/apply` | Grant picker → dynamic `GrantQuestion` form |
| 10 | My Applications | `/applications` | All my applications across grants |
| 11 | Application Detail | `/applications/[id]` | Status, answers, feedback (once decided), disbursements |

---

## Flow 4 — User manages their identity

```
Navbar avatar → Settings → Profile / Wallet / Notifications
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Profile Settings | `/settings/profile` | Name, avatar, telegram, country, state, wallet |
| 2 | Account Settings | `/settings/account` | Email (read-only, from SSO), delete account |
| 3 | Notification Preferences | `/settings/notifications` | Email toggles per event type |
| 4 | Notifications Inbox | `/notifications` | Full list with read/unread filtering |

---

## Flow 5 — User receives an invitation

```
Email link → Public invite page → Accept → Destination (org dashboard or grant)
         OR
Logged-in → Invitations inbox → Accept → Destination
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Public invite landing | `/invite/[token]` | Works without login — shows org/grant + role |
| 2 | Invitations inbox | `/invitations` | Pending invites for logged-in user |

---

## Flow 6 — Reviewer reviews assigned applications

```
Notification → My Reviews → Review detail → Submit review
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | My Reviews queue | `/reviews` | Applications assigned to me, filterable by status + due date |
| 2 | Review detail | `/reviews/[appId]` | Full application + review form (approve/reject/request changes + feedback + score) |

---

## Flow 7 — Org admin manages grants

```
My Orgs → Org Dashboard → Grants → New Grant → Grant Dashboard → Applications → Decision
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | My Organizations | `/organizations` | List of orgs I belong to (owner or whitelisted) |
| 2 | Org Overview | `/dashboard/[orgSlug]` | Stats, recent activity, active grants |
| 3 | Org Members | `/dashboard/[orgSlug]/members` | Add/remove members, change roles |
| 4 | Org Settings | `/dashboard/[orgSlug]/settings` | Name, logo, description, website |
| 5 | Grants List | `/dashboard/[orgSlug]/grants` | All grants for this org |
| 6 | New Grant | `/dashboard/[orgSlug]/grants/new` | Create grant + questions in one wizard |
| 7 | Grant Dashboard | `/dashboard/[orgSlug]/grants/[grantId]` | Metrics: applications count, pipeline, funding |
| 8 | Edit Grant | `/dashboard/[orgSlug]/grants/[grantId]/edit` | Title, description, deadline, pool, status |
| 9 | Grant Questions | `/dashboard/[orgSlug]/grants/[grantId]/questions` | Add/edit/reorder `GrantQuestion` |
| 10 | Applications List | `/dashboard/[orgSlug]/grants/[grantId]/applications` | Filter by status, sort by score |
| 11 | Application Review | `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]` | Full app + reviewer feedback + cross-grants + decide |
| 12 | Reviewers | `/dashboard/[orgSlug]/grants/[grantId]/reviewers` | Assign reviewers with COI checks |
| 13 | Grant Permissions | `/dashboard/[orgSlug]/grants/[grantId]/settings` | Add VIEWER/EDITOR/REVIEWER collaborators |
| 14 | Disbursements | `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` | Record milestone payouts |

---

## Flow 8 — Platform admin oversees everything

```
/admin → Stats / Orgs / Users / Audit log
```

| # | Page | Route | Notes |
|---|---|---|---|
| 1 | Platform Dashboard | `/admin` | Stats: users, orgs, grants, applications |
| 2 | All Organizations | `/admin/organizations` | Create/suspend orgs |
| 3 | All Users | `/admin/users` | Search, view, toggle `isPlatformAdmin` |
| 4 | Audit Log | `/admin/audit-log` | Filterable by actor, resource, action, date |

---

## Master Page List (62 pages)

### Public (7)
- [x] `/` — Landing
- [x] `/discover` — Discover
- [x] `/discover/projects/[id]` — Public project _(canonical as of Tier 2; `/showcase/[id]` now 301s here)_
- [x] `/discover/grants/[grantId]` — Public grant
- [x] `/faq` — FAQ
- [x] `/login` — Login
- [x] `/auth/callback` — SSO callback

### Onboarding & Invites (3)
- [x] `/onboarding` — Complete profile
- [x] `/invite/[token]` — Public invite accept
- [x] `/invitations` — Logged-in invite inbox

### User Identity & Settings (4)
- [x] `/settings/profile` — Profile
- [x] `/settings/account` — Account
- [x] `/settings/notifications` — Notification prefs
- [x] `/notifications` — Notifications inbox

### Projects (8)
- [x] `/projects` — My projects
- [x] `/projects/new` — New project
- [x] `/projects/[id]` — Project detail
- [x] `/projects/[id]/edit` — Edit project
- [x] `/projects/[id]/versions` — Version history
- [x] `/projects/[id]/team` — Manage team
- [x] `/projects/[id]/files` — Manage files
- [x] `/projects/[id]/updates` — Manage updates

### Applications (3)
- [x] `/projects/[id]/apply` — Apply to grant
- [x] `/applications` — My applications
- [x] `/applications/[id]` — Application detail

### Profiles (1)
- [x] `/u/[handle]` — Applicant profile (see [specs/PROFILE_SYSTEM.md](../specs/PROFILE_SYSTEM.md))

### Hackathons & Challenges (4)
- [x] `/hackathons` — Hackathons listing
- [x] `/hackathons/[id]` — Hackathon detail (team flow lands in 4b)
- [x] `/challenges` — Challenges listing
- [x] `/challenges/[id]` — Challenge detail (team flow lands in 4b)

_See [specs/HACKATHONS_CHALLENGES.md](../specs/HACKATHONS_CHALLENGES.md) for the full spec._

### Reviews (2)
- [x] `/reviews` — My reviewer queue
- [x] `/reviews/[appId]` — Review application

### Organizations (2)
- [x] `/organizations` — My orgs
- [x] `/dashboard/[orgSlug]` — Org overview

### Org Management (2)
- [x] `/dashboard/[orgSlug]/members` — Members
- [x] `/dashboard/[orgSlug]/settings` — Org settings

### Grants (Admin) (9)
- [x] `/dashboard/[orgSlug]/grants` — Grants list
- [x] `/dashboard/[orgSlug]/grants/new` — New grant
- [x] `/dashboard/[orgSlug]/grants/[grantId]` — Grant dashboard
- [x] `/dashboard/[orgSlug]/grants/[grantId]/edit` — Edit grant
- [x] `/dashboard/[orgSlug]/grants/[grantId]/questions` — Questions
- [x] `/dashboard/[orgSlug]/grants/[grantId]/applications` — Applications list
- [x] `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]` — Review app
- [x] `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` — Disbursements
- [x] `/dashboard/[orgSlug]/grants/[grantId]/reviewers` — Reviewers
- [x] `/dashboard/[orgSlug]/grants/[grantId]/settings` — Permissions

### Platform Admin (4)
- [x] `/admin` — Dashboard
- [x] `/admin/organizations` — All orgs
- [x] `/admin/users` — All users
- [x] `/admin/audit-log` — Audit log

### Power User — Tier 5 (6)
- [x] `/search` — Global search
- [x] `/applications/[id]/versions` — Application version history
- [x] `/reviews/dashboard` — Reviewer dashboard
- [x] `/dashboard/[orgSlug]/grants/[grantId]/analytics` — Grant analytics
- [x] `/admin/reviewers` — Platform reviewer audit + COI signals
- [x] `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants` — Cross-grants panel

### Ecosystem Addons — Tier 6 (6)
- [x] `/dashboard/[orgSlug]/analytics` — Org-wide analytics
- [x] `/dashboard/[orgSlug]/digest` — Email digest settings
- [x] `/dashboard/[orgSlug]/webhooks` — Webhook registration
- [x] `/dashboard/[orgSlug]/api-keys` — Public API keys
- [x] `/dashboard/[orgSlug]/grants/[grantId]/embed` — Grant embed widget
- [x] `/dashboard/[orgSlug]/grants/templates` — Grant templates

---

## Build Priority

**Phase 1 — MVP applicant path** (must ship together)
Login → Onboarding → My Projects → New Project → Project Detail → Apply → My Applications → Application Detail → Discover → Public Grant Detail

**Phase 2 — Org admin path**
My Orgs → Org Dashboard → New Grant → Applications List → Application Review → Decision

**Phase 3 — Reviews & collaboration**
My Reviews → Review Detail → Reviewers assignment → Grant Permissions → Invitations

**Phase 4 — Polish**
Settings, Notifications, Versions, Files, Updates, Disbursements, Audit Log

**Phase 5 — Platform admin**
`/admin/*` pages

**Phase 6 — Power user (Tier 5)**
Global search, application version history, reviewer dashboard, grant analytics, platform reviewer audit, cross-grants visibility

**Phase 7 — Ecosystem addons (Tier 6)**
Org analytics, email digests, webhooks, public API keys, grant embed widget, grant templates
