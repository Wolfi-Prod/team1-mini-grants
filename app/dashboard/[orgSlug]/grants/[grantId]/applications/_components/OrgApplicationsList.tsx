"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Badge } from "@/app/_components/ui/Badge";
import { Table } from "@/app/_components/ui/Table";
import { Button } from "@/app/_components/ui/Button";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import type { Application, ApplicationStatus, Project, User } from "@/lib/types";

type StatusFilter = "ALL" | ApplicationStatus;
type SortKey = "newest" | "oldest" | "funding_desc" | "funding_asc";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "SUBMITTED", label: "New" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
  { key: "WITHDRAWN", label: "Withdrawn" },
];

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "New",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export interface OrgApplicationRow {
  application: Application;
  project: Project | null;
  applicant: User | null;
}

interface Props {
  orgSlug: string;
  grantId: string;
  rows: OrgApplicationRow[];
}

function timestampFor(a: Application): number {
  return new Date(a.submittedAt ?? a.updatedAt ?? a.createdAt).getTime();
}

export function OrgApplicationsList({ orgSlug, grantId, rows }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (r.application.status === "DRAFT") return false; // drafts never surface to orgs
      if (status !== "ALL" && r.application.status !== status) return false;
      if (q) {
        const hay = `${r.project?.name ?? ""} ${r.applicant?.name ?? ""} ${
          r.application.coverNote ?? ""
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return timestampFor(b.application) - timestampFor(a.application);
        case "oldest":
          return timestampFor(a.application) - timestampFor(b.application);
        case "funding_desc":
          return (
            (b.application.fundingRequested ?? 0) -
            (a.application.fundingRequested ?? 0)
          );
        case "funding_asc":
          return (
            (a.application.fundingRequested ?? 0) -
            (b.application.fundingRequested ?? 0)
          );
      }
    });

    return list;
  }, [rows, search, status, sort]);

  const visibleCount = rows.filter((r) => r.application.status !== "DRAFT").length;

  if (visibleCount === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Applications will appear here as applicants submit."
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 border border-[var(--color-border-muted)] p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Project, applicant, cover note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "funding_desc", label: "Funding: high → low" },
              { value: "funding_asc", label: "Funding: low → high" },
            ]}
          />
          <div className="flex items-end">
            <span className="text-xs text-[var(--color-fg-muted)]">
              {filtered.length} of {visibleCount}
            </span>
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
          title="No applications match"
          description="Try clearing the search or status filter."
        />
      ) : (
        <Table<OrgApplicationRow>
          rows={filtered}
          getRowKey={(r) => r.application.id}
          columns={[
            {
              key: "project",
              header: "Project",
              render: (r) =>
                r.project ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{r.project.name}</span>
                    <span className="line-clamp-1 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      {r.project.description}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-fg-subtle)]">Unknown project</span>
                ),
            },
            {
              key: "applicant",
              header: "Applicant",
              render: (r) =>
                r.applicant ? (
                  <Link
                    href={`/u/${r.applicant.handle}`}
                    className="text-sm underline underline-offset-2"
                  >
                    {r.applicant.name ?? r.applicant.handle}
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--color-fg-subtle)]">—</span>
                ),
              className: "w-40",
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Badge
                  variant={r.application.status === "ACCEPTED" ? "inverted" : "default"}
                >
                  {STATUS_LABEL[r.application.status]}
                </Badge>
              ),
              className: "w-28",
            },
            {
              key: "funding",
              header: "Funding",
              render: (r) =>
                r.application.fundingRequested != null ? (
                  <span className="font-mono text-sm">
                    ${r.application.fundingRequested.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-fg-subtle)]">—</span>
                ),
              className: "w-32",
            },
            {
              key: "submitted",
              header: "Submitted",
              render: (r) =>
                r.application.submittedAt ? (
                  <span className="text-xs">
                    {new Date(r.application.submittedAt).toLocaleDateString()}
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
                <Link
                  href={`/dashboard/${orgSlug}/grants/${grantId}/applications/${r.application.id}`}
                >
                  <Button size="sm" variant="secondary">
                    Review
                  </Button>
                </Link>
              ),
              className: "w-28",
            },
          ]}
        />
      )}
    </div>
  );
}
