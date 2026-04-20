# Team1 Grants — System Design

> **Status:** frozen (architecture doc — revised only when the system model itself changes) · **Applies to:** backend + frontend
>
> **Prerequisites:** none — this is the root of the doc graph.
>
> **Out of scope** (pointers, not content):
> - Backend build order → [IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)
> - Frontend tier plan → [FRONTEND_IMPLEMENTATION_PLAN.md](FRONTEND_IMPLEMENTATION_PLAN.md)
> - Role × page matrix → [USER_AND_ROLE_FLOWS.md](USER_AND_ROLE_FLOWS.md)
> - Per-feature data models + flows → [specs/](../specs/) (e.g., [PROFILE_SYSTEM.md](../specs/PROFILE_SYSTEM.md), [HACKATHONS_CHALLENGES.md](../specs/HACKATHONS_CHALLENGES.md))
> - TODO API endpoints → [api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
>
> This document defines **what the system is** — architecture, schema, access control, APIs, security, and performance.

---

## 1. CURRENT STATE AUDIT

### Data Models (MongoDB/Mongoose)

**Submission** — monolithic document conflating user identity, team, project, and application status into one blob. Linked to users by email string, not FK. Team members embedded (not queryable). No indexes beyond `_id`.

**Admin** — flat list with `permissions: ['read','write','delete']` that is never checked. `grantedBy` is an email string. Hardcoded super admin in source code.

### What's Broken

| Issue | Severity |
|-------|----------|
| No referential integrity — email strings instead of FKs | Critical |
| No Organization, Grant, or Application entity | Critical |
| Permissions array is decorative — never enforced | High |
| No version history — edits overwrite in place | High |
| No soft delete — `findByIdAndDelete` is permanent | High |
| No indexes — linear scan on every filtered query | Medium |
| Regex search — ReDoS risk, can't use indexes | Medium |
| Hardcoded super admin email in source code | Medium |
| Single image only — no multi-file support | Medium |
| No standardized API error format | Low |

### Gap Analysis

| Requirement | Status |
|-------------|--------|
| Project-based architecture | **NO** — submission = project = application |
| Multi-tenant organizations | **NO** — no org concept |
| Per-grant permissions | **NO** — permissions exist but aren't enforced |
| Collaboration system | **NO** — admins are global, no roles |
| Version history | **NO** — overwrites in place |
| Review pipeline | **NO** — admin clicks accept/reject directly |
| Controlled visibility | **NO** — admins see everything or nothing |
| Discover toggles | **Partial** — no "featured" concept |
| Invitation flow | **NO** |
| Notifications | **NO** |
| Audit logging | **NO** |
| Grant-specific questions | **NO** |
| File attachments | **NO** — single image only |
| Funding tracking | **NO** |

---

## 2. TECH DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL | Relational data (orgs → grants → applications). Prisma needs it. Full-text search built in. |
| ORM | Prisma | Type-safe queries, migrations, relation handling |
| Auth | BuilderHub SSO | Shared identity across multiple Team1 systems. Provides `email` + `name`. We store addon data locally. |
| File storage | Cloudinary URLs | We store links, not binaries. Zero DB storage impact. |
| Soft deletes | `deletedAt` on core models | Prevent accidental data loss. Filter with `{ deletedAt: null }`. |
| API responses | Standardized `{ data }` / `{ error }` shape | Consistent frontend error handling. |

### Auth: BuilderHub SSO

BuilderHub provides `email` + `name` (and a `builderHubId`). Everything else is addon data stored locally.

```
BuilderHub Login → callback { email, name, builderHubId }
  → Find or create User by email
  → Create session
  → If first login → prompt to complete profile (telegram, country, etc.)
```

### File Storage

All files stored as external URLs. The `FileLink` model holds `name`, `url`, `type` — all strings. Actual files live on Cloudinary.

| What | Stored As |
|------|-----------|
| Project images | `Project.imageUrl` (string) |
| Pitch decks, docs | `FileLink.url` (string) |
| Org logos | `Organization.logoUrl` (string) |
| Profile pictures | `User.image` (string) |

---

## 3. PRISMA SCHEMA

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ───────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  builderHubId  String?   @unique
  image         String?
  telegram      String?
  country       String?
  state         String?
  walletAddress String?
  isPlatformAdmin Boolean @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  projects            Project[]
  organizationMembers OrganizationMember[]
  grantPermissions    GrantPermission[]
  reviewerAssignments ReviewerAssignment[]
  reviews             Review[]
  notifications       Notification[]
  auditLogs           AuditLog[] @relation("AuditActor")

  @@index([email])
  @@index([builderHubId])
  @@index([deletedAt])
}

