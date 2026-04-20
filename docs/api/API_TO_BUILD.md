# API Endpoints To Build

> **Status:** living (append a row whenever a new `// API:` comment lands in code) · **Applies to:** backend team
>
> **Prerequisites** (read first):
> - [../planning/SYSTEM_REDESIGN.md](../planning/SYSTEM_REDESIGN.md) — schema + entity relationships
> - [../planning/USER_AND_ROLE_FLOWS.md](../planning/USER_AND_ROLE_FLOWS.md) — permissions each endpoint must enforce
> - [../planning/IMPLEMENTATION_PHASES.md](../planning/IMPLEMENTATION_PHASES.md) — backend build order
>
> **Out of scope** (pointers, not content):
> - Frontend page order → [../planning/FRONTEND_IMPLEMENTATION_PLAN.md](../planning/FRONTEND_IMPLEMENTATION_PLAN.md)
> - Per-feature flows driving the endpoints → [../specs/](../specs/)
> - Response shape details for specific features → the matching spec in `specs/`
>
> **Backend work queue.** Every row is an endpoint the frontend needs but doesn't yet have. Populated as pages are built. Source of truth for the backend team when they start wiring real data.

---

## Conventions

- All endpoints under `/api/*`
- `Content-Type: application/json` unless marked **FormData** (file uploads)
- Auth: every authenticated route expects a session cookie (mechanism TBD by new backend — BuilderHub SSO per spec)
- Standard error shape: `{ error: string, code?: string }` with appropriate HTTP status (400, 401, 403, 404, 409, 500)
- Standard list response: `{ data: T[], total: number, page: number, limit: number }`
- Standard timestamps: ISO 8601 strings (`createdAt`, `updatedAt`)
- Soft deletes: `deletedAt: string | null` — never hard delete
- IDs: string prefixes — `user_`, `org_`, `proj_`, `grant_`, `app_`, `review_`, `inv_`, `notif_`, `disb_`, `audit_`

## How this doc is maintained

Every time a new page is built, any `// API: ...` comment added in the code also gets logged here in the matching domain section. If an endpoint already exists in the table, mark the new page as an additional caller under **Used by**. Do not duplicate rows.

---

## Status legend

- **TODO** — frontend calls it, backend hasn't built it
- **IN PROGRESS** — backend is actively building
- **DONE** — backend shipped; frontend still using mock until swap
- **WIRED** — frontend calls the real endpoint (mock removed)

---

## 1. Auth & Session

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/auth/builderhub/start` | Begin BuilderHub SSO flow. Returns the URL the browser should redirect to. May accept `?redirect=/path` to remember the post-login destination. | `app/login/page.tsx` | query: `redirect?: string` | `{ redirectUrl: string }` |
| TODO | GET | `/api/auth/builderhub/callback` | BuilderHub SSO callback. Exchanges code, upserts `User` by email, creates session cookie, redirects to `/onboarding` (first login) or `redirect` param. | BuilderHub redirect target | query: `code: string`, `state: string` | 302 redirect |
| TODO | POST | `/api/auth/signout` | Clears the session cookie. | Navbar "Sign out" (Page 0) | — | `{ ok: true }` |

## 2. Users & Profile

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/me` | Return current authenticated user + org memberships + role info. Drives navbar, dashboards, and permission gating. | Every authenticated page (server + client) | — | `{ user: User, orgMemberships: OrganizationMember[] }` |
| TODO | PUT | `/api/me/profile` | Upsert profile fields. `handle` must be globally unique and match `^[a-z0-9-]{3,32}$`; `bio` allows empty or >=10 chars. | `app/settings/profile/_components/ProfileSettingsForm.tsx`, `app/onboarding/*` | body: `Partial<{ name, handle, bio, telegram, country, state, walletAddress, isProfilePublic }>` | `{ user: User }` |
| TODO | DELETE | `/api/me` | Soft-delete the current user (sets `deletedAt`, scrubs PII: name / telegram / wallet / bio set to null). Blocked (409 `HAS_LIVE_APPLICATIONS`) when the user has applications not in WITHDRAWN or REJECTED state. Projects stay so existing orgs keep their audit trail. | `app/settings/account/_components/DeleteAccountCard.tsx` | — | `{ ok: true }` or `{ error, code: "HAS_LIVE_APPLICATIONS", liveApplicationCount: number }` |

