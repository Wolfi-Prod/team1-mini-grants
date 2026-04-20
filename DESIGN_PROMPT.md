# Backyard — Full Site Design Prompt

Paste this into Claude, v0, Lovable, Bolt, or Cursor to generate every page of the Backyard platform with consistent design, mock data, and working interactions.

---

## DESIGN SYSTEM

### Tokens

```
--bg: #F5F2E9
--ink: #12110D
--muted: #8A8472
--line: #12110D
--soft: #E5DFCD
--accent: #FF394A
--nav-h: 58px
--footer-h: 58px
--rail-w: 44px
--pad-x: clamp(28px, 4.4vw, 68px)
--ease: cubic-bezier(.22, .61, .36, 1)
--ease-smooth: cubic-bezier(0.65, 0.05, 0.36, 1)
```

Dark mode (body.dark): `--bg: #12110D`, `--ink: #F5F2E9`, `--muted: #6E685B`, `--line: #F5F2E9`, `--soft: #2B2922`. Description text becomes `#B8B1A1`.

### Fonts

- **Fraunces** (serif): weights 300/400/500/600, italic. Used for all display headings, page titles, card titles, hero text, form labels (large).
- **JetBrains Mono**: weights 300/400/500. Used for nav links, buttons, labels, kickers, metadata, tags, table headers, form labels (small), status badges.

### Typography Scale

- Page title (h1): Fraunces 400, clamp(28px, 4vw, 44px), line-height 1.1, letter-spacing -0.01em
- Section heading (h2): Fraunces 400, clamp(24px, 3vw, 34px)
- Card title (h3): Fraunces 400, 20-24px
- Body text: 15-16px, line-height 1.55, color var(--ink)
- Description/muted text: 14-15px, color #4a4739 (light) or #B8B1A1 (dark)
- Label/kicker: JetBrains Mono 10px, letter-spacing 0.22em, uppercase, color var(--muted)
- Button text: JetBrains Mono 11px, letter-spacing 0.18em, uppercase
- Table header: JetBrains Mono 10px, letter-spacing 0.16em, uppercase, color var(--muted)
- Badge: JetBrains Mono 10px, letter-spacing 0.14em, uppercase

### Page Chrome (applies to EVERY page)

1. Body background: var(--bg), no padding, edge-to-edge
2. `.page` wrapper: min-height 100vh, flex column, background var(--bg)
3. Nav: 58px height, border-bottom 1px solid var(--line). Left: 10x10 accent square + "Backyard" (mono 12px). Center: Home, Showcase, Challenges, Grants links (mono 11px, active has accent underline). Right: search icon, profile icon (SVG), Dark/Light toggle buttons.
4. Footer: 58px height, border-top 1px solid var(--line). Left: 28px round accent circle with white italic "N" + "Backyard (c) 2026" (mono 11px). Right: "FAQ", "Run a grant", pulsing accent dot + "Live".

### Component Patterns

**Buttons:**
- `.btn`: JetBrains Mono 11px uppercase, letter-spacing 0.18em, padding 15px 26px, 1px border var(--line), transition 0.25s var(--ease-smooth)
- `.btn--primary`: bg var(--ink), color var(--bg). Hover: bg var(--accent), color white.
- `.btn--ghost`: transparent. Hover: bg var(--ink), color var(--bg).
- `.btn--danger`: transparent, border var(--accent), color var(--accent). Hover: bg var(--accent), color white.
- `.btn--sm`: padding 10px 18px, font-size 10px.

**Cards:**
- Border 1px solid var(--line), no border-radius, no shadow, background transparent
- Header: border-bottom 1px, padding 20px 24px. Title in Fraunces 20px. Description in mono 11px muted.
- Body: padding 24px
- Footer: border-top 1px, padding 16px 24px

