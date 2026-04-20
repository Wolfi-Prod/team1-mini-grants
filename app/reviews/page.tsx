import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  findAssignmentsForReviewer,
  findReviewByReviewer,
} from "@/lib/mock/reviews";
import { findApplicationById } from "@/lib/mock/applications";
import { findGrantById } from "@/lib/mock/grants";
import { findProjectById } from "@/lib/mock/projects";
import type { Application, Grant, Project, ReviewerAssignment } from "@/lib/types";

interface Row {
  assignment: ReviewerAssignment;
  application: Application | null;
  grant: Grant | null;
  project: Project | null;
  hasSubmittedReview: boolean;
}

export default async function MyReviewsPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/reviews"));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/reviews"));

  const assignments = findAssignmentsForReviewer(user.id);
  const rows: Row[] = assignments.map((a) => {
    const application = findApplicationById(a.applicationId) ?? null;
    const grant = application ? findGrantById(application.grantId) ?? null : null;
    const project = application ? findProjectById(application.projectId) ?? null : null;
    const hasSubmittedReview =
      findReviewByReviewer(a.applicationId, user.id) !== undefined;
    return { assignment: a, application, grant, project, hasSubmittedReview };
  });

  const pending = rows.filter((r) => !r.hasSubmittedReview);
  const completed = rows.filter((r) => r.hasSubmittedReview);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="My reviews"
        description={`${assignments.length} assignment${assignments.length === 1 ? "" : "s"} · ${pending.length} pending`}
        actions={
          <Link href="/reviews/dashboard">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        }
      />

      <section className="px-6 py-6">
        <MockApiBadge
          endpoints={[
            "GET /api/reviewer-assignments?reviewerId=me",
            "GET /api/reviews?reviewerId=me",
            "GET /api/applications?ids=... (join)",
          ]}
        />
      </section>

      <section className="px-6 pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {rows.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="When an org adds you to a review panel, assigned applications will appear here."
            />
          ) : (
            <>
              {pending.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest">
                    Pending · {pending.length}
                  </h2>
                  <ReviewTable rows={pending} />
                </div>
              ) : null}

              {completed.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest">
                    Completed · {completed.length}
                  </h2>
                  <ReviewTable rows={completed} />
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewTable({ rows }: { rows: Row[] }) {
  return (
    <Table<Row>
      rows={rows}
      getRowKey={(r) => r.assignment.id}
      columns={[
        {
          key: "project",
          header: "Project",
          render: (r) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold">
                {r.project?.name ?? "Unknown project"}
              </span>
              <span className="line-clamp-1 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                {r.project?.description ?? ""}
              </span>
            </div>
          ),
        },
        {
          key: "grant",
          header: "Grant",
          render: (r) =>
            r.grant ? (
              <Link
                href={`/discover/grants/${r.grant.id}`}
                className="text-sm underline underline-offset-2"
              >
                {r.grant.title}
              </Link>
            ) : (
              <span className="text-sm text-[var(--color-fg-subtle)]">—</span>
            ),
          className: "w-48",
        },
        {
          key: "status",
          header: "Your review",
          render: (r) => (
            <Badge variant={r.hasSubmittedReview ? "inverted" : "default"}>
              {r.hasSubmittedReview ? "Submitted" : "Pending"}
            </Badge>
          ),
          className: "w-28",
        },
        {
          key: "due",
          header: "Due",
          render: (r) =>
            r.assignment.dueDate ? (
              <span className="text-xs">
                {new Date(r.assignment.dueDate).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-xs text-[var(--color-fg-subtle)]">—</span>
            ),
          className: "w-28",
        },
        {
          key: "actions",
          header: "",
          render: (r) => (
            <Link href={`/reviews/${r.assignment.applicationId}`}>
              <Button size="sm" variant="secondary">
                {r.hasSubmittedReview ? "Edit" : "Start review"}
              </Button>
            </Link>
          ),
          className: "w-28",
        },
      ]}
    />
  );
}