## 3. Organizations

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/me/organizations` | Orgs the current user belongs to, with role + member count + grants count + open grants count per row. | `app/organizations/page.tsx` | — | `{ data: { org: Organization, role: OrganizationMemberRole, memberCount: number, grants: number, openGrants: number }[] }` |
| TODO | GET | `/api/organizations` | Full org list. Platform-admin only — same shape as `/api/me/organizations` but without the role (since admins aren't members). | `app/organizations/page.tsx` (admin branch) | query: `search?`, `limit?`, `page?` | `{ data: { org: Organization, memberCount, grants, openGrants }[], total, page, limit }` |
| TODO | PATCH | `/api/organizations/:orgId` | Edit org profile (name / slug / description / website / logo). Owner-only. Slug changes create a 30-day redirect for old URLs. | `app/dashboard/[orgSlug]/settings/_components/OrgSettingsForm.tsx` | body: `Partial<{ name, slug, description, websiteUrl, logoUrl }>` | `{ org: Organization }` |
| TODO | DELETE | `/api/organizations/:orgId` | Soft-delete the org. Owner-only. Blocked (409 `HAS_LIVE_GRANTS`) if any grant status is not ARCHIVED. | same form (danger zone) | — | `{ ok: true }` or `{ error, code: "HAS_LIVE_GRANTS", liveGrantCount: number }` |

## 4. Organization Members

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/organizations/:orgId/members` | Member list with denormalized user info. Org-member or platform-admin only. | `app/dashboard/[orgSlug]/members/page.tsx` | — | `{ data: { membership: OrganizationMember, user: { id, name, email, handle } }[] }` |
| TODO | PATCH | `/api/organizations/:orgId/members/:memberId` | Change an existing member's role. Enforces at-least-one-OWNER invariant (409 `LAST_OWNER`). | `app/dashboard/[orgSlug]/members/_components/ManageMembersPanel.tsx` | body: `{ role: OrgRole }` | `{ membership: OrganizationMember }` or `{ error, code: "LAST_OWNER" }` |
| TODO | DELETE | `/api/organizations/:orgId/members/:memberId` | Remove a member. Same LAST_OWNER guard. Grants / applications they created stay on the org. | same panel | — | `{ ok: true }` or `{ error, code: "LAST_OWNER" }` |
| TODO | POST | `/api/organizations/:orgId/invitations` | Create an Invitation row targeting an email. Frontend shows a toast — the member doesn't appear until they accept via `/invite/<token>`. | same panel (invite modal) | body: `{ email: string, orgRole: OrgRole }` | `{ invitation: Invitation }` |

## 5. Grants

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/discover/grants/:grantId` | Public grant detail — only returns `isPublic=true` and non-draft grants. 404 otherwise. | `app/discover/grants/[grantId]/page.tsx` | — | `{ grant: Grant, organization: Organization }` |
| TODO | GET | `/api/discover/grants` | Public grants list with spotlight filters and search/meta filters. Already referenced from Discover. | `app/discover/page.tsx` | query: `spotlight?`, `status?`, `minFunding?`, `maxFunding?`, `deadline?`, `orgId?`, `search?` | `{ data: Grant[], total }` |
| TODO | GET | `/api/organizations/:orgId/grants/:grantId` | Full grant record for org admins (includes DRAFT + non-public grants). Platform admin + org members only. | `app/dashboard/[orgSlug]/grants/[grantId]/page.tsx` (dashboard), `app/dashboard/[orgSlug]/grants/[grantId]/edit/page.tsx` | — | `{ grant: Grant }` |
| TODO | PATCH | `/api/organizations/:orgId/grants/:grantId` | Edit grant (title, description, requirements, funding pool, deadline, status, flags). Also archive via `status: "ARCHIVED"`. | `app/dashboard/[orgSlug]/grants/[grantId]/edit/_components/EditGrantForm.tsx`, archive button on dashboard | body: `Partial<{ title, slug, description, requirements, fundingPool, currency, deadline, status, isPublic, isFlagship, spotlightRank }>` | `{ grant: Grant }` |
| TODO | GET | `/api/organizations/:orgId/grants/:grantId/stats` | Aggregated dashboard stats: pipeline counts per `ApplicationStatus`, funding requested sum, funding committed (sum of accepted), reviewer assignment counts. | `app/dashboard/[orgSlug]/grants/[grantId]/page.tsx` | — | `{ pipeline: Record<ApplicationStatus, number>, fundingRequested, fundingCommitted, assignments: { total, pending, completed, reviewers } }` |
| TODO | GET | `/api/organizations/:orgId/grants/:grantId/analytics` | Grant analytics payload: funnel counts, category breakdown (grouped by first project category), per-reviewer performance (assigned/completed/avgScore/avgLatencyDays), and avgDecisionDays (submit→decided). | `app/dashboard/[orgSlug]/grants/[grantId]/analytics/page.tsx` | — | `{ funnel: Record<ApplicationStatus, number>, categories: { name, count }[], reviewers: { reviewerId, assigned, completed, avgScore, avgLatencyDays }[], avgDecisionDays: number \| null, acceptRate: number \| null }` |
| TODO | GET | `/api/organizations/:orgId/analytics` | Org-wide rolled-up analytics. Funnel + categories across every grant the org runs, per-grant leaderboard, total disbursed, avg decision time. | `app/dashboard/[orgSlug]/analytics/page.tsx` | — | `{ totals: { activeGrants, applications, disbursed, poolTotal, avgDecisionDays }, funnel: Record<ApplicationStatus, number>, categories: { name, count }[], perGrant: { grantId, title, total, accepted, pending, status, fundingPool }[] }` |

## 6. Grant Questions

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/discover/grants/:grantId/questions` | Public questions preview for a grant, so applicants can see what they'll answer before starting the form. | `app/discover/grants/[grantId]/page.tsx` | — | `{ data: GrantQuestion[] }` |
| TODO | GET | `/api/grants/:grantId/questions` | Full questions list for org admins (includes sortOrder). | `app/dashboard/[orgSlug]/grants/[grantId]/questions/page.tsx` | — | `{ data: GrantQuestion[] }` |
| TODO | POST | `/api/grants/:grantId/questions` | Add a question. Server assigns sortOrder = current length. SELECT / MULTI_SELECT require ≥2 options. | `app/dashboard/[orgSlug]/grants/[grantId]/questions/_components/ManageQuestionsPanel.tsx` | body: `{ label, description?: string \| null, type: QuestionType, options: string[], isRequired: boolean }` | `{ question: GrantQuestion }` |
| TODO | PATCH | `/api/grants/:grantId/questions/:questionId` | Edit a question in place. | same panel | body: `Partial<{ label, description, type, options, isRequired }>` | `{ question: GrantQuestion }` |
| TODO | DELETE | `/api/grants/:grantId/questions/:questionId` | Remove a question. Server renumbers remaining sortOrder. Existing applications keep their answers (ApplicationAnswer rows are preserved). | same panel | — | `{ ok: true }` |
| TODO | POST | `/api/grants/:grantId/questions/reorder` | Persist a new order after drag / up / down. | same panel | body: `{ order: string[] }` (array of question ids in new sortOrder) | `{ data: GrantQuestion[] }` |

