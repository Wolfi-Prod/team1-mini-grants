# All Page Routes

> 63 pages total. Generated 2026-04-19.

## Public / Marketing

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Home |
| `/showcase` | `app/showcase/page.tsx` | Showcase |
| `/showcase/[id]` | `app/showcase/[id]/page.tsx` | Showcase project detail |
| `/discover` | `app/discover/page.tsx` | Discover grants |
| `/discover/grants/[grantId]` | `app/discover/grants/[grantId]/page.tsx` | Grant detail |
| `/discover/projects/[id]` | `app/discover/projects/[id]/page.tsx` | Public project detail |
| `/challenges` | `app/challenges/page.tsx` | Challenges listing |
| `/challenges/[id]` | `app/challenges/[id]/page.tsx` | Challenge detail |
| `/hackathons` | `app/hackathons/page.tsx` | Hackathons listing |
| `/hackathons/[id]` | `app/hackathons/[id]/page.tsx` | Hackathon detail |
| `/faq` | `app/faq/page.tsx` | FAQ |
| `/login` | `app/login/page.tsx` | Login |
| `/search` | `app/search/page.tsx` | Search |

## Auth

| Route | File | Description |
|---|---|---|
| `/auth/callback` | `app/auth/callback/page.tsx` | Auth callback |
| `/onboarding` | `app/onboarding/page.tsx` | Onboarding |
| `/invite/[token]` | `app/invite/[token]/page.tsx` | Invite acceptance |

## User

| Route | File | Description |
|---|---|---|
| `/u/[handle]` | `app/u/[handle]/page.tsx` | User profile |
| `/notifications` | `app/notifications/page.tsx` | Notifications |
| `/invitations` | `app/invitations/page.tsx` | Invitations |
| `/settings/profile` | `app/settings/profile/page.tsx` | Profile settings |
| `/settings/account` | `app/settings/account/page.tsx` | Account settings |
| `/settings/notifications` | `app/settings/notifications/page.tsx` | Notification settings |
| `/organizations` | `app/organizations/page.tsx` | Organizations list |

## Projects

| Route | File | Description |
|---|---|---|
| `/projects` | `app/projects/page.tsx` | My projects |
| `/projects/new` | `app/projects/new/page.tsx` | New project |
| `/projects/[id]` | `app/projects/[id]/page.tsx` | Project detail |
| `/projects/[id]/edit` | `app/projects/[id]/edit/page.tsx` | Edit project |
| `/projects/[id]/apply` | `app/projects/[id]/apply/page.tsx` | Apply with project |
| `/projects/[id]/versions` | `app/projects/[id]/versions/page.tsx` | Project versions |
| `/projects/[id]/updates` | `app/projects/[id]/updates/page.tsx` | Project updates |
| `/projects/[id]/team` | `app/projects/[id]/team/page.tsx` | Project team |
| `/projects/[id]/files` | `app/projects/[id]/files/page.tsx` | Project files |

## Applications

| Route | File | Description |
|---|---|---|
| `/applications` | `app/applications/page.tsx` | My applications |
| `/applications/[id]` | `app/applications/[id]/page.tsx` | Application detail |
| `/applications/[id]/versions` | `app/applications/[id]/versions/page.tsx` | Application versions |

## Reviews

| Route | File | Description |
|---|---|---|
| `/reviews` | `app/reviews/page.tsx` | Reviews |
| `/reviews/dashboard` | `app/reviews/dashboard/page.tsx` | Review dashboard |
| `/reviews/[appId]` | `app/reviews/[appId]/page.tsx` | Review an application |

## Admin

| Route | File | Description |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Admin dashboard |
| `/admin/users` | `app/admin/users/page.tsx` | Manage users |
| `/admin/organizations` | `app/admin/organizations/page.tsx` | Manage organizations |
| `/admin/reviewers` | `app/admin/reviewers/page.tsx` | Manage reviewers |
| `/admin/audit-log` | `app/admin/audit-log/page.tsx` | Audit log |

## Org Dashboard

| Route | File | Description |
|---|---|---|
| `/dashboard/[orgSlug]` | `app/dashboard/[orgSlug]/page.tsx` | Org dashboard home |
| `/dashboard/[orgSlug]/settings` | `app/dashboard/[orgSlug]/settings/page.tsx` | Org settings |
| `/dashboard/[orgSlug]/members` | `app/dashboard/[orgSlug]/members/page.tsx` | Org members |
| `/dashboard/[orgSlug]/analytics` | `app/dashboard/[orgSlug]/analytics/page.tsx` | Org analytics |
| `/dashboard/[orgSlug]/digest` | `app/dashboard/[orgSlug]/digest/page.tsx` | Digest |
| `/dashboard/[orgSlug]/api-keys` | `app/dashboard/[orgSlug]/api-keys/page.tsx` | API keys |
| `/dashboard/[orgSlug]/webhooks` | `app/dashboard/[orgSlug]/webhooks/page.tsx` | Webhooks |

## Org Dashboard — Grants

| Route | File | Description |
|---|---|---|
| `/dashboard/[orgSlug]/grants` | `app/dashboard/[orgSlug]/grants/page.tsx` | Grants list |
| `/dashboard/[orgSlug]/grants/new` | `app/dashboard/[orgSlug]/grants/new/page.tsx` | New grant |
| `/dashboard/[orgSlug]/grants/templates` | `app/dashboard/[orgSlug]/grants/templates/page.tsx` | Grant templates |
| `/dashboard/[orgSlug]/grants/[grantId]` | `app/dashboard/[orgSlug]/grants/[grantId]/page.tsx` | Grant detail |
| `/dashboard/[orgSlug]/grants/[grantId]/edit` | `app/dashboard/[orgSlug]/grants/[grantId]/edit/page.tsx` | Edit grant |
| `/dashboard/[orgSlug]/grants/[grantId]/settings` | `app/dashboard/[orgSlug]/grants/[grantId]/settings/page.tsx` | Grant settings |
| `/dashboard/[orgSlug]/grants/[grantId]/embed` | `app/dashboard/[orgSlug]/grants/[grantId]/embed/page.tsx` | Grant embed |
| `/dashboard/[orgSlug]/grants/[grantId]/reviewers` | `app/dashboard/[orgSlug]/grants/[grantId]/reviewers/page.tsx` | Grant reviewers |
| `/dashboard/[orgSlug]/grants/[grantId]/analytics` | `app/dashboard/[orgSlug]/grants/[grantId]/analytics/page.tsx` | Grant analytics |
| `/dashboard/[orgSlug]/grants/[grantId]/questions` | `app/dashboard/[orgSlug]/grants/[grantId]/questions/page.tsx` | Grant questions |
| `/dashboard/[orgSlug]/grants/[grantId]/applications` | `app/dashboard/[orgSlug]/grants/[grantId]/applications/page.tsx` | Grant applications |
| `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]` | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/page.tsx` | Application detail |
| `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding` | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/funding/page.tsx` | Application funding |
| `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants` | `app/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]/cross-grants/page.tsx` | Cross-grant view |