// ─── ORGANIZATIONS ───────────────────────────

model Organization {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  logoUrl     String?
  websiteUrl  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  members     OrganizationMember[]
  grants      Grant[]
  invitations Invitation[]

  @@index([slug])
  @@index([deletedAt])
}

enum OrgRole {
  OWNER
  WHITELISTED
}

model OrganizationMember {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
  @@index([organizationId])
}

// ─── INVITATIONS ─────────────────────────────

enum InvitationType {
  ORGANIZATION
  GRANT
}

model Invitation {
  id             String         @id @default(cuid())
  email          String
  token          String         @unique @default(cuid())
  type           InvitationType
  organizationId String?
  grantId        String?
  orgRole        OrgRole?
  grantRole      GrantRole?
  invitedBy      String
  expiresAt      DateTime
  acceptedAt     DateTime?
  declinedAt     DateTime?
  createdAt      DateTime       @default(now())

  organization Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  grant        Grant?        @relation(fields: [grantId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([token])
  @@index([organizationId])
  @@index([grantId])
}

// ─── GRANTS ──────────────────────────────────

enum GrantStatus {
  DRAFT
  OPEN
  CLOSED
  ARCHIVED
}

model Grant {
  id             String      @id @default(cuid())
  organizationId String
  title          String
  slug           String
  description    String
  requirements   String?
  fundingPool    Decimal?    @db.Decimal(18, 2)
  currency       String      @default("USD")
  deadline       DateTime?
  status         GrantStatus @default(DRAFT)
  isPublic       Boolean     @default(false)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?

  organization Organization      @relation(fields: [organizationId], references: [id])
  applications Application[]
  permissions  GrantPermission[]
  questions    GrantQuestion[]
  invitations  Invitation[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([status])
  @@index([isPublic, status])
  @@index([deletedAt])
}

// ─── GRANT QUESTIONS ─────────────────────────

enum QuestionType {
  TEXT
  TEXTAREA
  SELECT
  MULTI_SELECT
  URL
  NUMBER
}

model GrantQuestion {
  id          String       @id @default(cuid())
  grantId     String
  label       String
  description String?
  type        QuestionType @default(TEXTAREA)
  options     String[]
  isRequired  Boolean      @default(true)
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())

  grant   Grant               @relation(fields: [grantId], references: [id], onDelete: Cascade)
  answers ApplicationAnswer[]

  @@index([grantId])
  @@index([grantId, sortOrder])
}

// ─── GRANT PERMISSIONS ───────────────────────

enum GrantRole {
  VIEWER
  EDITOR
  REVIEWER
}

model GrantPermission {
  id        String    @id @default(cuid())
  grantId   String
  userId    String
  role      GrantRole
  createdAt DateTime  @default(now())

  grant Grant @relation(fields: [grantId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([grantId, userId])
  @@index([userId])
  @@index([grantId])
}

// ─── PROJECTS ────────────────────────────────

model Project {
  id               String    @id @default(cuid())
  userId           String
  name             String
  description      String
  problemStatement String?
  imageUrl         String?
  categories       String[]
  websiteUrl       String?
  projectUrl       String?
  otherLinks       String[]
  isFeatured       Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  deletedAt        DateTime?

  user         User              @relation(fields: [userId], references: [id])
  teamMembers  ProjectTeamMember[]
  versions     ProjectVersion[]
  updates      ProjectUpdate[]
  applications Application[]
  fileLinks    FileLink[]

  @@index([userId])
  @@index([isFeatured])
  @@index([categories])
  @@index([deletedAt])
}

model ProjectTeamMember {
  id        String @id @default(cuid())
  projectId String
  name      String
  email     String
  role      String?
  github    String?
  twitter   String?
  linkedIn  String?

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([email])
}

model ProjectVersion {
  id        String   @id @default(cuid())
  projectId String
  version   Int
  snapshot  Json
  changedBy String
  changeLog String?
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, version])
  @@index([projectId])
}

model ProjectUpdate {
  id        String   @id @default(cuid())
  projectId String
  title     String
  content   String
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([createdAt])
}

model FileLink {
  id         String   @id @default(cuid())
  projectId  String
  name       String
  url        String
  type       String
  uploadedBy String
  createdAt  DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}

// ─── APPLICATIONS ────────────────────────────

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  ACCEPTED
  REJECTED
  WITHDRAWN
}

model Application {
  id               String            @id @default(cuid())
  projectId        String
  grantId          String
  status           ApplicationStatus @default(DRAFT)
  coverNote        String?
  fundingRequested Decimal?          @db.Decimal(18, 2)
  submittedAt      DateTime?
  decidedAt        DateTime?
  decidedBy        String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  project             Project              @relation(fields: [projectId], references: [id], onDelete: Restrict)
  grant               Grant                @relation(fields: [grantId], references: [id], onDelete: Restrict)
  answers             ApplicationAnswer[]
  versions            ApplicationVersion[]
  reviews             Review[]
  reviewerAssignments ReviewerAssignment[]
  disbursements       FundingDisbursement[]

  @@unique([projectId, grantId])
  @@index([grantId])
  @@index([projectId])
  @@index([status])
  @@index([grantId, status])
}

model ApplicationAnswer {
  id            String @id @default(cuid())
  applicationId String
  questionId    String
  answer        String

  application Application   @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  question    GrantQuestion  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([applicationId, questionId])
  @@index([applicationId])
}

model ApplicationVersion {
  id            String   @id @default(cuid())
  applicationId String
  version       Int
  snapshot      Json
  createdAt     DateTime @default(now())

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@unique([applicationId, version])
  @@index([applicationId])
}

// ─── REVIEWS ─────────────────────────────────

model ReviewerAssignment {
  id            String    @id @default(cuid())
  applicationId String
  reviewerId    String
  assignedBy    String
  assignedAt    DateTime  @default(now())
  dueDate       DateTime?

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  reviewer    User        @relation(fields: [reviewerId], references: [id], onDelete: Cascade)

  @@unique([applicationId, reviewerId])
  @@index([reviewerId])
  @@index([applicationId])
}

enum ReviewDecision {
  APPROVE
  REJECT
  REQUEST_CHANGES
}

model Review {
  id            String         @id @default(cuid())
  applicationId String
  reviewerId    String
  decision      ReviewDecision
  feedback      String
  score         Int?           @db.SmallInt
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  reviewer    User        @relation(fields: [reviewerId], references: [id], onDelete: Cascade)

  @@unique([applicationId, reviewerId])
  @@index([applicationId])
  @@index([reviewerId])
}

// ─── FUNDING ─────────────────────────────────

enum DisbursementStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

model FundingDisbursement {
  id            String             @id @default(cuid())
  applicationId String
  amount        Decimal            @db.Decimal(18, 2)
  currency      String             @default("USD")
  status        DisbursementStatus @default(PENDING)
  milestone     String?
  note          String?
  disbursedAt   DateTime?
  createdAt     DateTime           @default(now())

  application Application @relation(fields: [applicationId], references: [id], onDelete: Restrict)

  @@index([applicationId])
  @@index([status])
}

// ─── NOTIFICATIONS ───────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  link      String?
  isRead    Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
}