## 7. Grant Permissions (Collaborators)

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/grants/:grantId/permissions` | Per-grant collaborator list. Org member or platform admin only. | `app/dashboard/[orgSlug]/grants/[grantId]/settings/page.tsx` | — | `{ data: { permission: GrantPermission, user: { id, name, email } }[] }` |
| TODO | POST | `/api/grants/:grantId/permissions` | Add a collaborator by userId. Server rejects (409 `ALREADY_ASSIGNED`) if this user already has a permission on this grant. | `app/dashboard/[orgSlug]/grants/[grantId]/settings/_components/GrantPermissionsPanel.tsx` | body: `{ userId: string, role: GrantRole }` | `{ permission: GrantPermission }` |
| TODO | PATCH | `/api/grants/:grantId/permissions/:permissionId` | Change a collaborator's role. | same panel | body: `{ role: GrantRole }` | `{ permission: GrantPermission }` |
| TODO | DELETE | `/api/grants/:grantId/permissions/:permissionId` | Remove a collaborator. Their existing reviews stay. | same panel | — | `{ ok: true }` |

## 8. Projects

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/projects` | List projects. `ownerId=me` for "My projects"; other filters for admin and org dashboards. Supports search, status, sort. | `app/projects/page.tsx`, future dashboards | query: `ownerId?`, `search?`, `status?` (derived from applications), `sort?: "newest" \| "oldest" \| "az" \| "za"`, `limit?`, `page?` | `{ data: Project[], total, page, limit }` |
| TODO | GET | `/api/projects/:id` | Full project detail (with team, files, updates, versions, applications). Access: owner + project collaborators + any platform admin + org users reviewing a live application from this project. | `app/projects/[id]/page.tsx` | — | `{ project: Project, team: ProjectTeamMember[], files: FileLink[], updates: ProjectUpdate[], versions: ProjectVersion[], applications: Application[] }` |
| TODO | GET | `/api/projects/:id/team` | Team members for a project. Stand-alone endpoint so Tier 2 team management page can reload it without refetching the full project. | `app/projects/[id]/page.tsx`, future `/projects/[id]/team` | — | `{ data: ProjectTeamMember[] }` |
| TODO | GET | `/api/projects/:id/files` | File links attached to a project. | `app/projects/[id]/page.tsx`, future `/projects/[id]/files` | — | `{ data: FileLink[] }` |
| TODO | GET | `/api/projects/:id/updates` | Progress updates for a project, newest first. | `app/projects/[id]/page.tsx`, future `/projects/[id]/updates` | query: `sort?: "newest" \| "oldest"` | `{ data: ProjectUpdate[] }` |
| TODO | DELETE | `/api/projects/:id` | Soft-delete a project. Blocked if any non-withdrawn applications exist. | `app/projects/page.tsx` (delete menu) | — | `{ ok: true }` or `{ error, code: "HAS_APPLICATIONS" }` |
| TODO | POST | `/api/projects` | Create a new project owned by the current user. Also writes the first `ProjectVersion` snapshot. The frontend uploads files via `POST /api/upload` first and passes the returned URLs here. | `app/projects/new/page.tsx` | `{ name: string, description: string, problemStatement?: string, categories: string[], logoUrl: string, bannerUrl: string, imageUrls: string[], websiteUrl: string, projectUrl: string, otherLinks: string[], contractAddresses: string[] }` | `{ project: Project }` |
| TODO | PATCH | `/api/projects/:id` | Update project fields. Owner-only (platform admin override). Writes a new `ProjectVersion` snapshot on every successful PATCH (IMPLEMENTATION_PHASES.md §2A). Also used by the detail page for `archivedAt` + per-section visibility toggles; payload is a partial — the frontend only sends changed fields. The edit form uploads newly-picked assets via `POST /api/upload` first and passes the returned URLs here. | `app/projects/[id]/edit/_components/EditProjectForm.tsx`, `app/projects/[id]/_components/ProjectActions.tsx` (archive/unarchive), `app/projects/[id]/_components/SectionVisibilityToggle.tsx` | body: `Partial<{ name, description, problemStatement, categories, logoUrl \| null, bannerUrl \| null, imageUrls, websiteUrl, projectUrl, otherLinks, contractAddresses, visibility, hiddenSections, archivedAt: string \| null }>` | `{ project: Project, version: ProjectVersion }` |