**Tables:**
- No outer border, thead has border-bottom 1px
- th: JetBrains Mono 10px, letter-spacing 0.16em, uppercase, color var(--muted), padding 12px 16px
- td: 14px, padding 14px 16px, border-bottom 1px solid var(--soft)
- Row hover: background var(--soft)

**Badges:**
- Border 1px, JetBrains Mono 10px, letter-spacing 0.14em, uppercase, padding 3px 8px
- Default: border var(--line), color var(--ink)
- Inverted: bg var(--ink), color var(--bg)
- Accent: border var(--accent), color var(--accent)
- Muted: border var(--soft), color var(--muted)

**Form Inputs:**
- Border 1px solid var(--soft), no border-radius, padding 12px 14px, font-size 14px
- Label: JetBrains Mono 10px, letter-spacing 0.18em, uppercase, color var(--muted), margin-bottom 6px
- Focus: border-color var(--accent)
- Error: border-color var(--accent), error text in mono 10px var(--accent)

**Empty State:**
- Centered, padding 80px 24px
- Icon: 48px muted
- Title: Fraunces 20px
- Description: 14px muted, max-width 360px
- Action button below

**Page Header:**
- Border-bottom 1px solid var(--line), padding 24px var(--pad-x)
- Title: Fraunces clamp(24px, 4vw, 40px), weight 400
- Description: 14px, color var(--muted)
- Breadcrumbs: JetBrains Mono 11px, letter-spacing 0.08em, uppercase, color var(--muted)
- Actions: right-aligned buttons

**Sidebar (Dashboard/Admin):**
- Width 240px, border-right 1px solid var(--line)
- Title: JetBrains Mono 11px, bold, uppercase, tracking 0.08em, padding 16px, border-bottom 1px
- Group label: JetBrains Mono 9px, letter-spacing 0.14em, uppercase, color var(--muted), padding 12px 16px 4px
- Link: JetBrains Mono 11px, letter-spacing 0.08em, uppercase, padding 10px 16px, border-left 2px transparent
- Active link: border-left var(--ink), bg var(--ink), color var(--bg)
- Hover: border-left var(--line), color var(--ink)

**Stat Card:**
- Border 1px solid var(--line), padding 20px 24px
- Value: Fraunces 28-32px, weight 400
- Label: JetBrains Mono 10px, letter-spacing 0.2em, uppercase, color var(--muted)

**Mock API Badge:**
- Collapsible details element, border 1px dashed var(--soft), padding 8px 12px
- Summary: JetBrains Mono 9px, letter-spacing 0.14em, uppercase, color var(--muted)
- Endpoints: JetBrains Mono 11px, normal case, color var(--muted)

**Pixel Cursor:**
Custom crosshair cursor via SVG data URI in accent color. Pointer variant for clickable elements. Disabled on mobile under 620px.

---

## PAGES TO BUILD

### 1. HOME PAGE — `/`

Already built. Hero with word-by-word animation, sticky-scroll Journey (4 steps), sticky-scroll Ways to Build (4 expanding cards), Funding grid (3x2 elastic hover), CTA section, footer.

---

### 2. DISCOVER GRANTS — `/discover`

**Layout:** PageHeader + MockApiBadge + 3 sections

**Section 1: Flagship Grant Hero**
Full-width banner, bg var(--ink), color var(--bg). Shows: "Flagship" + status badges, grant title (Fraunces clamp(36px, 5vw, 56px)), description, stats row (Pool, Deadline days left, Requirements) separated by border-top 1px, two buttons (View details, Apply).

**Section 2: Spotlight Grants**
Label "In focus" + "Spotlight" badge. 3-column grid of GrantRowCards.

**Section 3: All Grants (A-Z)**
Filterable list with search input, funding status filter (Any/Funded/Not funded), sort (A-Z, Z-A, Newest, Oldest), category checkboxes. Results in 3-column grid.

**GrantRowCard:** Border 1px, padding 20px. Status badge top-left, funding amount top-right (mono 10px). Title (Fraunces 18px). Org name (mono 10px muted). Description (14px, 3 line clamp). Deadline (mono 10px). Hover: bg var(--ink), color var(--bg).

