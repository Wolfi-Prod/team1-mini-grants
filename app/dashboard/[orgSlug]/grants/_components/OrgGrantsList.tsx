"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { Badge } from "@/app/_components/ui/Badge";
import { Table } from "@/app/_components/ui/Table";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { Grant, GrantStatus } from "@/lib/types";

type StatusFilter = "ALL" | GrantStatus;

const STATUS_PILLS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "DRAFT", label: "Draft" },
  { key: "CLOSED", label: "Closed" },
  { key: "ARCHIVED", label: "Archived" },
];

interface Props {
  orgSlug: string;
  grants: Grant[];
  countsByGrant: Record<string, number>;
}

export function OrgGrantsList({ orgSlug, grants, countsByGrant }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [archiveTarget, setArchiveTarget] = useState<Grant | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grants.filter((g) => {
      if (status !== "ALL" && g.status !== status) return false;
      if (q) {
        const hay = `${g.title} ${g.description} ${g.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [grants, search, status]);

  if (grants.length === 0) {
    return (
      <EmptyState
        title="No grants yet"
        description="Create your first grant to start accepting applications."
        action={
          <Link href={`/dashboard/${orgSlug}/grants/new`}>
            <Button variant="primary">Create grant</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 border border-[var(--color-border-muted)] p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Search"
            placeholder="Title, description, slug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <span className="text-xs text-[var(--color-fg-muted)]">
          {filtered.length} of {grants.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No grants match"
          description="Try clearing the filter or the search."
        />
      ) : (
        <Table<Grant>
          rows={filtered}
          getRowKey={(g) => g.id}
          columns={[
            {
              key: "title",
              header: "Title",
              render: (g) => (
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`/dashboard/${orgSlug}/grants/${g.id}/applications`}
                    className="text-sm font-bold underline underline-offset-2"
                  >
                    {g.title}
                  </Link>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                    @{g.slug}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (g) => (
                <Badge variant={g.status === "OPEN" ? "inverted" : "default"}>
                  {g.status}
                </Badge>
              ),
              className: "w-28",
            },
            {
              key: "apps",
              header: "Applications",
              render: (g) => {
                const n = countsByGrant[g.id] ?? 0;
                return (
                  <Link
                    href={`/dashboard/${orgSlug}/grants/${g.id}/applications`}
                    className="text-sm font-mono underline underline-offset-2"
                  >
                    {n}
                  </Link>
                );
              },
              className: "w-28",
            },
            {
              key: "pool",
              header: "Pool",
              render: (g) =>
                g.fundingPool != null ? (
                  <span className="font-mono text-sm">
                    ${g.fundingPool.toLocaleString()} {g.currency}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-fg-subtle)]">—</span>
                ),
              className: "w-40",
            },
            {
              key: "deadline",
              header: "Deadline",
              render: (g) =>
                g.deadline ? (
                  <span className="text-xs">
                    {new Date(g.deadline).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--color-fg-subtle)]">Rolling</span>
                ),
              className: "w-28",
            },
            {
              key: "actions",
              header: "",
              render: (g) => (
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/${orgSlug}/grants/${g.id}/applications`}>
                    <Button size="sm" variant="secondary">
                      Open
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setArchiveTarget(g)}
                  >
                    Archive
                  </Button>
                </div>
              ),
              className: "w-48",
            },
          ]}
        />
      )}

      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive grant?"
        destructive
        confirmLabel="Archive"
        message={
          archiveTarget ? (
            <>
              Archiving <strong>{archiveTarget.title}</strong> closes it to new
              applications. Existing applications stay intact. You can reopen or delete
              from the grant settings later.
            </>
          ) : (
            ""
          )
        }
        onConfirm={() => {
          if (archiveTarget) {
            // API: PATCH /api/grants/:id  body: { status: "ARCHIVED" }
            toast.success(`Archived "${archiveTarget.title}" (mock)`);
          }
        }}
        onClose={() => setArchiveTarget(null)}
      />
    </div>
  );
}
