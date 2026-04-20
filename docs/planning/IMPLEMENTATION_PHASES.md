# Implementation Phases — Team1 Grants Platform

> **Status:** frozen (backend build order — revised only when priorities shift) · **Applies to:** backend (Prisma + auth + API)
>
> **Prerequisites** (read first):
> - [SYSTEM_REDESIGN.md](SYSTEM_REDESIGN.md) — full schema, API design, access control, architecture
>
> **Out of scope** (pointers, not content):
> - Frontend page ship order → [FRONTEND_IMPLEMENTATION_PLAN.md](FRONTEND_IMPLEMENTATION_PLAN.md)
> - Role × permission matrix the backend enforces → [USER_AND_ROLE_FLOWS.md](USER_AND_ROLE_FLOWS.md)
> - Per-endpoint request/response shapes → [../api/API_TO_BUILD.md](../api/API_TO_BUILD.md)
>
> This document is the **backend build order** — what to do, in what sequence, and what depends on what. Complementary to FRONTEND_IMPLEMENTATION_PLAN.md which tracks the UI axis.

---

## Phase 1: MUST DO NOW

Foundation that makes every future phase easy. Zero new features — restructure only.

### 1A. PostgreSQL + Prisma

- Set up PostgreSQL (Neon or Supabase)
- Install Prisma, create initial schema mirroring current Submission + Admin models
- Write data migration script (see 1E below)
- Replace all Mongoose queries with Prisma
- Remove `mongoose`, `mongodb` packages

### 1B. BuilderHub Auth Adapter

- Bridge BuilderHub SSO (`email`, `name`, `builderHubId`) → local `User` record
- On login: find or create User by email, create session, return token
- Addon data (telegram, country, wallet) filled in later via `PATCH /api/users/me`

### 1C. Soft Deletes

- Add `deletedAt DateTime?` to `User`, `Project` from day 1
- Create `lib/prisma-helpers.ts` with `const active = { deletedAt: null }`
- Every query includes `...active` in WHERE

### 1D. Standardized API Responses

- Create `lib/api-response.ts` with `success()` and `error()` helpers
- Refactor all existing routes to use them
- Consistent shape: `{ data }` or `{ error: { code, message, fields? } }`

### 1E. Data Migration Script

Steps:
1. Export unique emails from MongoDB Submissions
2. Cross-reference with BuilderHub user list
3. Create `User` records in PostgreSQL with `userId`
4. Convert Submission docs → `Project` rows with proper `userId` FK
5. Split embedded `teamMembers` → `ProjectTeamMember` rows (deduplicate by email)
6. Map old `projectId` (truncated UUID) → new cuid (keep lookup table for redirects)

Rollback plan: MongoDB stays untouched. Migration reads from Mongo, writes to Postgres. If it fails, revert API routes via git.

**Depends on**: Nothing

---

## Phase 2: UPGRADE CURRENT SYSTEM

Improve what exists. No new entities beyond what supports current features.

### 2A. Project Versioning

- Add `ProjectVersion` model
- On every `PATCH /api/projects/:id`, snapshot current state before applying changes
- Version history viewable on project detail page

### 2B. Project Updates

- Add `ProjectUpdate` model
- Users post progress updates (title + content) after submission
- Shows on project detail page (public + owner view)

### 2C. File Links

- Add `FileLink` model — stores `name`, `url`, `type` (all strings, zero storage impact)
- Users attach links (pitch deck URL, whitepaper URL, demo video URL)
- Cloudinary upload happens client-side, we save the returned URL

### 2D. Featured Projects

- Add `isFeatured` flag to `Project`
- Platform admins toggle featured status
- Discover page: Featured | All Accepted toggle

### 2E. Audit Log

- Add `AuditLog` model
- Create `lib/audit.ts` with `logAudit()` helper
- Log all state-changing operations from this phase onward
- Uses `onDelete: SetNull` on actor FK — survives user deletion

**Depends on**: Phase 1

---

## Phase 3: MUST HAVES

Core new features that make this a multi-tenant grant platform.

### 3A. Organizations

- Add `Organization`, `OrganizationMember` models
- Build org CRUD API
- Dashboard routes become `/dashboard/[orgSlug]/...` (multi-org URL structure)
- Build org switcher component for users in multiple orgs
- Seed "Team1" organization, migrate current admins → `OrganizationMember` with OWNER role
- Remove old `PlatformAdmin` model (replaced by `User.isPlatformAdmin` + org roles)

### 3B. Grants

- Add `Grant` model (belongs to Organization)
- Build grant CRUD API under `/api/organizations/:orgSlug/grants`
- Grant lifecycle: DRAFT → OPEN → CLOSED → ARCHIVED
- Public grant listing + detail pages
- Soft delete via `deletedAt`

### 3C. Applications

- Add `Application` model — the Project ↔ Grant junction
- Build apply flow: select project → write cover note → submit
- Same project can apply to multiple grants (`@@unique([projectId, grantId])`)
- `onDelete: Restrict` on both FKs — can't delete project/grant with live applications
- Application status: DRAFT → SUBMITTED → IN_REVIEW → ACCEPTED/REJECTED/WITHDRAWN
- Build applicant's application tracking page
- Build grant admin's application list view