**Mock Data:** 9 grants. 1 flagship (Backyard Minigrant, $1M, open). 2 spotlight. 6 more across orgs. Filter by status (OPEN/CLOSED/DRAFT), funding range, deadline, org.

---

### 3. GRANT DETAIL — `/discover/grants/[grantId]`

**Layout:** PageHeader with breadcrumbs (Discover > Grants > [title]) + hero + content

**Hero:** Full-width bg var(--ink). Badges (status, org), title (Fraunces 36-56px), description, stats (pool, deadline, requirements). Apply CTA button.

**Content:** Two columns (2fr 1fr).
- Left: About section (full description), Requirements section, Questions preview (list of question titles with type badges).
- Right: Sidebar card with "Funded by [org name]", link to org, "Apply with your project" button.

**Mock Data:** Grant details, org info, 3-5 questions per grant with types (SHORT_TEXT, LONG_TEXT, SINGLE_CHOICE, MULTIPLE_CHOICE, URL).

---

### 4. PROJECT DETAIL (PUBLIC) — `/discover/projects/[id]`

**Layout:** PageHeader with breadcrumbs + banner + content

**Banner:** Full-width 200px placeholder with first letter of project name centered (Fraunces italic 80px, color var(--soft)).

**Content:** Two columns (2fr 1fr).
- Left: Description, Problem Statement, Team section (list with name, role, github/twitter links), Updates section (chronological list), Files section (file links with type badges).
- Right: Sidebar with categories (mono badges), website/project URLs, contract addresses, visibility badge, grant history (status badges per grant).

**Visibility:** Sections hidden based on project.hiddenSections when visibility is CUSTOM. PRIVATE projects show 404.

**Mock Data:** 20 projects with varied categories, teams, updates, files. Some have accepted grants.

---

### 5. SHOWCASE — `/showcase`

**Layout:** Slim header bar + featured carousel + filter bar + paginated grid + footer bar

**Carousel:** Horizontal scroll of featured project cards (clamp(200px, 22vw, 300px) wide). Each card: image placeholder (first letter), title (Fraunces 18px), categories (mono 9px), funded badge. On hover: card expands to fill entire section with split layout (image left, details right). Other cards fade to 30% opacity.

**Filter Bar:** Search input + "Filters" toggle button. Expanded panel: 4 columns (Category checkboxes, Tech Stack checkboxes, Program radio, Sort + Funded radio). Result count + page indicator.

**Grid:** 3 columns, max 5 rows per page. Cards: image placeholder (aspect-square), title (Fraunces 20px), description (13px, 2 lines), categories + funded badge. Hover: bg var(--soft).

**Pagination:** Prev/Next buttons + numbered pages. Mono 11px.

**Mock Data:** 20 projects, 6 featured, 7 funded. Categories: DeFi, Infra, NFT, Tooling, DAO, Privacy, Identity, Payments, Gaming, Security, Staking, Education, Marketplace, Oracle, Analytics, Bridge, Lending.

---

### 6. CHALLENGES — `/challenges`

**Layout:** PageHeader + MockApiBadge + grid

**Grid:** 3-column grid of CompetitionRowCards showing open challenges.

**CompetitionRowCard:** Border 1px, padding 20px. Status + format badges, pool amount (mono 10px). Title (Fraunces 18px). Partner/org name (mono 10px). Description (14px, 3 lines). Bottom row: timing label + team count. Hover: bg var(--ink), color var(--bg).

**Mock Data:** 3-4 challenges with format=CHALLENGE, tracks, teams, prizes.

---

### 7. CHALLENGE DETAIL — `/challenges/[id]`

**Layout:** PageHeader with breadcrumbs + hero + tabs

**Hero:** Title (Fraunces 36px), status/format badges, org name, description, stats (prize pool, teams, tracks, deadline).

