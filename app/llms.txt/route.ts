import { NextResponse } from "next/server";

const CONTENT = `# Backyard Platform

> A multi-org grant platform where organizations run grant programs, hackathons, and challenges. Applicants submit projects for funding. Reviewers score applications. Org admins make decisions and disburse funds.

## What this site does

Backyard connects three groups:

1. **Applicants** create projects, apply to grants with cover notes and answers to grant-specific questions, participate in hackathons and challenges.
2. **Organizations** publish grants with custom questions, assign reviewers, track applications through a pipeline (Draft → Submitted → In Review → Accepted/Rejected), and disburse milestone-based funding.
3. **Platform admins** oversee everything — user management, org management, reviewer audit with COI detection, and a full audit log.

## Key public pages

- /discover — browse all open grants, search by category, deadline, funding pool
- /discover/grants/{grantId} — individual grant detail with requirements, questions preview, and apply CTA
- /discover/projects/{projectId} — public project detail showing team, files, updates, grant history (respects per-section visibility)
- /showcase — browse all public projects
- /hackathons — list of hackathons (time-bound team events)
- /hackathons/{id} — hackathon detail with teams, tracks, prizes, timeline
- /challenges — list of challenges (rolling individual/team events)
- /challenges/{id} — challenge detail
- /u/{handle} — public applicant profile with projects, grant history, competition history
- /faq — frequently asked questions organized by role (applicant, reviewer, org admin, privacy)
- /search — global search across projects, grants, applications, users, organizations

## How grants work

1. An org admin creates a grant with a title, description, requirements, funding pool, deadline, and custom questions
2. The grant is published (OPEN status) and appears on /discover
3. Applicants browse /discover, pick a grant, select (or create) a project, and fill out the application form
4. Org admins see applications in their dashboard, assign reviewers
5. Reviewers score applications (1-10) with a decision (approve/reject/request changes) and feedback
6. Org admin makes a final decision; accepted applications receive milestone-based disbursements

## How hackathons and challenges work

- Hackathons are time-bound (fixed schedule with registration/submission/judging phases)
- Challenges are rolling (join anytime, submit when ready)
- Both support teams (create/join/invite), multi-track submissions, and prize pools
- Teams can be public or private

## Roles and access

- **Visitor**: browse public pages, no login required
- **Applicant**: create projects, apply to grants, join competitions, manage their profile
- **Reviewer**: score assigned applications (review queue)
- **Org Owner**: full org control — grants, members, settings, analytics, webhooks, API keys
- **Org Whitelisted**: manage grants but not billing/org deletion
- **Platform Admin**: /admin/* — manage all orgs, all users, reviewer audit, audit log

## Data model (key entities)

- Organization → has Grants → has Applications → has Reviews
- User → owns Projects → applies to Grants via Applications
- Competition (hackathon or challenge) → has Tracks → has Teams → has Submissions
- ReviewerAssignment links a Reviewer to an Application with a due date
- FundingDisbursement records milestone payouts against accepted Applications
- Invitation links an email to an org or grant role

## API

All endpoints are documented at /docs/api/API_TO_BUILD.md in the repository. The frontend is currently mock-only (no real backend yet). Every API call site is tagged with \`// API:\` comments in the code.

## Technology

- Next.js 15 (App Router, server components)
- TypeScript strict
- Tailwind CSS v4
- Zustand for mock auth state
- 62 routes, all server-rendered
`;

export function GET() {
  return new NextResponse(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
