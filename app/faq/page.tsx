import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Card } from "@/app/_components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Backyard — applying, hackathons, org admin, privacy, and account management.",
};

interface Entry {
  question: string;
  answer: string;
}

interface Section {
  title: string;
  entries: Entry[];
}

const SECTIONS: Section[] = [
  {
    title: "Getting started",
    entries: [
      {
        question: "What is Backyard?",
        answer:
          "A platform where orgs run grant programs and hackathons, and applicants submit projects for funding. Multi-org, multi-grant, multi-role — one login covers every part you play.",
      },
      {
        question: "Do I need to sign up?",
        answer:
          "Only if you want to apply, create projects, or manage an org. Browsing Discover, Showcase, Hackathons, and Challenges works without an account.",
      },
      {
        question: "How do I sign in?",
        answer:
          "BuilderHub SSO. One click on /login and you're authenticated. We don't store passwords — BuilderHub does.",
      },
    ],
  },
  {
    title: "Applying for grants",
    entries: [
      {
        question: "Can one project apply to multiple grants?",
        answer:
          "Yes. Each application is the project ↔ grant junction — same project can target as many grants as you want, each with its own cover note + answers.",
      },
      {
        question: "Can I edit my application after submitting?",
        answer:
          "Drafts are editable. Once submitted, only withdraw is possible. If the grant admin asks for changes, the status flips to CHANGES_REQUESTED and the form reopens.",
      },
      {
        question: "How do I know if I'm accepted?",
        answer:
          "You'll see the status on /applications and get a notification (in-app + email if you opted in). Decisions include optional reviewer feedback.",
      },
      {
        question: "How do I hide parts of my project from the public?",
        answer:
          "On /projects/[id]/edit, switch Visibility to CUSTOM and toggle Hide on individual sections (team, files, applications, etc). Orgs you apply to always see everything.",
      },
    ],
  },
  {
    title: "Hackathons & challenges",
    entries: [
      {
        question: "What's the difference?",
        answer:
          "Hackathons are time-bound sprints with a fixed schedule. Challenges are rolling — you join when ready, submit when done. Both use the same team + submission flow.",
      },
      {
        question: "Do I need a team?",
        answer:
          "No — registering solo is fine. You can also create a team or join an existing one. Teams can be public (shown on the detail page) or private.",
      },
      {
        question: "Can a team submit to multiple tracks?",
        answer:
          "Yes. Pick every track that applies when you submit. Reviewers score per-track.",
      },
    ],
  },
  {
    title: "For org admins",
    entries: [
      {
        question: "How do I invite a collaborator to just one grant?",
        answer:
          "Go to /dashboard/[orgSlug]/grants/[grantId]/settings (Permissions) and add a VIEWER, EDITOR, or REVIEWER. They don't need to be org members — scope is the grant only.",
      },
      {
        question: "How do I record a milestone payment?",
        answer:
          "From the grant application review, click Funding. Disbursements are per-application, with status (PENDING → COMPLETED) and an optional milestone label.",
      },
      {
        question: "What happens to grants if I delete the org?",
        answer:
          "All grants soft-delete with the org. Submitted applications stay (they're applicant-owned) but stop showing this org as the recipient. This blocks deletion while any grant is still live — archive them first.",
      },
    ],
  },
  {
    title: "Privacy & data",
    entries: [
      {
        question: "What do orgs see about me?",
        answer:
          "When you apply to a grant, that org sees your full profile (name, handle, bio, telegram, wallet if set) + the project you applied with. Orgs you didn't apply to only see your public profile.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes — /settings/account has a destructive delete flow. It scrubs PII and soft-deletes the user, but preserves projects so existing applications stay auditable. Blocked while you have live applications.",
      },
      {
        question: "Who has access to my answers?",
        answer:
          "Only the org running the grant + reviewers assigned to your application. Other orgs — even if you apply to them later — don't see answers from previous grants.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="FAQ"
        description="Answers to the questions that come up most often. If yours isn't here, ping the org you're applying to — they own that grant."
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <Card>
            <nav className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="border border-[var(--color-border-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </Card>

          {SECTIONS.map((section) => (
            <Card
              key={section.title}
              title={
                <span id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
                  {section.title}
                </span>
              }
            >
              <ul className="flex flex-col divide-y divide-[var(--color-border-muted)]">
                {section.entries.map((e) => (
                  <li key={e.question} className="py-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-bold">
                        {e.question}
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg)]">
                        {e.answer}
                      </p>
                    </details>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          <Card title="Still stuck?">
            <p className="text-sm">
              Grant-specific questions → reach out to the org running it (their contact is
              on the grant detail page). Platform issues → check{" "}
              <Link href="/" className="underline underline-offset-2">
                backyard.dev
              </Link>{" "}
              for status.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