**Tabs:** Overview, Tracks, Teams, Submissions, Rules. Each tab shows relevant content in cards/tables.

**Participate Panel:** Sidebar CTA to join solo or create/join team. Shows registration status.

**Mock Data:** Competition details, tracks with prizes, teams with members, submissions.

---

### 8. HACKATHONS — `/hackathons`

Same layout as Challenges page but filtered to format=HACKATHON.

**Mock Data:** 2-3 hackathons with time-bound schedules.

---

### 9. HACKATHON DETAIL — `/hackathons/[id]`

Same as Challenge Detail but with schedule timeline (Registration, Submission, Judging phases with dates).

---

### 10. FAQ — `/faq`

**Layout:** PageHeader + sections

**Sections:** 5 collapsible groups: Getting Started, Applying for Grants, Hackathons & Challenges, For Org Admins, Privacy & Data.

Each group: heading (Fraunces 24px) + stack of `<details>` elements. Summary: 15px bold. Content: 14px, max-width 640px. Border-bottom 1px var(--soft) between items.

**Mock Data:** 5-8 Q&A per section. Content references "Backyard" platform.

---

### 11. SEARCH — `/search`

**Layout:** PageHeader + search panel

**Search Panel:** Large search input (18px, full-width, border-bottom 2px). Scope tabs below: All, Projects, Grants, Applications, Users, Organizations. Results grouped by type with count badges.

**Result Items:** Different layout per type:
- Project: name (Fraunces 18px), description, categories
- Grant: title, org, funding pool, status badge
- User: name, handle, bio snippet
- Organization: name, description, member count

**Mock Data:** Searches across all mock arrays. Client-side filtering.

---

### 12. LOGIN — `/login`

**Layout:** Centered card, max-width 400px

**Card:** Title "Log in to Backyard" (Fraunces 24px). Description about BuilderHub SSO. Single "Continue with BuilderHub" primary button. Below: "New here?" link, FAQ link.

**Mock Data:** No real auth. Button shows toast "Redirecting to BuilderHub...".

---

### 13. ONBOARDING — `/onboarding`

**Layout:** Full-width hero + multi-step form

**Hero:** bg var(--ink), color var(--bg). "Welcome to Backyard" (Fraunces 36px). Progress indicator showing current step.

**Steps:**
1. Basic Info: name, handle, bio
2. Location: country, state
3. Links: wallet address, telegram
4. Categories: multi-select

**Form:** Each step is a Card with inputs. Next/Back/Complete buttons. Progress bar at top.

**Mock Data:** Submits to toast.

---

### 14. USER PROFILE — `/u/[handle]`

**Layout:** PageHeader + profile header + tabs

**Profile Header:** Avatar placeholder (64px circle, first letter), name (Fraunces 24px), handle (mono 12px @handle), bio (14px), location + wallet (mono 11px muted), categories as badges.

**Tabs (if self/admin):** Projects, Grant History, Competition History.

**Projects Grid:** 3-column grid of project cards with name, description, categories.

**Grant History Table:** Columns: Grant, Org, Status (badge), Submitted, Funding. Rows link to grant detail.

**Competition History:** Cards with competition name, format badge, team name, submission status.

**Visibility:** Public mode shows only public projects and no grant/competition history. Self/admin sees everything.

**Mock Data:** 12 users with varied profiles. Projects, applications, competition teams.

---

### 15. MY PROJECTS — `/projects`

**Auth:** Applicant only.

**Layout:** PageHeader with "New Project" button + project list

**Project List:** Table with columns: Name (Fraunces 16px), Visibility badge, Applications (count with status breakdown), Created date, Actions (Edit, Delete). Empty state if no projects.

**Mock Data:** Projects owned by current user with application counts.

---

### 16. NEW PROJECT — `/projects/new`

**Auth:** Applicant only.

**Layout:** PageHeader + form