## 9. Project Team Members

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | POST | `/api/projects/:id/team` | Add a team member to a project. Owner-only. Email must be unique within the project — 409 on duplicate. | `app/projects/[id]/team/_components/ManageTeamPanel.tsx` | body: `{ name: string, email: string, role?: string \| null, github?: string \| null, twitter?: string \| null, linkedIn?: string \| null }` | `{ member: ProjectTeamMember }` |
| TODO | PATCH | `/api/projects/:id/team/:memberId` | Update a team member in place. Owner-only. Same uniqueness rule on `email`. | `app/projects/[id]/team/_components/ManageTeamPanel.tsx` | body: `Partial<{ name, email, role, github, twitter, linkedIn }>` | `{ member: ProjectTeamMember }` |
| TODO | DELETE | `/api/projects/:id/team/:memberId` | Remove a team member. Owner-only. | `app/projects/[id]/team/_components/ManageTeamPanel.tsx` | — | `{ ok: true }` |

## 10. Project Files

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | POST | `/api/projects/:id/files` | Attach a file link (external URL) to a project. Owner-only. URL must be unique within the project — 409 on duplicate. No file upload in this endpoint; the file itself is hosted wherever the user already put it. | `app/projects/[id]/files/_components/ManageFilesPanel.tsx` | body: `{ name: string, url: string, type: string }` | `{ file: FileLink }` |
| TODO | PATCH | `/api/projects/:id/files/:fileId` | Update a file link in place (rename, swap URL, change type). Owner-only. | `app/projects/[id]/files/_components/ManageFilesPanel.tsx` | body: `Partial<{ name, url, type }>` | `{ file: FileLink }` |
| TODO | DELETE | `/api/projects/:id/files/:fileId` | Detach a file link from the project. Does not delete the remote file. Owner-only. | `app/projects/[id]/files/_components/ManageFilesPanel.tsx` | — | `{ ok: true }` |

## 11. Project Updates

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | POST | `/api/projects/:id/updates` | Post a progress update to a project. Owner-only. | `app/projects/[id]/updates/_components/ManageUpdatesPanel.tsx` | body: `{ title: string, content: string }` (body >= 20 chars) | `{ update: ProjectUpdate }` |
| TODO | PATCH | `/api/projects/:id/updates/:updateId` | Edit a posted update. Owner-only. | same panel | body: `Partial<{ title, content }>` | `{ update: ProjectUpdate }` |
| TODO | DELETE | `/api/projects/:id/updates/:updateId` | Remove an update. Owner-only. Existing applications that referenced it are not affected. | same panel | — | `{ ok: true }` |

