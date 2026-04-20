"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Button } from "@/app/_components/ui/Button";
import { Badge } from "@/app/_components/ui/Badge";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { getVisibilityLabel } from "@/lib/mock/projects";
import type { Project, ApplicationStatus } from "@/lib/types";

export interface ProjectSummary {
  project: Project;
  applicationCounts: Partial<Record<ApplicationStatus, number>>;
  totalApplications: number;
}

interface Props {
  summaries: ProjectSummary[];
}

type StatusFilter =
  | "ALL"
  | "NO_APPS"
  | ApplicationStatus;

type SortKey = "newest" | "oldest" | "az" | "za";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NO_APPS", label: "No apps" },
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
];

function headlineStatus(s: ProjectSummary): StatusFilter {
  const c = s.applicationCounts;
  if (s.totalApplications === 0) return "NO_APPS";
  if ((c.ACCEPTED ?? 0) > 0) return "ACCEPTED";
  if ((c.IN_REVIEW ?? 0) > 0) return "IN_REVIEW";
  if ((c.SUBMITTED ?? 0) > 0) return "SUBMITTED";
  if ((c.REJECTED ?? 0) > 0) return "REJECTED";
  if ((c.DRAFT ?? 0) > 0) return "DRAFT";
  return "NO_APPS";
}

export function MyProjectsList({ summaries }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");
  const [showArchived, setShowArchived] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = summaries.filter((s) => {
      if (!showArchived && s.project.archivedAt) return false;
      if (showArchived && !s.project.archivedAt) return false;
      if (q) {
        const hay = `${s.project.name} ${s.project.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (status !== "ALL" && headlineStatus(s) !== status) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return (
            new Date(b.project.updatedAt).getTime() -
            new Date(a.project.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.project.updatedAt).getTime() -
            new Date(b.project.updatedAt).getTime()
          );
        case "az":
          return a.project.name.localeCompare(b.project.name);
        case "za":
          return b.project.name.localeCompare(a.project.name);
      }
    });

    return list;
  }, [summaries, search, status, sort, showArchived]);

  function handleArchive(project: Project) {
    // API: PATCH /api/projects/:id  body: { archivedAt: <now> }
    toast.success(`Archived "${project.name}" (mock)`);
  }

  function handleUnarchive(project: Project) {
    // API: PATCH /api/projects/:id  body: { archivedAt: null }
    toast.success(`Unarchived "${project.name}" (mock)`);
  }

  if (summaries.length === 0) {
    return (
      <EmptyState
        title="You haven't created any projects yet"
        description="Start by creating your first project. You can add team members, links, and apply it to open grants."
        action={
          <Link href="/projects/new">
            <Button variant="primary">Create your first project</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 border border-[var(--color-border-muted)] p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            options={[
              { value: "newest", label: "Newest updated" },
              { value: "oldest", label: "Oldest updated" },
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
            ]}
          />
          <div className="flex items-end justify-between gap-3">
            <span className="text-xs text-[var(--color-fg-muted)]">
              {filtered.length} of {summaries.length}
            </span>
            <button
              type="button"
              aria-pressed={showArchived}
              onClick={() => setShowArchived((v) => !v)}
              className={
                showArchived
                  ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                  : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
              }
            >
              {showArchived ? "Showing archived" : "Show archived"}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_PILLS.map((p) => {
              const active = status === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(p.key)}
                  className={
                    active
                      ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                      : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects match"
          description="Try clearing the search or status filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ProjectRow
              key={s.project.id}
              summary={s}
              onArchive={() => setArchiveTarget(s.project)}
              onUnarchive={() => handleUnarchive(s.project)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive project?"
        message={
          archiveTarget ? (
            <>
              Archiving <strong>{archiveTarget.name}</strong> removes it from Discover and your
              active projects view. You can unarchive it any time. Existing applications stay
              intact — archive is not delete.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          if (archiveTarget) handleArchive(archiveTarget);
        }}
        onClose={() => setArchiveTarget(null)}
      />
    </div>
  );
}

function ProjectRow({
  summary,
  onArchive,
  onUnarchive,
}: {
  summary: ProjectSummary;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const { project, applicationCounts, totalApplications } = summary;
  const head = headlineStatus(summary);
  const archived = project.archivedAt !== null;

  return (
    <div className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-5">
      <div className="flex items-start justify-between gap-2">
        <Badge variant={head === "ACCEPTED" ? "inverted" : "default"}>
          {STATUS_PILLS.find((p) => p.key === head)?.label ?? "No apps"}
        </Badge>
        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          Updated {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <Link
        href={`/projects/${project.id}`}
        className="flex flex-col gap-2 hover:underline"
      >
        <h3 className="text-base font-bold uppercase leading-tight">{project.name}</h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-[var(--color-fg-muted)]">
          {project.description}
        </p>
      </Link>

      <div className="flex flex-wrap items-center gap-1">
        <span
          className={
            archived
              ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
              : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          }
        >
          {getVisibilityLabel(project)}
        </span>
        {project.categories.map((c) => (
          <span
            key={c}
            className="border border-[var(--color-border-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="border-t border-[var(--color-border-muted)] pt-2 text-[10px] uppercase tracking-widest">
        {totalApplications === 0 ? (
          <span className="text-[var(--color-fg-muted)]">No applications yet</span>
        ) : (
          <span>
            {totalApplications} application{totalApplications === 1 ? "" : "s"}
            {applicationCounts.ACCEPTED
              ? ` · ${applicationCounts.ACCEPTED} accepted`
              : ""}
            {applicationCounts.IN_REVIEW
              ? ` · ${applicationCounts.IN_REVIEW} in review`
              : ""}
            {applicationCounts.DRAFT ? ` · ${applicationCounts.DRAFT} draft` : ""}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Link href={`/projects/${project.id}`}>
          <Button size="sm" variant="secondary">
            View
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/edit`}>
          <Button size="sm" variant="secondary">
            Edit
          </Button>
        </Link>
        {archived ? (
          <Button size="sm" variant="secondary" onClick={onUnarchive}>
            Unarchive
          </Button>
        ) : (
          <Button size="sm" variant="danger" onClick={onArchive}>
            Archive
          </Button>
        )}
      </div>
    </div>
  );
}