**Form Sections (Cards):**
1. Basic Info: name, description, problem statement
2. Media: logo upload, banner upload, images
3. Links: website URL, project URL, other links (add/remove), contract addresses (add/remove)
4. Categories: multi-select buttons
5. Visibility: PUBLIC/PRIVATE/CUSTOM radio. CUSTOM shows section toggles (team, files, updates, applications, contracts, links, problem).

**Actions:** Create Project (primary), Cancel (ghost).

**Mock Data:** Form submits to toast.

---

### 17. PROJECT DETAIL (OWNER) — `/projects/[id]`

**Auth:** Owner only. Non-owners redirected to public view.

**Layout:** PageHeader with Edit/Delete buttons + banner + content + sidebar

Same as public project detail but with:
- Manage links for each section (Team, Files, Updates)
- SectionVisibilityToggle controls
- Applications table showing all applications for this project with status badges
- Preview mode toggle to see public view

---

### 18. EDIT PROJECT — `/projects/[id]/edit`

**Auth:** Owner only.

Same form as New Project but pre-populated with existing data.

---

### 19. MANAGE TEAM — `/projects/[id]/team`

**Auth:** Owner only.

**Layout:** PageHeader + add form + team list

**Add Form:** Name, email, role, github, twitter, linkedin inputs in a row.

**Team List:** Cards with member info. Remove button (danger) on each.

**Mock Data:** 2-3 team members per project.

---

### 20. MANAGE FILES — `/projects/[id]/files`

**Auth:** Owner only.

**Layout:** PageHeader + upload form + file list

**Upload Form:** Name input + URL input + type selector + Upload button.

**File List:** Table with name, type badge, uploaded by, date, delete button.

**Mock Data:** 2 files for project 1.

---

### 21. MANAGE UPDATES — `/projects/[id]/updates`

**Auth:** Owner only.

**Layout:** PageHeader + new update form + updates list

**New Update Form:** Title input + content textarea + Post button.

**Updates List:** Chronological cards with title, content, date. Edit/Delete buttons.

**Mock Data:** 2 updates for project 1.

---

### 22. PROJECT VERSIONS — `/projects/[id]/versions`

**Auth:** Owner only.

**Layout:** PageHeader + version timeline

**Timeline:** Vertical list. Each version: version number badge, change log, changed by, date. Expandable JSON snapshot.

**Mock Data:** 2 versions for project 1.

---

### 23. APPLY TO GRANT — `/projects/[id]/apply?grant=[grantId]`

**Auth:** Owner only. Profile must be complete.

**Layout:** PageHeader with breadcrumbs + form

**Form:** Card with grant title + org name at top. Cover note textarea. Then dynamic question fields based on grant's questions (SHORT_TEXT -> input, LONG_TEXT -> textarea, SINGLE_CHOICE -> radio, MULTIPLE_CHOICE -> checkboxes, URL -> input). Funding requested input. Save Draft + Submit buttons.

**Mock Data:** Grant questions, project info.

---

### 24. MY APPLICATIONS — `/applications`

**Auth:** Applicant only.

**Layout:** PageHeader + applications table

**Table:** Columns: Project name, Grant title, Status badge (DRAFT/SUBMITTED/IN_REVIEW/ACCEPTED/REJECTED/WITHDRAWN), Funding requested, Submitted date, Actions (View, Withdraw for non-final statuses).

**Mock Data:** All applications for current user's projects.

---

### 25. APPLICATION DETAIL — `/applications/[id]`

**Auth:** Applicant only (owner of the project).

**Layout:** PageHeader with breadcrumbs + content + sidebar

**Content:** Cover note, answers to questions (question title + answer), review feedback (if any).

**Sidebar:** Status badge, grant name, org name, funding requested, submitted/decided dates, actions (Withdraw if applicable).

**Mock Data:** Application details, answers, reviews.

---

### 26. APPLICATION VERSIONS — `/applications/[id]/versions`

**Auth:** Applicant only.

Same as Project Versions but for application snapshots.