## 12. Project Versions

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/projects/:id/versions` | Version history for a project, newest first. Same access rule as the project detail (owner + platform admin + org-with-application). | `app/projects/[id]/versions/page.tsx` | — | `{ data: ProjectVersion[] }` |
| TODO | GET | `/api/projects/:id/versions/:version` | Single version snapshot. Useful when the frontend wants to diff two versions without fetching every row. | same page (on-demand expand) | — | `{ version: ProjectVersion }` |

## 13. Applications

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/applications` | List applications. Common filters: `projectIds[]` (for My Projects counts), `grantId` (for Org Applications module), `reviewerId=me` (for Review module), `status[]`. | `app/projects/page.tsx` (counts), future `/applications`, future dashboards | query: `projectIds?`, `grantId?`, `reviewerId?`, `status?`, `sort?`, `limit?`, `page?` | `{ data: Application[], total, page, limit }` |
| TODO | POST | `/api/applications` | Create a new application for a project against a grant. Server assigns `DRAFT` or `SUBMITTED` depending on payload. | `app/projects/[id]/apply/_components/ApplyForm.tsx` | body: `{ projectId, grantId, coverNote, fundingRequested? }` | `{ application: Application }` |

## 14. Application Answers

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | POST | `/api/applications/:id/answers` | Bulk-write answers for an application. Called right after `POST /api/applications` returns. | `app/projects/[id]/apply/_components/ApplyForm.tsx` | body: `{ answers: [{ questionId, answer }] }` | `{ answers: ApplicationAnswer[] }` |
| TODO | GET | `/api/applications/:id/versions` | Full version history for an application. Access rule: applicant, platform admin, or member of the grant-running org. Returns newest first; backend writes a snapshot every time the applicant submits or resubmits. | `app/applications/[id]/versions/page.tsx` | — | `{ data: ApplicationVersion[] }` |
| TODO | GET | `/api/applications/:id/versions/:version` | Single version snapshot (useful for diffing without refetching the full history). Same access rule. | same page (details expansion) | — | `{ version: ApplicationVersion }` |
| TODO | GET | `/api/cross-grants` | Phase 4C Controlled Visibility endpoint. Given an applicantId + a grantId the requester is reviewing, returns the applicant's OTHER grant applications in aggregate form only. Explicitly excludes answers, reviewer feedback, scores, and reviewer identities from the response. ACL: requester must have `application:view` on the calling grant. | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants/page.tsx` | query: `applicantId: string`, `excludeApplicationId?: string` | `{ applicant: { id, name }, totals: { totalApplications, accepted, fundingReceived }, otherApplications: { id, grantId, grantTitle, orgName, status, submittedAt, fundingRequested, receivedFromThisGrant }[] }` |

## 15. Reviews

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| _no endpoints logged yet_ | | | | | | |