### 3D. Access Control (RBAC)

- Add `GrantPermission` model
- Implement `authorize()` in `lib/authorization.ts`
- Add auth checks to every API route (retrofit phases 1-3)
- Build collaborator management UI in grant settings
- Enforce org roles: OWNER vs WHITELISTED
- Set `isPlatformAdmin` via DB seed — remove hardcoded super admin email
- Add `@upstash/ratelimit` on public endpoints

**Depends on**: Phase 1, Phase 2

---

## Phase 4: SHOULD HAVE

Important features. Can soft-launch without them but need them soon.

### 4A. Review System

- Add `ReviewerAssignment`, `Review` models
- Assign multiple reviewers per application
- Build reviewer queue page (pending / completed tabs)
- Review form: score (1-10) + decision (approve/reject/request changes) + feedback
- Admin view: see all reviews for an application → make final decision

### 4B. Grant-Specific Questions

- Add `GrantQuestion`, `ApplicationAnswer` models
- Grant creators define custom questions (text, textarea, select, URL, number)
- Questions have sort order and required flag
- Applicants answer during apply flow
- Reviewers see answers alongside project details

### 4C. Controlled Visibility

- Build `/cross-grants` endpoint
- Returns aggregates only: total grants applied, total funding received, other grant names + status
- Does NOT expose: answers, feedback, scores, team emails, per-grant funding
- Only accessible by users with `application:view` permission on the grant

### 4D. Invitations

- Add `Invitation` model
- Invite by email — works for users who don't have accounts yet
- Token-based accept flow with expiry
- On accept: create `OrganizationMember` or `GrantPermission`
- Send invitation email with secure link

**Depends on**: Phase 3

---

## Phase 5: GOOD TO HAVE

Polish, scale, and safety features.

### 5A. Notifications

- Add `Notification` model
- Build notification bell component with unread count badge
- Trigger on: status changes, reviewer assignments, review submissions, invitations
- In-app + email delivery

### 5B. Application Versioning

- Add `ApplicationVersion` model
- Auto-snapshot on every application update
- Admins see what changed between resubmissions

### 5C. Conflict of Interest Checks

- Implement `canAssignReviewer()` in `lib/review-guards.ts`
- Block: reviewer is project owner or team member
- Warn: reviewer reviewed same project for another grant
- Admin must acknowledge warning before proceeding

### 5D. Full-Text Search

- Add PostgreSQL tsvector column on Project (name + description)
- GIN index for fast search
- Replace current regex-based search

### 5E. Performance Tuning

- Cursor-based pagination on high-volume endpoints
- React Query staleTime configs (30s dashboard, 5min discover)
- ISR for public pages
- Prisma connection pool sizing

**Depends on**: Phase 4

---

## Phase 6: ADDONS

Build when needed.

### 6A. Funding Disbursement Tracking
- Add `FundingDisbursement` model
- Record actual payments against accepted applications
- Milestone-based disbursements
- Makes "total funding received" in controlled visibility accurate

### 6B. Audit Log Viewer
- Platform admin UI for browsing audit log
- Filter by action, actor, resource, date range
- CSV export

### 6C. Email Digests
- Weekly summary for org admins: new applications, pending reviews, deadlines
- Per-user preference: daily / weekly / off

### 6D. Webhook Integration
- Org admins register webhook URLs
- Events: application submitted, status changed, review completed
- Enables Slack/Discord integration

### 6E. Analytics Dashboard
- Application funnel visualization
- Reviewer performance metrics
- Category breakdown charts
- Time-to-decision tracking

### 6F. Public API
- Rate-limited endpoints for ecosystem tools
- API key management
- OpenAPI documentation

### 6G. Grant Embed Widget
- Server-side rendered iframe-safe view of a single grant
- Includes live application count + remaining pool + deadline countdown
- Configurable via query params (`?theme=light` / `?compact=1`)
- Content-Security-Policy allows embedding from arbitrary origins
- Drives traffic from org websites back into Discover

### 6H. Grant Templates
- Save a grant configuration (questions, pool, requirements) as a reusable template on the org
- Clone into a new `Grant` when running a similar program again
- Org-scoped, not global — each org keeps its own library

**Depends on**: Phase 5

---

## Phase Summary

| Phase | What | Depends On |
|-------|------|------------|
| **1. Must Do Now** | PostgreSQL + Prisma + soft deletes + BuilderHub auth + API format + data migration | — |
| **2. Upgrade Current** | Versioning + updates + file links + featured toggle + audit log | Phase 1 |
| **3. Must Haves** | Organizations + grants + applications + RBAC | Phase 1, 2 |
| **4. Should Have** | Reviews + custom questions + controlled visibility + invitations | Phase 3 |
| **5. Good to Have** | Notifications + app versioning + COI checks + search + performance | Phase 4 |
| **6. Addons** | Funding tracking + audit viewer + digests + webhooks + analytics + public API | Phase 5 |