---

### 27. SETTINGS: PROFILE — `/settings/profile`

**Auth:** Any authenticated user.

**Layout:** Settings sidebar + form

**Sidebar:** Links: Profile (active), Account, Notifications.

**Form:** Name, handle, bio (textarea), avatar upload, telegram, country + state selectors, wallet address, profile visibility toggle, categories multi-select. Save button.

**Mock Data:** Current user data.

---

### 28. SETTINGS: ACCOUNT — `/settings/account`

**Auth:** Any authenticated user.

**Layout:** Settings sidebar + content

**Content:**
- Account Info card: email, BuilderHub ID, onboarding status, admin status, created date. All read-only.
- Danger Zone card: Delete Account button. Blocked if user has live applications (shows warning with count).

**Mock Data:** Current user, application counts.

---

### 29. SETTINGS: NOTIFICATIONS — `/settings/notifications`

**Auth:** Any authenticated user.

**Layout:** Settings sidebar + form

**Form:** Toggle switches for notification types:
- Application status changes (email + in-app)
- Review feedback received (email + in-app)
- New grants from followed orgs (email)
- Competition updates (in-app)
- Platform announcements (email)

Save button.

---

### 30. NOTIFICATIONS — `/notifications`

**Auth:** Any authenticated user.

**Layout:** PageHeader + notification list

**List:** Chronological cards. Each: icon (type-based), title, description, timestamp, read/unread indicator (accent dot). Click marks as read.

**Filter tabs:** All, Unread, Applications, Reviews, System.

**Mock Data:** 8-10 notifications of various types.

---

### 31. INVITATIONS — `/invitations`

**Auth:** Any authenticated user.

**Layout:** PageHeader + invitations table

**Table:** Columns: Organization, Grant (if grant-specific), Role, Invited by, Expires, Status badge, Actions (Accept/Decline for pending).

**Mock Data:** 2-3 invitations with different statuses (PENDING, ACCEPTED, EXPIRED).

---

### 32. INVITATION ACCEPT — `/invite/[token]`

**Layout:** Centered card, max-width 480px

**Card:** "You're invited" title. Org name, role, invited by, grant (if applicable), expires date. Accept + Decline buttons. Login prompt if not authenticated.

**Mock Data:** Invitation details.

---

### 33. ORGANIZATIONS — `/organizations`

**Auth:** Any authenticated user.

**Layout:** PageHeader + org table

**Table:** Columns: Name, Your Role badge, Members count, Grants count, Open Grants count, Actions (Dashboard link).

**Empty state** if user has no org memberships.

**Admin view:** Shows all orgs with additional columns.

**Mock Data:** 3 orgs, 7 members across them.

---

### 34. REVIEWS — `/reviews`

**Auth:** Users with reviewer assignments.

**Layout:** PageHeader + review queue

**Queue:** Table with columns: Grant, Project, Applicant, Due date, Status (Pending/Submitted), Actions (Review button).

**Mock Data:** 2-3 assigned reviews.

---

### 35. REVIEW APPLICATION — `/reviews/[appId]`

**Auth:** Assigned reviewer.

**Layout:** PageHeader + content + review form

**Content:** Application cover note, answers to questions. Read-only.

**Review Form Card:** Score slider (1-10), Decision radio (Approve/Reject/Request Changes), Feedback textarea, Submit Review button.

**Mock Data:** Application details, existing review if submitted.

---

### 36-42. ORG DASHBOARD PAGES

All under `/dashboard/[orgSlug]/...` with DashboardShell sidebar.

**36. Overview** — `/dashboard/[orgSlug]`
4 stat cards (Open Grants, Total Applications, Accepted, Funding Committed). Recent applications list. Quick actions.

**37. Grants List** — `/dashboard/[orgSlug]/grants`
Table: title, status badge, applications count, funding pool, deadline, actions.