## 16. Review Assignments

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/me/reviewer-assignments` | Current user's assignment list with filterable `status`. | `app/reviews/page.tsx`, `app/reviews/dashboard/page.tsx` | query: `status?: "pending" \| "completed"` | `{ data: ReviewerAssignment[] }` |
| TODO | GET | `/api/me/reviewer-stats` | Aggregated performance stats across every grant the current user has ever reviewed on: pending / completed counts, avg score, avg turnaround days, decision distribution. | `app/reviews/dashboard/page.tsx` | — | `{ pending, completed, overdue, avgScore, avgTurnaroundDays, decisionCounts: { APPROVE, REJECT, REQUEST_CHANGES } }` |
| TODO | GET | `/api/grants/:grantId/reviewer-assignments` | Full reviewer assignment list for a grant, used by the org admin reviewers page. | `app/dashboard/[orgSlug]/grants/[grantId]/reviewers/page.tsx` | — | `{ data: ReviewerAssignment[] }` |
| TODO | POST | `/api/grants/:grantId/reviewer-assignments` | Assign a reviewer to one application. Server enforces: reviewer ≠ applicant, reviewer ≠ already-assigned on the same application. | `app/dashboard/[orgSlug]/grants/[grantId]/reviewers/_components/ReviewersPanel.tsx` | body: `{ applicationId: string, reviewerId: string, dueDate?: string \| null }` | `{ assignment: ReviewerAssignment }` |
| TODO | DELETE | `/api/grants/:grantId/reviewer-assignments/:assignmentId` | Unassign a reviewer. Blocked if the reviewer has already submitted a Review (409 returned). | same panel | — | `{ ok: true }` or `{ error, code: "REVIEW_SUBMITTED" }` |
| TODO | GET | `/api/admin/reviewers` | Cross-platform reviewer directory for the admin audit page. Aggregates assignments / reviews / COI signals per reviewer. Platform-admin only. | `app/admin/reviewers/page.tsx` | query: `coiOnly?: "true"` | `{ data: { reviewerId, name, email, handle, assigned, completed, avgScore, avgLatencyDays, coiFlags: { kind, applicationId, detail }[] }[] }` |
| TODO | GET | `/api/admin/reviewers/:reviewerId/coi-signals` | Full COI signal detail for a single reviewer (surface for drill-down). Platform-admin only. | future admin drill-down | — | `{ data: { kind, applicationId, detail, resolvedAt?: string }[] }` |

## 17. Invitations

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/invites/:token` | Public invite detail by token. No auth required. 404 for unknown / revoked tokens (intentionally doesn't distinguish). Response excludes `invitedBy.email` to prevent scraping. | `app/invite/[token]/page.tsx` | — | `{ invitation: Invitation, organization?: Organization, grant?: Grant, grantOrganization?: Organization, invitedBy: { id, name } }` |
| TODO | POST | `/api/invites/:token/accept` | Accept an invite. Requires the authenticated viewer's email to match the invite email (else 403). On success: creates `OrganizationMember` or `GrantPermission`, sets `acceptedAt`, returns the destination URL. | `app/invite/[token]/_components/InviteActions.tsx` | — | `{ invitation: Invitation, destination: string }` |
| TODO | POST | `/api/invites/:token/decline` | Decline an invite. Same email match rule. Sets `declinedAt`. | `app/invite/[token]/_components/InviteActions.tsx` | — | `{ invitation: Invitation }` |
| TODO | GET | `/api/me/invitations` | All invitations sent to the current user's email, both pending and past. Frontend buckets by `invitationState` (PENDING / ACCEPTED / DECLINED / EXPIRED). | `app/invitations/page.tsx` | — | `{ data: Invitation[] }` |

## 18. Notifications

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/me/notifications` | Current user's notifications, newest first. | `app/notifications/page.tsx` | query: `filter?: "all" \| "unread" \| "read"` (optional server-side filter; client-side also works) | `{ data: Notification[] }` |
| TODO | PATCH | `/api/me/notifications/:id` | Mark a single notification read (or unread). | `app/notifications/_components/NotificationsPanel.tsx` | body: `{ isRead: boolean }` | `{ notification: Notification }` |
| TODO | POST | `/api/me/notifications/read-all` | Mark every unread notification read. | `app/notifications/_components/NotificationsPanel.tsx` | — | `{ updatedCount: number }` |
| TODO | GET | `/api/me/notification-preferences` | Current per-event notification channel preferences. | `app/settings/notifications/page.tsx` (Page 38) | — | `{ preferences: Record<NotificationEventType, { email: boolean, inApp: boolean }> }` |
| TODO | PUT | `/api/me/notification-preferences` | Save notification channel preferences. | `app/settings/notifications/page.tsx` (Page 38) | body: `{ preferences: Record<NotificationEventType, { email: boolean, inApp: boolean }> }` | `{ preferences: ... }` |
| TODO | GET | `/api/organizations/:orgId/digest/settings` | Read this org's digest cadence + sections + recipients. | `app/dashboard/[orgSlug]/digest/page.tsx` | — | `{ cadence: "off"\|"daily"\|"weekly", day?: string, timeUtc?: string, recipients: "owners"\|"all", sections: { newApps, pendingReviews, deadlines, stats } }` |
| TODO | PUT | `/api/organizations/:orgId/digest/settings` | Save digest config. | `app/dashboard/[orgSlug]/digest/_components/DigestSettingsForm.tsx` | body: same shape as GET | same shape |
| TODO | GET | `/api/organizations/:orgId/digest/preview` | Compute what the next digest would contain without sending. Used by the live preview card. | same form | — | `{ newApplications, pendingReviews, deadlinesSoon: { id, title, deadline }[] }` |
| TODO | POST | `/api/organizations/:orgId/digest/send-now` | Queue an immediate digest send to the configured recipients (ignores cadence). Returns 202. | same form | — | `{ ok: true }` |
| TODO | GET | `/api/organizations/:orgId/webhooks` | List registered webhooks for an org. Secrets are masked — see create/rotate for plain-text. | `app/dashboard/[orgSlug]/webhooks/page.tsx` | — | `{ data: { id, url, events, secretMasked, enabled, lastDeliveredAt, lastStatus, createdAt }[] }` |
| TODO | POST | `/api/organizations/:orgId/webhooks` | Register a webhook. Backend generates a signing secret and returns it **once**. HTTPS-only URL validation. | `app/dashboard/[orgSlug]/webhooks/_components/WebhooksPanel.tsx` | body: `{ url: string, events: WebhookEvent[] }` | `{ webhook: { ... }, secret: string }` |
| TODO | PATCH | `/api/organizations/:orgId/webhooks/:webhookId` | Update URL / events / enabled flag. | same panel | body: `Partial<{ url, events, enabled }>` | `{ webhook: { ... } }` |
| TODO | POST | `/api/organizations/:orgId/webhooks/:webhookId/test` | Fire a synthetic test event to the registered URL. | same panel | body: `{ event?: WebhookEvent }` (defaults to application.submitted) | `{ delivery: { status: "OK" \| "FAILED", httpStatus?: number } }` |
| TODO | POST | `/api/organizations/:orgId/webhooks/:webhookId/rotate-secret` | Generate + return a new signing secret. Old secret continues working for 60s for graceful cutover. | same panel | — | `{ secret: string }` |
| TODO | DELETE | `/api/organizations/:orgId/webhooks/:webhookId` | Remove a webhook. Drops all in-flight retries. | same panel | — | `{ ok: true }` |
| TODO | GET | `/api/organizations/:orgId/api-keys` | List API keys. Plaintext never returned — only prefix + metadata. | `app/dashboard/[orgSlug]/api-keys/page.tsx` | — | `{ data: { id, name, prefix, scope, lastUsedAt, createdAt, revokedAt }[] }` |
| TODO | POST | `/api/organizations/:orgId/api-keys` | Mint a new key. Returns the plaintext **once**; server stores a hash. | `app/dashboard/[orgSlug]/api-keys/_components/ApiKeysPanel.tsx` | body: `{ name: string, scope: "read" \| "read-write" }` | `{ key: { id, name, prefix, scope, createdAt }, plaintext: string }` |
| TODO | DELETE | `/api/organizations/:orgId/api-keys/:keyId` | Revoke a key (soft — sets `revokedAt`). Permanent; any client using it starts getting 401. | same panel | — | `{ ok: true }` |
| TODO | GET | `/api/embed/grants/:grantId` | Server-rendered iframe-safe grant widget. Accepts `?theme=light\|dark` + `?compact=1` query params. CSP allows cross-origin embedding. Cached 60s at the edge. | `app/dashboard/[orgSlug]/grants/[grantId]/embed/_components/EmbedConfigurator.tsx` | query: `theme?`, `compact?` | HTML (not JSON) |
| TODO | GET | `/api/embed/grants/:grantId/stats` | JSON endpoint for the drop-in script to poll live counts without reloading the iframe. | same (script-tag variant) | — | `{ openApplicationCount: number, daysRemaining: number \| null, fundingPool: number \| null, status: GrantStatus }` |
| TODO | GET | `/api/organizations/:orgId/grant-templates` | List template sources — in the first cut this is every non-deleted grant owned by this org. Later iteration adds a dedicated `GrantTemplate` model so users don't have to pull from live grants. | `app/dashboard/[orgSlug]/grants/templates/page.tsx` | — | `{ data: { id, title, requirements, currency, fundingPool, isFlagship, questionCount, status, createdAt }[] }` |
| TODO | POST | `/api/organizations/:orgId/grant-templates/:templateId/clone` | Clone a template into a new DRAFT grant. Copies description / requirements / funding / questions / flags; resets title / slug / deadline. Returns the new grant id so the caller can redirect to its edit screen. | `app/dashboard/[orgSlug]/grants/templates/_components/TemplatesPanel.tsx` | — | `{ grant: Grant, questions: GrantQuestion[] }` |

## 19. Disbursements

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/applications/:appId/disbursements` | Per-application disbursement history. Org admin + applicant themselves only. | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding/page.tsx` | — | `{ data: FundingDisbursement[] }` |
| TODO | POST | `/api/applications/:appId/disbursements` | Record a new disbursement. Only allowed when `application.status === "ACCEPTED"` (409 `NOT_ACCEPTED` otherwise). | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding/_components/DisbursementsPanel.tsx` | body: `{ amount: number, currency: string, status: DisbursementStatus, milestone?: string \| null, note?: string \| null, disbursedAt?: string \| null }` | `{ disbursement: FundingDisbursement }` |
| TODO | PATCH | `/api/applications/:appId/disbursements/:disbursementId` | Edit an existing disbursement. Same NOT_ACCEPTED guard as POST. | same panel | body: `Partial<{ amount, currency, status, milestone, note, disbursedAt }>` | `{ disbursement: FundingDisbursement }` |
| TODO | DELETE | `/api/applications/:appId/disbursements/:disbursementId` | Remove a disbursement. Backend logs an audit entry even though the row is hard-deleted — totals should match the historical audit trail. | same panel | — | `{ ok: true }` |

## 20. File Upload

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | POST | `/api/upload` | Upload a file (image, PDF, deck) to object storage (Cloudinary per spec). Returns a public URL the frontend stores as a string on the target entity (`Project.imageUrl`, `FileLink.url`, `Organization.logoUrl`, `User.image`). | `app/projects/new/page.tsx` (image — mock uses URL input for now), future `/projects/[id]/files`, `/settings/profile` | `multipart/form-data`: `file: File`, `purpose?: "project-image" \| "project-file" \| "org-logo" \| "avatar"` | `{ url: string, name: string, type: string, size: number }` |

## 20b. Global Search

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/search` | Full-text search across Projects / Grants / Applications / Users / Organizations. Respects viewer ACLs — never returns resources the requester can't see. Postgres `tsvector` + GIN index per Phase 5D. | `app/search/_components/SearchPanel.tsx` | query: `q: string` (min 2 chars), `scope?: "all" \| "projects" \| "grants" \| "applications" \| "users" \| "orgs"`, `limit?: number` | `{ projects: SearchProject[], grants: SearchGrant[], applications: SearchApplication[], users: SearchUser[], orgs: SearchOrg[], totals: Record<scope, number> }` |

## 21. Discover (Public Feeds)

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| TODO | GET | `/api/discover/grants` | Public feed of open grants. Drives landing "Open grants" strip and the `/discover` page. Must support `spotlight` param to fetch flagship / focus / all tiers separately. | `app/page.tsx` (landing), `app/discover/page.tsx` (sections + filters) | query: `spotlight?: "flagship" \| "focus" \| "other"`, `status?`, `isPublic?`, `limit?`, `page?`, `search?`, `orgId?`, `minFunding?`, `maxFunding?`, `deadline?: "7" \| "30" \| "90" \| "any"` | `{ data: Grant[], total, page, limit }` |
| TODO | GET | `/api/showcase/projects` | Public feed of projects. `featured=true` drives the Showcase Featured strip; full feed drives the A–Z list with filters. | `app/showcase/page.tsx` | query: `featured?`, `search?`, `categories?: string[]`, `funded?: "yes" \| "no" \| "any"`, `sort?: "az" \| "za" \| "newest" \| "oldest"`, `limit?`, `page?` | `{ data: Project[], total, page, limit }` |
| TODO | GET | `/api/discover/projects/:id` | Public project detail. Same access rules as the page itself: PRIVATE + ARCHIVED return 404 unless the viewer is a platform admin or an org that received an application from this project (then full detail). Response respects per-section visibility (omits hidden sections for non-privileged viewers). | `app/discover/projects/[id]/page.tsx` | — | `{ project: Project, team?: ProjectTeamMember[], files?: FileLink[], updates?: ProjectUpdate[], applications?: Application[] }` (each optional payload is omitted when the section is hidden) |

### Schema additions required — `Project` (Prisma)

The `/projects/new` form requires the following changes to the `Project` model. `imageUrl` is replaced; `bannerUrl`, `imageUrls`, and `contractAddresses` are new.

```prisma
model Project {
  // ... existing fields
  // REMOVE: imageUrl String?
  logoUrl           String?         // square logo
  bannerUrl         String?         // single banner image (3:1)
  imageUrls         String[]        // gallery pictures
  contractAddresses String[]        // deployed contract addresses across any chain
}
```

The form enforces logo + banner + at least one picture + website + project URL as required. The backend should match those constraints on `POST /api/projects`. DB columns are nullable so legacy rows don't break.

### Schema additions required — `Grant` (Prisma)

The frontend needs two new optional columns on `Grant` to support the Discover section model:

```prisma
model Grant {
  // ... existing fields
  isFlagship    Boolean  @default(false)  // exactly one row = true across the whole platform (the Team1 Minigrant)
  spotlightRank Int?                      // non-null = "In focus" spotlight; rank orders the strip
}
```

Plus a category system on `Grant` is missing (the filter UI shows a placeholder note). Recommended:
```prisma
model Grant {
  categories  String[]
}
```
Until that lands, the Discover category filter will stay visible-but-inert.

## 22. Platform Admin

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| _no endpoints logged yet_ | | | | | | |

## 23. Audit Log

| Status | Method | Path | Purpose | Used by | Request | Response |
|---|---|---|---|---|---|---|
| _no endpoints logged yet_ | | | | | | |

---

## Cross-cutting concerns (for backend to decide up front)

These apply across many endpoints. Frontend will assume sensible defaults; backend should decide and document the real answers here.

- **Pagination**: page + limit, or cursor-based? Default: `?page=1&limit=20`, max limit 100.
- **Sorting**: `?sort=field&order=asc|desc`. Default per endpoint documented inline.
- **Filtering**: query params for simple filters; POST body for complex filters (arrays of tags, date ranges).
- **File uploads**: `multipart/form-data`, max 10 MB per file (to confirm), allowed types per endpoint.
- **Rate limits**: TBD. Assume generous during dev.
- **CORS**: same-origin (Next.js app owns `/api/*`).
- **Caching**: GET endpoints should return `Cache-Control` headers appropriate to data volatility.
- **Idempotency**: PUT/DELETE idempotent; POST creates get an `Idempotency-Key` header (to confirm).
- **Permissions**: every authenticated endpoint checks role per [USER_AND_ROLE_FLOWS.md §12](../planning/USER_AND_ROLE_FLOWS.md).
- **Audit logging**: every mutation writes to audit log automatically (backend middleware).
