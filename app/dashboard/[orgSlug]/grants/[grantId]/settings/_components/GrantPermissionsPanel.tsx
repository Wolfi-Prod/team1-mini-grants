"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { GrantRole } from "@/lib/types";
import type { GrantPermissionRow } from "./types";

const ROLE_OPTIONS: { value: GrantRole; label: string }[] = [
  { value: "VIEWER", label: "Viewer — read-only access to applications + reviews" },
  { value: "EDITOR", label: "Editor — edit grant + questions + reviewers" },
  { value: "REVIEWER", label: "Reviewer — submit reviews, no admin" },
];

interface Candidate {
  id: string;
  name: string;
  email: string;
}

interface Props {
  initialPermissions: GrantPermissionRow[];
  candidates: Candidate[];
}

export function GrantPermissionsPanel({ initialPermissions, candidates }: Props) {
  const [rows, setRows] = useState<GrantPermissionRow[]>(initialPermissions);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<GrantPermissionRow | null>(null);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<GrantRole>("VIEWER");

  const assignedIds = useMemo(
    () => new Set(rows.map((r) => r.permission.userId)),
    [rows],
  );
  const availableCandidates = candidates.filter((c) => !assignedIds.has(c.id));

  function changeRole(id: string, next: GrantRole) {
    // API: PATCH /api/grants/:grantId/permissions/:permissionId  body: { role: next }
    setRows((prev) =>
      prev.map((r) =>
        r.permission.id === id
          ? { ...r, permission: { ...r.permission, role: next } }
          : r,
      ),
    );
    toast.success("Role updated (mock)");
  }

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    const candidate = candidates.find((c) => c.id === userId);
    if (!candidate) return;
    // API: POST /api/grants/:grantId/permissions  body: { userId, role }
    setRows((prev) => [
      ...prev,
      {
        permission: {
          id: `gp_local_${Date.now()}`,
          grantId: "mock",
          userId,
          role,
          createdAt: new Date().toISOString(),
        },
        user: { id: candidate.id, name: candidate.name, email: candidate.email },
      },
    ]);
    toast.success(`Added ${candidate.name} (mock)`);
    setAddOpen(false);
    setUserId("");
    setRole("VIEWER");
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/grants/:grantId/permissions/:permissionId
    const targetId = removing.permission.id;
    setRows((prev) => prev.filter((r) => r.permission.id !== targetId));
    toast.success("Collaborator removed (mock)");
    setRemoving(null);
  }

  return (
    <>
      <Card
        title={`Collaborators · ${rows.length}`}
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setAddOpen(true)}
            disabled={availableCandidates.length === 0}
          >
            Add collaborator
          </Button>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No extra collaborators"
            description="Org owners and whitelisted members already have full access to this grant. Add scoped roles only for outside users."
            action={
              <Button variant="primary" onClick={() => setAddOpen(true)}>
                Add collaborator
              </Button>
            }
          />
        ) : (
          <Table
            dense
            rows={rows}
            getRowKey={(r) => r.permission.id}
            empty="No collaborators"
            columns={[
              {
                key: "user",
                header: "User",
                render: (r) => (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-bold">{r.user?.name ?? "Unknown user"}</span>
                    <span className="break-all text-xs text-[var(--color-fg-muted)]">
                      {r.user?.email ?? "—"}
                    </span>
                  </div>
                ),
              },
              {
                key: "role",
                header: "Role",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <Select
                      value={r.permission.role}
                      onChange={(e) =>
                        changeRole(r.permission.id, e.target.value as GrantRole)
                      }
                      options={ROLE_OPTIONS}
                    />
                    <Badge>{r.permission.role}</Badge>
                  </div>
                ),
              },
              {
                key: "added",
                header: "Added",
                render: (r) => (
                  <span className="whitespace-nowrap text-xs">
                    {new Date(r.permission.createdAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (r) => (
                  <Button size="sm" variant="danger" onClick={() => setRemoving(r)}>
                    Remove
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setUserId("");
          setRole("VIEWER");
        }}
        title="Add collaborator"
        description="Pick a registered user. For outside emails, send an invite from the Reviewers page."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="grant-perm-form"
              variant="primary"
              disabled={!userId}
            >
              Add
            </Button>
          </div>
        }
      >
        <form id="grant-perm-form" onSubmit={handleAdd} className="flex flex-col gap-3">
          {availableCandidates.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-muted)]">
              Every registered user already has permissions on this grant.
            </p>
          ) : (
            <Select
              label="User"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              options={[
                { value: "", label: "Select a user..." },
                ...availableCandidates.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.email})`,
                })),
              ]}
            />
          )}
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as GrantRole)}
            options={ROLE_OPTIONS}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove collaborator?"
        message={
          removing ? (
            <>
              Remove <strong>{removing.user?.name ?? "this user"}</strong>&apos;s {removing.permission.role} access? Their existing reviews (if any) stay — they just lose further access.
            </>
          ) : null
        }
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