**38. New Grant** — `/dashboard/[orgSlug]/grants/new`
Form: title, slug, description, requirements, funding pool, currency, deadline, public toggle, flagship toggle.

**39. Grant Dashboard** — `/dashboard/[orgSlug]/grants/[grantId]`
Pipeline visualization (DRAFT -> SUBMITTED -> IN_REVIEW -> ACCEPTED/REJECTED). 4 stat cards. Recent applications. Question + reviewer counts. Summary.

**40. Grant Edit** — `/dashboard/[orgSlug]/grants/[grantId]/edit`
Same form as new grant, pre-populated.

**41. Applications List** — `/dashboard/[orgSlug]/grants/[grantId]/applications`
Table: project, applicant, funding, status, submitted, actions.

**42. Application Review** — `/dashboard/[orgSlug]/grants/[grantId]/applications/[appId]`
Two columns. Left: cover note, answers, reviews from reviewers. Right: summary sidebar (project, applicant, funding, dates), assigned reviewers list, decision panel (Accept/Reject/Request Changes with note).

---

### 43-50. MORE ORG DASHBOARD PAGES

**43. Funding/Disbursements** — `.../applications/[appId]/funding`
Milestone list: label, amount, status (PENDING/COMPLETED), date. Add/mark complete buttons.

**44. Cross-Grants** — `.../applications/[appId]/cross-grants`
Applicant's other applications across grants. Stats + table. Privacy-scrubbed.

**45. Questions** — `.../grants/[grantId]/questions`
Drag-to-reorder question list. Add/edit/delete. Type badges. Required indicator.

**46. Reviewers** — `.../grants/[grantId]/reviewers`
Assignment matrix: applications x reviewers. Assign/unassign buttons.

**47. Analytics** — `.../grants/[grantId]/analytics`
Funnel chart, category distribution, reviewer performance table.

**48. Embed** — `.../grants/[grantId]/embed`
Code snippet configurator. Size/style options. Copy button. Live preview.

**49. Grant Settings** — `.../grants/[grantId]/settings`
Permissions management. Add viewers/editors/reviewers. Role selector.

**50. Grant Templates** — `.../grants/templates`
List of existing grants as templates. Clone button on each.

---

### 51-55. ORG SETTINGS

**51. Members** — `/dashboard/[orgSlug]/members`
Member table: name, email, role badge (OWNER/MEMBER). Invite form (email + role). Change role/remove buttons.

**52. Org Settings** — `/dashboard/[orgSlug]/settings`
Org profile form: name, slug, description, website. Delete button (blocked if live grants).

**53. Org Analytics** — `/dashboard/[orgSlug]/analytics`
Rolled-up stats across all grants. Funnel, category chart, grant leaderboard.

**54. Email Digest** — `/dashboard/[orgSlug]/digest`
Toggle on/off, cadence selector, section checkboxes, preview of next send.

**55. API Keys** — `/dashboard/[orgSlug]/api-keys`
Key list: name, prefix, scope, last used, created. Create/revoke/rotate buttons.

**56. Webhooks** — `/dashboard/[orgSlug]/webhooks`
Webhook list: URL, events, last delivered, status. Create/test/delete/toggle buttons.

---

### 57-61. ADMIN PAGES

All under `/admin/` with admin DashboardShell sidebar (Overview, Organizations, Users, Reviewers, Audit Log).

**57. Admin Overview** — `/admin`
6 stat cards (Orgs, Users, Live Grants, Total Apps, Accepted Apps, Admins). Recent audit log (5 entries). Quick actions grid.

**58. Users** — `/admin/users`
Table: name, email, handle, onboarding status, admin badge, org count, app count, actions (toggle admin, delete).

**59. Organizations** — `/admin/organizations`
Table: name, members, grants, open grants, status, actions (suspend/restore).

**60. Reviewers Audit** — `/admin/reviewers`
Table: reviewer name, assigned count, completed count, avg score, turnaround days, COI flags. Expandable COI details (self-COI, same-org COI).