// ─── AUDIT LOG ───────────────────────────────

model AuditLog {
  id           String   @id @default(cuid())
  actorId      String
  action       String
  resourceType String
  resourceId   String
  metadata     Json?
  ipAddress    String?
  createdAt    DateTime @default(now())

  actor User @relation("AuditActor", fields: [actorId], references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([resourceType, resourceId])
  @@index([createdAt])
  @@index([action])
}
```

### Entity Relationship Summary

```
User ──1:N──> Project ──1:N──> Application <──N:1── Grant <──N:1── Organization
                                    │
                         ┌──────────┼──────────┐
                         ▼          ▼          ▼
                  ReviewerAssignment  Review  ApplicationAnswer
                                                    │
                                                    ▼
                                              GrantQuestion
```

### Soft Delete Rules

| Model | Strategy | Reason |
|-------|----------|--------|
| User, Organization, Grant, Project | `deletedAt` timestamp | Preserve history, prevent orphans |
| Application | `WITHDRAWN` status | Status is the lifecycle |
| Review, AuditLog | Never deleted | Immutable records |
| Application → Project/Grant FK | `onDelete: Restrict` | Can't delete parent with live applications |
| Everything else | `onDelete: Cascade` from parent | Versions, team members, file links follow parent |

---

## 4. ACCESS CONTROL

### Role Hierarchy

```
Platform Admin (User.isPlatformAdmin)
  └── Full access to everything. Set via DB only.

Organization Owner (OrgRole.OWNER)
  └── Full access to their org: grants, members, decisions

Organization Whitelisted (OrgRole.WHITELISTED)
  └── Create/manage grants in their org. Cannot manage org members.

Grant Collaborators (per-grant):
  ├── VIEWER   → Read applications + reviews
  ├── EDITOR   → Edit grant, manage application status
  └── REVIEWER → Submit reviews on assigned applications
```

### Permission Matrix

```
Permission          │ Platform │ Org    │ Org         │ Grant  │ Grant  │ Grant
                    │ Admin    │ Owner  │ Whitelisted │ Viewer │ Editor │ Reviewer
────────────────────┼──────────┼────────┼─────────────┼────────┼────────┼─────────
org:manage          │ Yes      │ Yes    │ No          │ No     │ No     │ No
grant:create        │ Yes      │ Yes    │ Yes         │ No     │ No     │ No
grant:edit          │ Yes      │ Yes    │ Yes         │ No     │ Yes    │ No
grant:delete        │ Yes      │ Yes    │ No          │ No     │ No     │ No
application:view    │ Yes      │ Yes    │ Yes         │ Yes    │ Yes    │ Yes
application:decide  │ Yes      │ Yes    │ Yes         │ No     │ Yes    │ No
review:submit       │ Yes      │ Yes    │ Yes         │ No     │ No     │ Yes
review:view         │ Yes      │ Yes    │ Yes         │ Yes    │ Yes    │ Yes
```

### Authorization Flow

```typescript
// lib/authorization.ts
// Called in every API route. Checks in order:
// 1. Platform admin → always yes
// 2. Org membership role → check permission
// 3. Grant-level permission → check permission
// 4. Default → deny

async function authorize(
  userId: string,
  permission: Permission,
  resource: { orgId?: string; grantId?: string }
): Promise<boolean>
```

### Conflict of Interest (Reviews)

When assigning a reviewer:
1. Reviewer is the project owner → **blocked**
2. Reviewer's email matches a team member → **blocked**
3. Reviewer reviewed same project for another grant → **warning** (admin acknowledges)

### Tenant Isolation

Every query on org-scoped data includes the org filter:
```typescript
// Always scope through the grant's organization
prisma.application.findMany({
  where: {
    grant: { organizationId: currentOrgId, deletedAt: null },
    status: 'SUBMITTED'
  }
});
```

---

## 5. API ROUTES

### Projects (User-owned)
```
POST   /api/projects                     — Create project
GET    /api/projects                     — List my projects
GET    /api/projects/:id                 — Get project detail
PATCH  /api/projects/:id                 — Update project (auto-creates version)
DELETE /api/projects/:id                 — Soft delete (blocked if has applications)
GET    /api/projects/:id/versions        — Version history
POST   /api/projects/:id/updates         — Post progress update
GET    /api/projects/:id/updates         — List updates
POST   /api/projects/:id/file-links      — Add file link
DELETE /api/projects/:id/file-links/:fid — Remove file link
```

### Applications
```
POST   /api/projects/:id/apply           — Apply to grant { grantId, answers[], coverNote }
GET    /api/applications                 — List my applications
GET    /api/applications/:id             — Application detail + answers
PATCH  /api/applications/:id             — Update (DRAFT only)
POST   /api/applications/:id/withdraw    — Withdraw
```

### Organizations
```
POST   /api/organizations                — Create org (platform admin)
GET    /api/organizations                — List my orgs
GET    /api/organizations/:orgSlug       — Org detail
PATCH  /api/organizations/:orgSlug       — Update org (owner)
POST   /api/organizations/:orgSlug/members     — Add member
DELETE /api/organizations/:orgSlug/members/:id — Remove member
PATCH  /api/organizations/:orgSlug/members/:id — Change role
```

### Invitations
```
POST   /api/invitations                  — Create (org or grant)
GET    /api/invitations/:token           — Get details (public, for accept page)
POST   /api/invitations/:token/accept    — Accept
POST   /api/invitations/:token/decline   — Decline
```

### Grants
```
POST   /api/organizations/:orgSlug/grants      — Create (owner/whitelisted)
GET    /api/organizations/:orgSlug/grants      — List org's grants
GET    /api/grants/:grantId                    — Public grant detail + questions
PATCH  /api/grants/:grantId                    — Update (editor+)
DELETE /api/grants/:grantId                    — Soft delete / archive
```

### Grant Questions
```
POST   /api/grants/:grantId/questions          — Add question
PATCH  /api/grants/:grantId/questions/:qid     — Edit
DELETE /api/grants/:grantId/questions/:qid     — Remove
PATCH  /api/grants/:grantId/questions/reorder  — Reorder
```

### Grant Permissions
```
POST   /api/grants/:grantId/permissions        — Add collaborator
DELETE /api/grants/:grantId/permissions/:id     — Remove
PATCH  /api/grants/:grantId/permissions/:id     — Change role
```

### Grant Applications (Admin side)
```
GET    /api/grants/:grantId/applications       — List applications
GET    /api/grants/:grantId/applications/:id   — Full detail
PATCH  /api/grants/:grantId/applications/:id/status — Final decision
GET    /api/grants/:grantId/applications/:id/cross-grants — Controlled visibility
```

### Reviews
```
POST   /api/grants/:grantId/applications/:id/reviewers      — Assign (with COI check)
DELETE /api/grants/:grantId/applications/:id/reviewers/:rid — Unassign
POST   /api/grants/:grantId/applications/:id/reviews        — Submit review
GET    /api/grants/:grantId/applications/:id/reviews        — List reviews
```

### Funding
```
POST   /api/applications/:id/disbursements     — Record disbursement
GET    /api/applications/:id/disbursements     — List
PATCH  /api/applications/:id/disbursements/:did — Update status
```

### Discover (Public)
```
GET    /api/discover/projects            — Featured + accepted
GET    /api/discover/projects/:id        — Public project detail + updates
GET    /api/discover/grants              — Open grants
```

### Notifications
```
GET    /api/notifications                — List (paginated)
PATCH  /api/notifications/:id/read       — Mark read
POST   /api/notifications/read-all       — Mark all read
GET    /api/notifications/unread-count   — Badge count
```

### Platform Admin
```
GET    /api/admin/stats                  — Platform stats
GET    /api/admin/organizations          — All orgs
GET    /api/admin/users                  — All users
GET    /api/admin/audit-log              — Filterable audit log
```

### API Response Format

```typescript
// Success
{ data: T, meta?: { total, page, limit, cursor } }

// Error
{ error: { code: "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "CONFLICT", message: string, fields?: Record<string, string> } }
```

### Controlled Visibility

`GET /cross-grants` returns aggregated, non-sensitive data only:

```json
{
  "totalGrantsApplied": 3,
  "totalFundingReceived": 12000,
  "otherGrants": [
    { "grantName": "DeFi Builders", "orgName": "Avalanche Foundation", "status": "ACCEPTED" }
  ]
}
```

Does NOT expose: application details, answers, feedback, scores, team emails, per-grant funding amounts.

---

## 6. FOLDER STRUCTURE

```
app/
├── (public)/                               # No auth
│   ├── page.tsx                            # Landing
│   ├── discover/
│   │   ├── page.tsx                        # Projects & grants
│   │   ├── projects/[id]/page.tsx          # Public project detail
│   │   └── grants/[grantId]/page.tsx       # Public grant detail
│   ├── invite/[token]/page.tsx             # Accept/decline invitation
│   └── faq/page.tsx
│
├── (auth)/                                 # Auth required (applicant)
│   ├── layout.tsx
│   ├── projects/
│   │   ├── page.tsx                        # My projects
│   │   ├── new/page.tsx                    # Create project
│   │   └── [id]/
│   │       ├── page.tsx                    # Project detail
│   │       ├── edit/page.tsx               # Edit
│   │       ├── apply/page.tsx              # Apply to grant
│   │       └── updates/page.tsx            # Manage updates
│   ├── applications/
│   │   ├── page.tsx                        # My applications
│   │   └── [id]/page.tsx                   # Application detail
│   └── notifications/page.tsx
│
├── (admin)/                                # Org admin
│   └── dashboard/[orgSlug]/                # Multi-org via URL slug
│       ├── layout.tsx                      # Org context + sidebar + switcher
│       ├── page.tsx                        # Org overview
│       ├── grants/
│       │   ├── page.tsx                    # Grants list
│       │   ├── new/page.tsx                # Create grant + questions
│       │   └── [grantId]/
│       │       ├── page.tsx                # Grant dashboard
│       │       ├── edit/page.tsx
│       │       ├── applications/
│       │       │   ├── page.tsx            # Applications list
│       │       │   └── [appId]/page.tsx    # Review application
│       │       ├── reviewers/page.tsx
│       │       └── settings/page.tsx       # Permissions
│       ├── members/page.tsx
│       └── settings/page.tsx
│
├── (platform-admin)/                       # Platform-level
│   └── admin/
│       ├── layout.tsx                      # isPlatformAdmin guard
│       ├── page.tsx                        # Stats
│       ├── organizations/page.tsx
│       ├── users/page.tsx
│       └── audit-log/page.tsx
│
├── api/                                    # See section 5
├── _components/                            # Shared (navbar, footer, org-switcher, notification-bell)
├── layout.tsx
├── providers.tsx
└── globals.css

lib/
├── prisma.ts                               # Singleton
├── prisma-helpers.ts                       # Soft delete filter, pagination
├── auth.ts                                 # BuilderHub SSO adapter
├── auth-client.ts                          # Client auth
├── authorization.ts                        # authorize() + permission matrix
├── review-guards.ts                        # COI checks
├── notifications.ts                        # notify() helper
├── audit.ts                                # logAudit() helper
├── api-response.ts                         # success() / error()
├── cloudinary.ts                           # Upload
├── email.ts                                # Nodemailer
└── utils.ts

hooks/
├── use-session.ts
├── use-projects.ts
├── use-applications.ts
├── use-grants.ts
├── use-reviews.ts
├── use-organization.ts
├── use-notifications.ts
└── use-org-context.ts                      # Current org from URL slug
```

---

## 7. SECURITY

| Area | Design |
|------|--------|
| **Authorization** | `authorize()` in every route. Deny by default. |
| **Tenant isolation** | All admin queries scope through `organizationId`. |
| **Soft deletes** | Core models use `deletedAt`. `onDelete: Restrict` on Application FKs. |
| **Input validation** | Zod on every POST/PATCH. Prisma enums at DB level. |
| **Search** | PostgreSQL full-text search, not regex. |
| **Rate limiting** | `@upstash/ratelimit` on public endpoints. |
| **Audit** | `AuditLog` with `onDelete: SetNull` — survives entity deletion. |
| **File safety** | URL validation on file links. Cloudinary handles actual storage. |
| **Platform admin** | `isPlatformAdmin` set via DB only, never via API. |

---

## 8. PERFORMANCE (30k applications, 100 orgs)

### Indexing

All indexes defined in schema. Key query paths:
- `Application(grantId, status)` — filter apps by grant + status
- `Project(userId)` — user's projects
- `Project(isFeatured)` — discover featured
- `Grant(isPublic, status)` — public listings
- `Notification(userId, isRead)` — unread badge
- `AuditLog(resourceType, resourceId)` — resource history

### Pagination

- **Cursor-based** for feeds and large lists (applications, notifications)
- **Offset-based** for admin dashboards under 10k rows

### Caching

- React Query: 30s staleTime for dashboard, 5min for discover
- Next.js ISR: 60s for discover, 300s for public grant detail
- Prisma connection pool: `pool_size=10`

### Full-Text Search

```sql
ALTER TABLE "Project" ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED;
CREATE INDEX idx_project_search ON "Project" USING GIN (search_vector);
```

---

## 9. NOTIFICATION EVENTS

| Event | Recipients | Channel |
|-------|-----------|---------|
| Application submitted | Grant editors + org owners | In-app + email |
| Application status changed | Project owner | In-app + email |
| Reviewer assigned | Reviewer | In-app + email |
| Review submitted | Grant editors + org owners | In-app |
| REQUEST_CHANGES decision | Project owner | In-app + email |
| Invitation received | Invitee | Email |
| Invitation accepted | Inviter | In-app |
| Grant deadline 48h away | Applicants with DRAFT apps | Email |
| Disbursement recorded | Project owner | In-app + email |
