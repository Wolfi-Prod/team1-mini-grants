# User Flows, Role Permissions & Page Functionality

> **Status:** frozen · **Applies to:** access control + page routing
>
> **Prerequisites** (read first, in order):
> - [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) — user / role / permission entities in the schema
>
> **Out of scope** (pointers, not content):
> - Per-page implementation plan → [FRONTEND_IMPLEMENTATION_PLAN.md](FRONTEND_IMPLEMENTATION_PLAN.md)
> - Full list of pages → [PAGES.md](PAGES.md)
> - Backend auth middleware → [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md) § Phase 1B
> - Feature-level role interactions (e.g., competition teams) → [specs/HACKATHONS_CHALLENGES.md](../specs/HACKATHONS_CHALLENGES.md)
>
> Defines **who can do what** — every user type, their flows, pages they access, actions they can take, and how roles interact across the platform.

---

## 1. USER TYPES

The platform has 5 distinct user types. A single person can hold multiple roles simultaneously (e.g., applicant + reviewer on different grants).

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLATFORM ADMIN                           │
│            (god mode — manages the entire platform)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐    ┌──────────────────┐                     │
│   │  ORG OWNER   │    │ ORG WHITELISTED  │                     │
│   │ (runs an org)│    │ (creates grants) │                     │
│   └──────┬───────┘    └────────┬─────────┘                     │
│          │                     │                                │
│          └──────────┬──────────┘                                │
│                     │                                           │
│          ┌──────────┴──────────┐                                │
│          │  GRANT COLLABORATOR │                                │
│          │  (Viewer/Editor/    │                                │
│          │   Reviewer)         │                                │
│          └─────────────────────┘                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICANT                                │
│         (any logged-in user who creates projects)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. APPLICANT (Any Logged-In User)

### Who They Are

Anyone who logs in via BuilderHub. Every user is an applicant by default — they don't need special permissions to create projects or apply to grants.

### What They Can Do

