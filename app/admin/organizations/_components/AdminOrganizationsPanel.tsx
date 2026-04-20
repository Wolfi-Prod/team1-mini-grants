"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { AdminOrgRow } from "./types";

type Filter = "all" | "active" | "suspended";

interface Props {
  initialRows: AdminOrgRow[];
}

export function AdminOrganizationsPanel({ initialRows }: Props) {
  const [rows, setRows] = useState<AdminOrgRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingAction, setPendingAction] = useState<
    | { kind: "suspend" | "restore"; row: AdminOrgRow }
    | null
  >(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (filter === "active" && r.org.deletedAt) return false;
        if (filter === "suspended" && !r.org.deletedAt) return false;
        if (!q) return true;
        return (
          r.org.name.toLowerCase().includes(q) ||
          r.org.slug.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.org.name.localeCompare(b.org.name));
  }, [rows, search, filter]);

  function runAction() {
    if (!pendingAction) return;
    const { kind, row } = pendingAction;
    // API: POST /api/admin/organizations/:orgId/suspend  OR  /restore
    if (kind === "suspend") {
      setRows((prev) =>
        prev.map((r) =>
          r.org.id === row.org.id
            ? { ...r, org: { ...r.org, deletedAt: new Date().toISOString() } }
            : r,
        ),
      );
      toast.success(`Suspended ${row.org.name} (mock)`);
    } else {
      setRows((prev) =>
        prev.map((r) =>
          r.org.id === row.org.id ? { ...r, org: { ...r.org, deletedAt: null } } : r,
        ),
      );
      toast.success(`Restored ${row.org.name} (mock)`);
    }
    setPendingAction(null);
  }

  return (
    <>
      <Card title={`All organizations · ${rows.length}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[240px]">
              <Input
                placeholder="Search by name or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "suspended"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={
                    filter === f
                      ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                      : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Table
            dense
            rows={visible}
            getRowKey={(r) => r.org.id}
            empty="No organizations match"
            columns={[
              {
                key: "org",
                header: "Organization",
                render: (r) => (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link
                      href={`/dashboard/${r.org.slug}`}
                      className="font-bold underline underline-offset-2"
                    >
                      {r.org.name}
                    </Link>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      /{r.org.slug}
                    </span>
                    {r.org.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-fg-muted)]">
                        {r.org.description}
                      </p>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (r) =>
                  r.org.deletedAt ? (
                    <Badge variant="outline">SUSPENDED</Badge>
                  ) : (
                    <Badge variant="inverted">ACTIVE</Badge>
                  ),
              },
              {
                key: "members",
                header: "Members",
                numeric: true,
                render: (r) => r.memberCount,
              },
              {
                key: "grants",
                header: "Grants",
                numeric: true,
                render: (r) => (
                  <span>
                    {r.grantCount}
                    {r.openGrantCount > 0 ? (
                      <span className="ml-1 text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                        · {r.openGrantCount} open
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (r) => (
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/dashboard/${r.org.slug}`}>
                      <Button size="sm" variant="secondary">
                        Open
                      </Button>
                    </Link>
                    {r.org.deletedAt ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setPendingAction({ kind: "restore", row: r })}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingAction({ kind: "suspend", row: r })}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.kind === "suspend" ? "Suspend organization?" : "Restore organization?"}
        message={
          pendingAction ? (
            pendingAction.kind === "suspend" ? (
              <>
                Suspend <strong>{pendingAction.row.org.name}</strong>? Every member loses
                dashboard access and their grants stop accepting applications. Restoring
                undoes this instantly.
              </>
            ) : (
              <>
                Restore <strong>{pendingAction.row.org.name}</strong>? Members regain
                dashboard access; grants go back to their previous status.
              </>
            )
          ) : null
        }
        confirmLabel={pendingAction?.kind === "suspend" ? "Suspend" : "Restore"}
        destructive={pendingAction?.kind === "suspend"}
        onConfirm={runAction}
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
