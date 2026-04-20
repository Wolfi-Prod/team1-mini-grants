"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { ApiKeyRow } from "./types";

interface Props {
  initialRows: ApiKeyRow[];
}

function mintKey() {
  const rand =
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const plaintext = `t1k_live_${rand}`;
  return { plaintext, prefix: plaintext.slice(0, 10) };
}

export function ApiKeysPanel({ initialRows }: Props) {
  const [rows, setRows] = useState<ApiKeyRow[]>(initialRows);
  const [modalOpen, setModalOpen] = useState(false);
  const [revoking, setRevoking] = useState<ApiKeyRow | null>(null);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"read" | "read-write">("read");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    row: ApiKeyRow;
    plaintext: string;
  } | null>(null);

  const validDraft = name.trim().length > 0;

  function openAdd() {
    setName("");
    setScope("read");
    setModalOpen(true);
  }

  function close() {
    setModalOpen(false);
    setName("");
    setScope("read");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    // API: POST /api/organizations/:orgId/api-keys  body: { name, scope }
    // Response returns plaintext ONCE; afterwards only the prefix is stored.
    const { plaintext, prefix } = mintKey();
    const next: ApiKeyRow = {
      id: `key_local_${Date.now()}`,
      name: name.trim(),
      prefix,
      scope,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      revokedAt: null,
    };
    setRows((prev) => [next, ...prev]);
    setNewlyCreatedKey({ row: next, plaintext });
    close();
  }

  function confirmRevoke() {
    if (!revoking) return;
    // API: DELETE /api/organizations/:orgId/api-keys/:keyId  (sets revokedAt)
    setRows((prev) =>
      prev.map((r) =>
        r.id === revoking.id ? { ...r, revokedAt: new Date().toISOString() } : r,
      ),
    );
    toast.success(`Revoked ${revoking.name} (mock)`);
    setRevoking(null);
  }

  function copy(s: string) {
    navigator.clipboard.writeText(s).catch(() => undefined);
    toast.success("Copied to clipboard");
  }

  const activeCount = rows.filter((r) => !r.revokedAt).length;
  const revokedCount = rows.length - activeCount;

  return (
    <>
      <Card
        title={`Keys · ${activeCount} active${revokedCount > 0 ? ` · ${revokedCount} revoked` : ""}`}
        actions={
          <Button size="sm" variant="primary" onClick={openAdd}>
            New key
          </Button>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No API keys yet"
            description="Mint a key to let external tools pull data. Rate-limited per key."
            action={
              <Button variant="primary" onClick={openAdd}>
                New key
              </Button>
            }
          />
        ) : (
          <Table
            dense
            rows={rows}
            getRowKey={(r) => r.id}
            empty="No keys"
            columns={[
              {
                key: "name",
                header: "Label",
                render: (row) => (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-bold">{row.name}</span>
                    <span className="font-mono text-[11px]">{row.prefix}•••••••</span>
                  </div>
                ),
              },
              {
                key: "scope",
                header: "Scope",
                render: (row) => <Badge>{row.scope}</Badge>,
              },
              {
                key: "status",
                header: "Status",
                render: (row) =>
                  row.revokedAt ? (
                    <Badge variant="outline">REVOKED</Badge>
                  ) : (
                    <Badge variant="inverted">ACTIVE</Badge>
                  ),
              },
              {
                key: "created",
                header: "Created",
                render: (row) => (
                  <span className="whitespace-nowrap text-xs">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "lastUsed",
                header: "Last used",
                render: (row) => (
                  <span className="whitespace-nowrap text-xs text-[var(--color-fg-muted)]">
                    {row.lastUsedAt
                      ? new Date(row.lastUsedAt).toLocaleDateString()
                      : "never"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (row) =>
                  row.revokedAt ? (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                      {new Date(row.revokedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => setRevoking(row)}>
                      Revoke
                    </Button>
                  ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={close}
        title="Mint API key"
        description="The full key is shown once on the next screen. Copy it before closing."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="api-key-form"
              variant="primary"
              disabled={!validDraft}
            >
              Create
            </Button>
          </div>
        }
      >
        <form id="api-key-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Label"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CI / staging dashboard / Grafana"
            hint="Internal — shown in this list. Helps you track where the key runs."
            required
          />
          <Select
            label="Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as "read" | "read-write")}
            options={[
              { value: "read", label: "Read-only — list + fetch endpoints" },
              {
                value: "read-write",
                label: "Read-write — not implemented yet (disabled)",
              },
            ]}
            disabled={false}
          />
        </form>
      </Modal>

      <Modal
        open={newlyCreatedKey !== null}
        onClose={() => setNewlyCreatedKey(null)}
        title="Copy your API key"
        description="This is the only time the full key is shown. Save it somewhere safe — we only keep a prefix."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => setNewlyCreatedKey(null)}
            >
              Done
            </Button>
          </div>
        }
      >
        {newlyCreatedKey ? (
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                Label
              </span>
              <p className="font-semibold">{newlyCreatedKey.row.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                Key
              </span>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-2 font-mono text-xs">
                  {newlyCreatedKey.plaintext}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copy(newlyCreatedKey.plaintext)}
                >
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-xs text-[var(--color-fg-muted)]">
              Use this in the <code>Authorization: Bearer …</code> header on requests to{" "}
              <code>api.team1.grants/v1/*</code>. Rate limit: 60 req/min per key.
            </p>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={revoking !== null}
        title="Revoke key?"
        message={
          revoking ? (
            <>
              Revoke <strong>{revoking.name}</strong>? Any app using this key starts
              getting 401s immediately. Revocation is permanent — mint a new key to roll.
            </>
          ) : null
        }
        confirmLabel="Revoke"
        destructive
        onConfirm={confirmRevoke}
        onClose={() => setRevoking(null)}
      />
    </>
  );
}