| Action | Details |
|--------|---------|
| Complete their profile | Add telegram, country, state, wallet, profile picture (addon data beyond BuilderHub's name + email) |
| Create projects | Unlimited projects per user |
| Edit their own projects | Updates auto-create a version snapshot |
| Delete their own projects | Soft delete. Blocked if project has any applications (must withdraw first) |
| Add team members to projects | Name, email, role, social links per member |
| Attach file links to projects | Pitch decks, whitepapers, demos — stored as URLs |
| Post project updates | Progress updates visible on public project page |
| Browse open grants | See all public grants with requirements and questions |
| Apply a project to a grant | Select project → answer grant-specific questions → write cover note → submit |
| Apply same project to multiple grants | One application per project per grant |
| Save application as draft | Come back and finish later |
| Withdraw an application | Can withdraw at any status except ACCEPTED |
| Track application status | See DRAFT / SUBMITTED / IN_REVIEW / ACCEPTED / REJECTED / WITHDRAWN |
| View version history | See what changed in their project over time |
| View notifications | Status changes, review feedback, invitation alerts |
| Accept/decline invitations | Join orgs or become grant collaborators |

### What They CANNOT Do

- See other users' projects (except on public discover page)
- See who reviewed their application
- See review scores or internal feedback
- See other applications to the same grant
- Change application status
- Access any admin dashboard

### Pages

```
/projects                     — My projects list
/projects/new                 — Create project (multi-step form)
/projects/:id                 — Project detail (edit, team, files, updates, version history)
/projects/:id/edit            — Edit project details
/projects/:id/apply           — Apply to a grant (select grant → answer questions → submit)
/projects/:id/updates         — Manage progress updates
/applications                 — My applications (all grants, all statuses)
/applications/:id             — Application detail (status, answers, cover note)
/notifications                — Notification center
/invite/:token                — Accept/decline invitation page
```

### Application Flow

```
User creates Project
  → Fills: name, description, problem statement, categories,
    team members, links, files
  → Project saved as editable entity

User browses /discover/grants
  → Sees open grants with deadlines, requirements, funding pool

User clicks "Apply" on a grant
  → System shows grant-specific questions
  → User answers questions + writes cover note + sets funding requested
  → User can "Save Draft" or "Submit"
  → On submit: status = SUBMITTED, submittedAt = now()
  → Application version snapshot created

User tracks on /applications
  → Sees all applications with current status
  → Can click into each to see details
  → Gets notified when status changes
```

### Project Lifecycle

```
Created → Editable (any number of edits, each creates a version)
  │
  ├── Applied to Grant A → Application (independent lifecycle)
  ├── Applied to Grant B → Application (independent lifecycle)
  └── Applied to Grant C → Application (independent lifecycle)

Project edits do NOT affect already-submitted applications
(applications snapshot the project state at submission time)
```

---

## 3. ORGANIZATION OWNER

### Who They Are

The person who runs an organization on the platform. They have full control over their org's grants, members, and applications. An org can have multiple owners.

### What They Can Do

**Org Management:**
| Action | Details |
|--------|---------|
| Edit org details | Name, description, logo, website |
| Add members | Invite by email (works even if user has no account) |
| Remove members | Remove any member except themselves (last owner can't leave) |
| Change member roles | Promote/demote between OWNER and WHITELISTED |
| View all org members | See roles and join dates |

**Grant Management:**
| Action | Details |
|--------|---------|
| Create grants | Title, description, requirements, funding pool, deadline, currency |
| Edit any grant in their org | Even grants created by whitelisted members |
| Add custom questions to grants | Text, textarea, select, multi-select, URL, number types |
| Reorder questions | Drag-and-drop sort order |
| Open / close / archive grants | Control grant lifecycle |
| Delete (soft) grants | Only if no applications exist. Otherwise archive. |
| Set grant visibility | Public (listed on discover) or private (invite-only link) |

**Application Management:**
| Action | Details |
|--------|---------|
| View all applications | For any grant in their org |
| See full application details | Project info, team, answers, files, cover note |
| See cross-grant visibility | Aggregated: how many grants this project applied to, total funding received, other grant names — no sensitive data |
| Change application status | Move to IN_REVIEW, ACCEPTED, REJECTED |
| Make final decisions | After reviewing all reviewer feedback |
| See all reviews + scores | For any application in their org |

**Collaboration:**
| Action | Details |
|--------|---------|
| Add grant collaborators | Assign VIEWER / EDITOR / REVIEWER roles per grant |
| Remove collaborators | Revoke grant-level access |
| Change collaborator roles | Upgrade/downgrade |
| Assign reviewers to applications | With conflict-of-interest auto-check |
| Unassign reviewers | Remove from review queue |

**Funding:**
| Action | Details |
|--------|---------|
| Record disbursements | Amount, currency, milestone, note |
| Update disbursement status | PENDING → COMPLETED / FAILED / CANCELLED |

### What They CANNOT Do

- Access other organizations' data
- See other orgs' internal reviews or application details
- Modify platform-level settings
- Grant themselves platform admin
- Delete an org (only platform admin can)

### Pages

```
/dashboard/[orgSlug]                              — Org overview (stats, recent activity)
/dashboard/[orgSlug]/grants                       — Grants list
/dashboard/[orgSlug]/grants/new                   — Create grant + add questions
/dashboard/[orgSlug]/grants/[grantId]             — Grant dashboard (application stats, review progress)
/dashboard/[orgSlug]/grants/[grantId]/edit        — Edit grant + questions
/dashboard/[orgSlug]/grants/[grantId]/applications          — Applications list + filters
/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]  — Application review page
/dashboard/[orgSlug]/grants/[grantId]/reviewers   — Assign/manage reviewers
/dashboard/[orgSlug]/grants/[grantId]/settings    — Grant permissions (collaborators)
/dashboard/[orgSlug]/members                      — Org member management
/dashboard/[orgSlug]/settings                     — Org settings
```

### Grant Creation Flow

```
Owner navigates to /dashboard/org-slug/grants/new
  → Fills: title, description, requirements, funding pool, currency, deadline
  → Adds custom questions:
      "What is your go-to-market plan?" (textarea, required)
      "Which category?" (select: DeFi/NFT/Infra, required)
      "Demo URL" (url, optional)
  → Reorders questions via drag-and-drop
  → Sets status = DRAFT (not visible yet)
  → Clicks "Publish" → status = OPEN, isPublic = true
  → Grant appears on /discover/grants
```

### Application Review Flow

```
Owner sees new applications on grant dashboard
  → Clicks into application
  → Reads: project info, team, answers to custom questions, files, cover note
  → Checks "Cross-Grant" tab:
      "Applied to 3 grants total"
      "Received $5,000 funding"
      "Also applied to: NFT Creators (Subnet Labs) — ACCEPTED"
  → Assigns 2-3 reviewers
  → Waits for reviews to come in
  → Sees all reviews: scores, decisions, feedback
  → Makes final decision: ACCEPTED / REJECTED
  → Applicant gets notified
```

---

## 4. ORGANIZATION WHITELISTED

### Who They Are

Trusted members who can create and manage grants within an org, but cannot manage the org itself (no adding/removing members, no changing roles).

### What They Can Do

Everything an Org Owner can do EXCEPT:

| Owner Can | Whitelisted Can | Difference |
|-----------|----------------|------------|
| Add/remove org members | **No** | Cannot manage membership |
| Change member roles | **No** | Cannot promote/demote |
| Edit org settings | **No** | Cannot change org name/logo/etc |
| Delete (archive) org | **No** | No org-level destructive actions |
| Create grants | **Yes** | Same as owner |
| Manage their own grants | **Yes** | Full control over grants they created |
| Manage ANY grant in org | **Yes** | Org-level role gives access to all grants |
| View/decide applications | **Yes** | Same as owner |
| Assign reviewers | **Yes** | Same as owner |
| Add grant collaborators | **Yes** | Same as owner |
| Record disbursements | **Yes** | Same as owner |

### Pages

Same as Org Owner, minus:
```
/dashboard/[orgSlug]/members    — Can VIEW but not ADD/REMOVE/CHANGE
/dashboard/[orgSlug]/settings   — Can VIEW but not EDIT
```

---

## 5. GRANT COLLABORATORS

These are per-grant roles. A user can be a VIEWER on Grant A and a REVIEWER on Grant B within the same org.

### 5A. Grant Viewer

**Purpose**: Read-only access. For stakeholders who need to monitor but not act.

| Can Do | Cannot Do |
|--------|-----------|
| View all applications for this grant | Change any application status |
| Read application details, answers, files | Assign or unassign reviewers |
| Read all reviews and scores | Submit reviews |
| View cross-grant visibility data | Edit grant details or questions |
| | Add or remove collaborators |
| | Record disbursements |

**Pages accessible** (read-only):
```
/dashboard/[orgSlug]/grants/[grantId]                       — Grant dashboard (view only)
/dashboard/[orgSlug]/grants/[grantId]/applications          — Applications list (view only)
/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]  — Application detail (view only)
```

### 5B. Grant Editor

**Purpose**: Manage the grant and its applications. Cannot submit reviews.

| Can Do | Cannot Do |
|--------|-----------|
| Edit grant details (title, description, requirements) | Submit reviews (that's the Reviewer role) |
| Edit grant questions (add, remove, reorder) | Manage org members |
| View all applications | Delete the grant |
| Change application status (IN_REVIEW, ACCEPTED, REJECTED) | Add grant collaborators (only owner/whitelisted) |
| View all reviews and scores | |
| View cross-grant visibility | |

**Pages accessible**:
```
/dashboard/[orgSlug]/grants/[grantId]                       — Grant dashboard
/dashboard/[orgSlug]/grants/[grantId]/edit                  — Edit grant + questions
/dashboard/[orgSlug]/grants/[grantId]/applications          — Applications list
/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]  — Application detail + status actions
```

### 5C. Grant Reviewer

**Purpose**: Review assigned applications. Cannot manage the grant or make final decisions.

| Can Do | Cannot Do |
|--------|-----------|
| See applications assigned to them | See applications NOT assigned to them |
| Read full application: project, team, answers, files | Change application status |
| View cross-grant visibility (limited) | Edit grant details or questions |
| Submit review: score (1-10) + decision + feedback | Assign/unassign other reviewers |
| Edit own review before final decision is made | See other reviewers' reviews (before own submission) |
| | Make final accept/reject decision |
| | Record disbursements |
| | Manage org members or collaborators |

**Pages accessible**:
```
/dashboard/[orgSlug]/grants/[grantId]                       — Grant dashboard (limited stats)
/dashboard/[orgSlug]/grants/[grantId]/applications          — Only ASSIGNED applications
/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]  — Review page (only if assigned)
```

### Reviewer Assignment Rules

1. An admin/owner assigns reviewers to specific applications
2. System auto-checks conflict of interest:
   - **Blocked**: Reviewer is the project owner
   - **Blocked**: Reviewer's email matches a project team member
   - **Warning**: Reviewer reviewed this project for another grant (admin must acknowledge)
3. Reviewer gets notified (in-app + email)
4. Reviewer sees application in their review queue
5. Reviewer submits: score + decision (APPROVE / REJECT / REQUEST_CHANGES) + feedback
6. After all reviewers submit, admin/owner sees all reviews → makes final decision

### Reviewer Flow

```
Reviewer gets notification: "You've been assigned to review AvaSwap DEX"
  → Clicks link → lands on application review page
  → Tabs: Project Info | Team | Answers | Files | Cross-Grants
  → Cross-Grants tab shows:
      "Applied to 3 grants | $5,000 received | Also: NFT Creators — ACCEPTED"
  → Fills review form:
      Score: 7/10
      Decision: Approve
      Feedback: "Strong technical approach, solid team..."
  → Submits review
  → Admin/owner gets notified
  → Reviewer can edit review until final decision is made
```

---

## 6. PLATFORM ADMIN

### Who They Are

Set via database only (`User.isPlatformAdmin = true`). Cannot be granted through the UI. This is the superuser for the entire platform.

### What They Can Do

| Action | Details |
|--------|---------|
| Everything any other role can do | Full access across all orgs |
| Create organizations | Set up new orgs on the platform |
| Delete (soft) organizations | Archive orgs |
| View all organizations | With member counts, grant counts |
| View all users | With their org memberships |
| View platform-wide stats | Total projects, applications, orgs, grants, acceptance rates |
| Browse audit log | Filter by actor, action, resource, date |
| Feature/unfeature projects | Toggle `isFeatured` on any project for discover page |

### What They CANNOT Do

- Grant themselves platform admin via UI (DB only)
- Hard-delete data (everything is soft delete)
- Access user passwords or tokens (auth is via BuilderHub)

### Pages

```
/admin                         — Platform overview (stats)
/admin/organizations           — All organizations
/admin/users                   — All users
/admin/audit-log               — Audit log viewer (filterable)
```

Plus: full access to every `/dashboard/[orgSlug]/...` page across all orgs.

---

## 7. PUBLIC (Unauthenticated)

### What They Can See

| Page | Content |
|------|---------|
| Landing page `/` | Hero, features, phases, FAQ |
| Discover projects `/discover` | Featured + accepted projects (toggle). Name, description, image, categories. |
| Project detail `/discover/projects/:id` | Public project info, team (names + roles only — no emails), updates feed, categories |
| Discover grants `/discover/grants` | Open grants with title, description, org name, deadline, funding pool |
| Grant detail `/discover/grants/:grantId` | Requirements, custom questions preview, "Login to Apply" CTA |
| FAQ `/faq` | FAQ content |

### What They CANNOT See

- Draft projects
- Application status, answers, or details
- Review scores or feedback
- Team member emails, social links
- Org dashboards
- Any admin pages
- File links (only on authenticated project detail page)

### What They Can Do

- Browse and search
- Read public project and grant information
- Log in via BuilderHub to become an Applicant

---

## 8. MULTI-ORG USER EXPERIENCE

A user can belong to multiple organizations with different roles:

```
Alice:
  ├── Avalanche Foundation → OWNER
  ├── Subnet Labs → WHITELISTED
  └── DeFi Alliance → (no org role, but REVIEWER on "DeFi Builders" grant)
```

### How It Works

**Org Switcher**: Dropdown in dashboard sidebar header. Shows all orgs the user belongs to. Click to switch — URL changes from `/dashboard/avalanche-foundation/...` to `/dashboard/subnet-labs/...`.

**Default Org**: Most recently visited (stored in localStorage). First-time users land on their first org.

**Role Resolution Per Page**:
```
User visits /dashboard/subnet-labs/grants/defi-builders/applications

System checks (in order):
  1. Is user Platform Admin? → full access
  2. Is user member of "Subnet Labs" org? → check OrgRole
     - OWNER → full access
     - WHITELISTED → full access to grants/applications
  3. Does user have GrantPermission on "defi-builders"? → check GrantRole
     - VIEWER → read-only
     - EDITOR → can manage
     - REVIEWER → only sees assigned applications
  4. None of the above → 403 Access Denied
```

**Sidebar Adapts to Role**:
```
OWNER sees:                    REVIEWER sees:
├── Overview                   ├── Overview
├── Grants                     └── Grants
│   └── [grant] →                  └── [grant] →
│       ├── Applications               └── My Reviews
│       ├── Reviewers
│       └── Settings
├── Members
└── Settings
```

---

## 9. NOTIFICATION RECIPIENTS BY ROLE

| Event | Applicant | Org Owner | Whitelisted | Editor | Reviewer |
|-------|-----------|-----------|-------------|--------|----------|
| Application submitted | — | Yes | Yes | Yes | — |
| Status → IN_REVIEW | Yes | — | — | — | — |
| Status → ACCEPTED | Yes | — | — | — | — |
| Status → REJECTED | Yes | — | — | — | — |
| Reviewer assigned | — | — | — | — | Yes |
| Review submitted | — | Yes | Yes | Yes | — |
| REQUEST_CHANGES | Yes | — | — | — | — |
| Invitation received | Yes (email) | — | — | — | — |
| Invitation accepted | — | Yes (inviter) | — | — | — |
| Grant deadline 48h | Yes (if has DRAFT) | — | — | — | — |
| Disbursement recorded | Yes | — | — | — | — |

---

## 10. STATUS LIFECYCLES

### Project Status

```
Created → Active (editable forever)
  │
  ├── Can be soft-deleted IF no applications exist
  │   (must withdraw all applications first)
  │
  └── Cannot be deleted if any application exists
      (onDelete: Restrict)
```

### Grant Status

```
DRAFT → OPEN → CLOSED → ARCHIVED
  │       │       │
  │       │       └── No new applications. Existing ones still reviewable.
  │       └── Accepting applications. Visible on discover if isPublic=true.
  └── Not visible. Still being set up (questions, requirements).

Can only soft-delete if: no applications exist.
Otherwise: must ARCHIVE (keeps applications intact).
```

### Application Status

```
DRAFT ──→ SUBMITTED ──→ IN_REVIEW ──→ ACCEPTED
  │           │              │           
  │           │              └──→ REJECTED
  │           │              
  │           └──→ WITHDRAWN (by applicant, any time before ACCEPTED)
  │
  └──→ WITHDRAWN (applicant discards draft)

Status transitions:
  DRAFT → SUBMITTED           (applicant submits)
  SUBMITTED → IN_REVIEW       (admin/editor moves to review)
  SUBMITTED → WITHDRAWN       (applicant withdraws)
  IN_REVIEW → ACCEPTED        (admin final decision)
  IN_REVIEW → REJECTED        (admin final decision)
  IN_REVIEW → WITHDRAWN       (applicant withdraws)
  
  ACCEPTED and REJECTED are final. No further transitions.
```

### Review Status

```
Assigned → Pending (reviewer hasn't submitted yet)
  │
  └──→ Submitted (score + decision + feedback)
         │
         └──→ Editable until admin makes final decision on the application
              After final decision → review is locked (immutable)
```

### Invitation Status

```
Created → Pending (email sent, waiting for response)
  │
  ├──→ Accepted (user clicked accept, membership/permission created)
  ├──→ Declined (user clicked decline)
  └──→ Expired (past expiresAt, never acted on)
```

---

## 11. CROSS-ROLE INTERACTION MAP

How different roles interact on the same application:

```
APPLICANT creates Project
  → Applies to Grant (owned by Org)
    → ORG OWNER/WHITELISTED sees application
      → Assigns REVIEWER(s)
        → REVIEWER submits review (score + decision + feedback)
          → ORG OWNER sees all reviews
            → Makes final decision (ACCEPTED/REJECTED)
              → APPLICANT gets notified
                → If ACCEPTED: ORG OWNER records disbursement
                  → APPLICANT sees funding on their dashboard

GRANT VIEWER can observe at any point but cannot act.
GRANT EDITOR can manage status but cannot submit reviews.
PLATFORM ADMIN can do everything above across all orgs.
```

---

## 12. PAGE ACCESS MATRIX

| Page | Public | Applicant | Reviewer | Editor | Whitelisted | Owner | Platform Admin |
|------|--------|-----------|----------|--------|-------------|-------|----------------|
| `/` Landing | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/discover` Projects | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/discover/projects/:id` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/discover/grants` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/discover/grants/:grantId` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/faq` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/invite/:token` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `/projects` My projects | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/projects/new` | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/projects/:id` Own project | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/projects/:id/apply` | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/applications` My apps | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/notifications` | — | Yes | Yes | Yes | Yes | Yes | Yes |
| `/dashboard/[org]` Overview | — | — | Limited | Yes | Yes | Yes | Yes |
| `/dashboard/[org]/grants` | — | — | Limited | Yes | Yes | Yes | Yes |
| `/dashboard/[org]/grants/new` | — | — | — | — | Yes | Yes | Yes |
| `/dashboard/[org]/grants/[g]/edit` | — | — | — | Yes | Yes | Yes | Yes |
| `/dashboard/[org]/grants/[g]/applications` | — | — | Assigned only | Yes | Yes | Yes | Yes |
| `/dashboard/[org]/grants/[g]/applications/[a]` | — | — | Assigned only | Yes | Yes | Yes | Yes |
| `/dashboard/[org]/grants/[g]/reviewers` | — | — | — | — | Yes | Yes | Yes |
| `/dashboard/[org]/grants/[g]/settings` | — | — | — | — | Yes | Yes | Yes |
| `/dashboard/[org]/members` | — | — | — | — | View only | Yes | Yes |
| `/dashboard/[org]/settings` | — | — | — | — | View only | Yes | Yes |
| `/admin` Platform stats | — | — | — | — | — | — | Yes |
| `/admin/organizations` | — | — | — | — | — | — | Yes |
| `/admin/users` | — | — | — | — | — | — | Yes |
| `/admin/audit-log` | — | — | — | — | — | — | Yes |

---

## 13. DATA VISIBILITY BY ROLE

What each role can see about an application:

| Data | Applicant (own) | Reviewer (assigned) | Editor | Owner/Whitelisted | Platform Admin |
|------|-----------------|---------------------|--------|-------------------|----------------|
| Project name, description | Yes | Yes | Yes | Yes | Yes |
| Team members (names, roles) | Yes | Yes | Yes | Yes | Yes |
| Team member emails/socials | Yes | Yes | Yes | Yes | Yes |
| Application answers | Yes | Yes | Yes | Yes | Yes |
| Cover note | Yes | Yes | Yes | Yes | Yes |
| File links | Yes | Yes | Yes | Yes | Yes |
| Application status | Yes | Yes | Yes | Yes | Yes |
| Funding requested | Yes | Yes | Yes | Yes | Yes |
| Cross-grant summary (aggregated) | — | Yes (limited) | Yes | Yes | Yes |
| Cross-grant detailed data | — | — | — | — | Yes |
| Other applicants to same grant | — | — | — | — | — |
| Reviews (own) | — | Yes | — | — | — |
| Reviews (all) | — | After submitting own | Yes | Yes | Yes |
| Review scores | — | After submitting own | Yes | Yes | Yes |
| Reviewer identities | — | — | Yes | Yes | Yes |
| Disbursement records | Yes (own) | — | — | Yes | Yes |
| Audit log | — | — | — | — | Yes |
