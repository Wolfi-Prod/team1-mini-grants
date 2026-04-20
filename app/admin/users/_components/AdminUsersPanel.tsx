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
import type { AdminUserRow } from "./types";

type Filter = "all" | "admins" | "active" | "deleted";

interface Props {
  initialRows: AdminUserRow[];
  viewerId: string | null;
}

export function AdminUsersPanel({ initialRows, viewerId }: Props) {
  const [rows, setRows] = useState<AdminUserRow[]>(initialRows);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<
    | { kind: "promote" | "demote" | "delete"; row: AdminUserRow }
    | null
  >(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (filter === "admins" && !r.user.isPlatformAdmin) return false;
        if (filter === "active" && r.user.deletedAt) return false;
        if (filter === "deleted" && !r.user.deletedAt) return false;
        if (!q) return true;
        return (
          r.user.name.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q) ||
          r.user.handle.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.user.name.localeCompare(b.user.name));
  }, [rows, search, filter]);

  const adminCount = rows.filter((r) => r.user.isPlatformAdmin && !r.user.deletedAt).length;

  function runAction() {
    if (!pending) return;
    const { kind, row } = pending;
    if (kind === "promote" || kind === "demote") {
      if (kind === "demote" && adminCount <= 1) {
        toast.error("At least one platform admin is required");
        setPending(null);
        return;
      }
      if (kind === "demote" && row.user.id === viewerId) {
        toast.error("You can't demote yourself");
        setPending(null);
        return;
      }
      // API: PATCH /api/admin/users/:userId  body: { isPlatformAdmin: boolean }
      setRows((prev) =>
        prev.map((r) =>
          r.user.id === row.user.id
            ? { ...r, user: { ...r.user, isPlatformAdmin: kind === "promote" } }
            : r,
        ),
      );
      toast.success(
        kind === "promote"
          ? `${row.user.name} is now a platform admin (mock)`
          : `${row.user.name} demoted to regular user (mock)`,
      );
    } else {
      // API: DELETE /api/admin/users/:userId  — soft-delete + scrub PII
      setRows((prev) =>
        prev.map((r) =>
          r.user.id === row.user.id
            ? { ...r, user: { ...r.user, deletedAt: new Date().toISOString() } }
            : r,
        ),
      );
      toast.success(`Deleted ${row.user.name} (mock)`);
    }
    setPending(null);
  }

  return (
    <>
      <Card
        title={`Users · ${rows.length} · ${adminCount} admin${adminCount === 1 ? "" : "s"}`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[240px]">
              <Input
                placeholder="Search by name, email, or handle…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "admins", "active", "deleted"] as Filter[]).map((f) => (
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
            getRowKey={(r) => r.user.id}
            empty="No users match"
            columns={[
              {
                key: "user",
                header: "User",
                render: (r) => {
                  const self = r.user.id === viewerId;
                  return (
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/u/${r.user.handle}`}
                          className="font-bold underline underline-offset-2"
                        >
                          {r.user.name}
                        </Link>
                        {self ? <Badge>YOU</Badge> : null}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        @{r.user.handle}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: "email",
                header: "Email",
                render: (r) => (
                  <span className="break-all text-xs">{r.user.email}</span>
                ),
              },
              {
                key: "orgs",
                header: "Orgs",
                numeric: true,
                render: (r) => r.orgMemberships,
              },
              {
                key: "apps",
                header: "Apps",
                numeric: true,
                render: (r) => r.applicationCount,
              },
              {
                key: "joined",
                header: "Joined",
                render: (r) => (
                  <span className="whitespace-nowrap text-xs">
                    {new Date(r.user.createdAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <div className="flex flex-wrap gap-1">
                    {r.user.isPlatformAdmin ? (
                      <Badge variant="inverted">ADMIN</Badge>
                    ) : null}
                    {r.user.deletedAt ? <Badge variant="outline">DELETED</Badge> : null}
                    {!r.user.onboardingCompletedAt ? <Badge>ONBOARDING</Badge> : null}
                    {!r.user.isPlatformAdmin && !r.user.deletedAt && r.user.onboardingCompletedAt ? (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                        active
                      </span>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (r) => {
                  const self = r.user.id === viewerId;
                  const isAdmin = r.user.isPlatformAdmin;
                  const deleted = r.user.deletedAt !== null;
                  return (
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/u/${r.user.handle}`}>
                        <Button size="sm" variant="secondary">
                          Profile
                        </Button>
                      </Link>
                      {isAdmin ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPending({ kind: "demote", row: r })}
                          disabled={self || adminCount <= 1}
                          title={
                            self
                              ? "You can't demote yourself"
                              : adminCount <= 1
                                ? "At least one admin required"
                                : undefined
                          }
                        >
                          Demote
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPending({ kind: "promote", row: r })}
                          disabled={deleted}
                        >
                          Make admin
                        </Button>
                      )}
                      {!deleted ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setPending({ kind: "delete", row: r })}
                          disabled={self}
                          title={self ? "Use /settings/account to delete yourself" : undefined}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  );
                },
              },
            ]}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.kind === "promote"
            ? "Promote to platform admin?"
            : pending?.kind === "demote"
              ? "Demote platform admin?"
              : "Delete user?"
        }
        message={
          pending ? (
            pending.kind === "promote" ? (
              <>
                Give <strong>{pending.row.user.name}</strong> platform-admin privileges?
                They&apos;ll see `/admin/*`, every org dashboard, and every project
                regardless of visibility.
              </>
            ) : pending.kind === "demote" ? (
              <>
                Remove platform-admin from <strong>{pending.row.user.name}</strong>?
                Their existing org memberships stay; only the platform-wide access revokes.
              </>
            ) : (
              <>
                Soft-delete <strong>{pending.row.user.name}</strong>? PII is scrubbed
                (name, telegram, wallet, bio). Projects and applications stay intact so
                orgs keep their audit trail.
              </>
            )
          ) : null
        }
        confirmLabel={
          pending?.kind === "promote"
            ? "Promote"
            : pending?.kind === "demote"
              ? "Demote"
              : "Delete"
        }
        destructive={pending?.kind === "demote" || pending?.kind === "delete"}
        onConfirm={runAction}
        onClose={() => setPending(null)}
      />
    </>
  );
}
