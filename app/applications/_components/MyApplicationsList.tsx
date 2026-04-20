"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Button } from "@/app/_components/ui/Button";
import { Badge } from "@/app/_components/ui/Badge";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import type { Application, ApplicationStatus, Grant, Project } from "@/lib/types";

export interface ApplicationRow {
  application: Application;
  project: Project | null;
  grant: Grant | null;
}

type StatusFilter = "ALL" | ApplicationStatus;

type SortKey = "newest" | "oldest" | "az" | "za" | "funding_desc" | "funding_asc";

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "IN_REVIEW", label: "In review" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "REJECTED", label: "Rejected" },
  { key: "WITHDRAWN", label: "Withdrawn" },
];

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function timestampFor(a: Application): number {
  const stamp = a.submittedAt ?? a.updatedAt ?? a.createdAt;
  return new Date(stamp).getTime();
}

interface Props {
  rows: ApplicationRow[];
}

export function MyApplicationsList({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (status !== "ALL" && r.application.status !== status) return false;
      if (q) {
        const hay = `${r.project?.name ?? ""} ${r.grant?.title ?? ""} ${
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
        case "az":
          return (a.grant?.title ?? "").localeCompare(b.grant?.title ?? "");
        case "za":
          return (b.grant?.title ?? "").localeCompare(a.grant?.title ?? "");
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

  if (rows.length === 0) {
    return (
      <EmptyState
        title="You haven't applied to any grants yet"
        description="Open grants live on Discover. Pick one, then apply from your project."
        action={
          <Link href="/discover">
            <Button variant="primary">Browse open grants</Button>
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
            placeholder="Project, grant, or cover note"
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
              { value: "az", label: "Grant A → Z" },
              { value: "za", label: "Grant Z → A" },
              { value: "funding_desc", label: "Funding: high → low" },
              { value: "funding_asc", label: "Funding: low → high" },
            ]}
          />
          <div className="flex items-end">
            <span className="text-xs text-[var(--color-fg-muted)]">
              {filtered.length} of {rows.length}
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
        <Table<ApplicationRow>
          rows={filtered}
          getRowKey={(r) => r.application.id}
          columns={[
            {
              key: "grant",
              header: "Grant",
              render: (r) => (
                <div className="flex flex-col gap-0.5">
                  {r.grant ? (
                    <Link
                      href={`/discover/grants/${r.grant.id}`}
                      className="text-sm font-bold underline underline-offset-2"
                    >
                      {r.grant.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-fg-subtle)]">
                      Unknown grant
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "project",
              header: "Project",
              render: (r) =>
                r.project ? (
                  <Link
                    href={`/projects/${r.project.id}`}
                    className="text-sm underline underline-offset-2"
                  >
                    {r.project.name}
                  </Link>
                ) : (
                  <span className="text-sm text-[var(--color-fg-subtle)]">Unknown project</span>
                ),
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Badge
                  variant={
                    r.application.status === "ACCEPTED" ? "inverted" : "default"
                  }
                >
                  {STATUS_LABEL[r.application.status]}
                </Badge>
              ),
            },
            {
              key: "funding",
              header: "Funding",
              render: (r) =>
                r.application.fundingRequested != null ? (
                  <span className="text-sm font-mono">
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
                  <span className="text-xs text-[var(--color-fg-subtle)]">Draft</span>
                ),
              className: "w-28",
            },
            {
              key: "actions",
              header: "",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Link href={`/applications/${r.application.id}`}>
                    <Button size="sm" variant="secondary">
                      {r.application.status === "DRAFT" ? "Continue" : "View"}
                    </Button>
                  </Link>
                </div>
              ),
              className: "w-28",
            },
          ]}
        />
      )}
    </div>
  );
}