**61. Audit Log** — `/admin/audit-log`
Filterable log: action, resource type, resource ID, actor name, timestamp. Filter by action/resource/actor/date range. Export CSV button.

---

## MOCK DATA SUMMARY

### Users (12)
Alice Applicant, Ruth Reviewer, Oscar Owner, Wendy Whitelist, Eddie Editor, Gina GrantReviewer, Paul PlatformAdmin, Marco Rivera, Suki Chen, Kai Nakamura, Nina Okafor, Leo Petrov.

### Organizations (3)
Backyard (org_team1), Avalanche Foundation (org_avalanche), Subnet Labs (org_subnet).

### Grants (9)
Backyard Minigrant ($1M flagship), DeFi Builders ($500K), NFT Creator ($250K), Infra ($200K), Education ($75K), Gaming ($400K), Privacy & Identity ($250K), Security Tooling ($150K), DAO Infrastructure (draft).

### Projects (20)
AvaSwap DEX, GlacierNFT, SnowBridge, CrystalLend, Permafrost Indexer, IceType Fonts, SubnetWatch, VaultDAO, ChainProof, PayStream, PixelVerse, NodeRank, GasGuard, ForkAlert, LiquidStake, ContractCanvas, BountyBoard, DataVault, OracleNet, MintDrop. Categories: DeFi, Infra, NFT, Tooling, DAO, Privacy, Identity, Payments, Gaming, Security, Staking, Education, Marketplace, Oracle, Analytics, Bridge, Lending.

### Applications (12)
5 ACCEPTED, 2 IN_REVIEW, 2 SUBMITTED, 2 DRAFT, 1 with disbursements.

### Competitions (5-6)
2-3 hackathons (HACKATHON format), 2-3 challenges (CHALLENGE format). Each with tracks, teams, submissions, prizes.

---

## INTERACTION PATTERNS

1. **Hover on cards:** bg var(--ink), color var(--bg), transition 0.3s var(--ease-smooth)
2. **Hover on buttons:** primary flips to accent, ghost fills with ink
3. **Table row hover:** bg var(--soft)
4. **Badge hover:** none (static)
5. **Form focus:** border-color var(--accent), subtle shadow
6. **Toast notifications:** bottom-right, border 1px var(--line), mono text
7. **Destructive actions:** Confirm dialog with warning text before delete/revoke/remove
8. **Loading states:** Skeleton placeholders matching component shapes
9. **Error states:** Inline error text in var(--accent), border-color var(--accent)
10. **Empty states:** Centered illustration + title + description + action button

---

## AUTH & ROUTING

- `getServerRole()` returns: "visitor" | "applicant" | "admin" | "org"
- `getServerUser()` returns current user or null
- `getServerOrg()` returns current org or null
- Role-based redirects: unauthenticated -> /login, applicant pages redirect admin/org to their dashboards
- Profile completion gate on apply pages
- Soft-delete paradigm throughout (deletedAt field, never hard delete)
- Dev mode: RoleSwitcher dropdown (fixed position, top-right) to switch between roles

---

## HOW TO USE THIS PROMPT

Paste this entire document plus one of these instructions:

**Generate all pages:**
> Build every page listed above as a Next.js 15 App Router project. Use server components by default, client components only for interactivity. Use the exact design tokens, fonts, and component patterns specified. Generate mock data arrays in /lib/mock/. All pages should share the same .page wrapper, nav, and footer. Output complete working code.

**Generate a single page:**
> Build the [PAGE NAME] page at route [ROUTE] using the design system above. Include the page chrome (nav + footer), all mock data it needs, and full interactivity. Match the component patterns exactly.

**Generate a component library:**
> Build a component library with all the UI primitives described above: Button (4 variants), Card, Table, Badge (4 variants), Input, Textarea, Select, Empty State, Stat Card, Page Header, Mock API Badge, Tabs. Use the exact tokens and fonts. Output as individual .tsx files.
