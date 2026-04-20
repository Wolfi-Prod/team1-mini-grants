"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { WEBHOOK_EVENT_OPTIONS, type WebhookEvent, type WebhookRow } from "./types";

interface Props {
  initialRows: WebhookRow[];
}

function randomSecret() {
  return (
    "whsec_mock_" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export function WebhooksPanel({ initialRows }: Props) {
  const [rows, setRows] = useState<WebhookRow[]>(initialRows);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WebhookRow | null>(null);
  const [removing, setRemoving] = useState<WebhookRow | null>(null);

  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  const urlValid = /^https:\/\/.+/.test(url.trim());
  const validDraft = urlValid && events.length > 0;

  function openAdd() {
    setEditing(null);
    setUrl("");
    setEvents([]);
    setModalOpen(true);
  }

  function openEdit(row: WebhookRow) {
    setEditing(row);
    setUrl(row.url);
    setEvents(row.events);
    setModalOpen(true);
  }

  function close() {
    setModalOpen(false);
    setEditing(null);
    setUrl("");
    setEvents([]);
  }

  function toggleEvent(ev: WebhookEvent) {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    if (editing) {
      // API: PATCH /api/organizations/:orgId/webhooks/:webhookId
      setRows((prev) =>
        prev.map((r) =>
          r.id === editing.id ? { ...r, url: url.trim(), events: [...events] } : r,
        ),
      );
      toast.success("Webhook updated (mock)");
    } else {
      // API: POST /api/organizations/:orgId/webhooks
      const next: WebhookRow = {
        id: `wh_local_${Date.now()}`,
        url: url.trim(),
        events: [...events],
        secret: randomSecret(),
        enabled: true,
        lastDeliveredAt: null,
        lastStatus: null,
        createdAt: new Date().toISOString(),
      };
      setRows((prev) => [next, ...prev]);
      toast.success(`Webhook registered — secret: ${next.secret} (mock, copy now)`);
    }
    close();
  }

  function toggleEnabled(row: WebhookRow) {
    // API: PATCH /api/organizations/:orgId/webhooks/:webhookId  body: { enabled }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, enabled: !r.enabled } : r)),
    );
    toast.success(row.enabled ? "Webhook disabled (mock)" : "Webhook enabled (mock)");
  }

  function rotateSecret(row: WebhookRow) {
    // API: POST /api/organizations/:orgId/webhooks/:webhookId/rotate-secret
    const next = randomSecret();
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, secret: next } : r)));
    toast.success(`New secret: ${next} (mock, copy now)`);
  }

  function sendTest(row: WebhookRow) {
    // API: POST /api/organizations/:orgId/webhooks/:webhookId/test
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id
          ? { ...r, lastDeliveredAt: new Date().toISOString(), lastStatus: "OK" }
          : r,
      ),
    );
    toast.success(`Test event sent to ${row.url} (mock)`);
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/organizations/:orgId/webhooks/:webhookId
    setRows((prev) => prev.filter((r) => r.id !== removing.id));
    toast.success("Webhook removed (mock)");
    setRemoving(null);
  }

  return (
    <>
      <Card
        title={`Registered · ${rows.length}`}
        actions={
          <Button size="sm" variant="primary" onClick={openAdd}>
            Add webhook
          </Button>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No webhooks yet"
            description="Register a URL to receive JSON payloads when events fire."
            action={
              <Button variant="primary" onClick={openAdd}>
                Add webhook
              </Button>
            }
          />
        ) : (
          <Table
            dense
            rows={rows}
            getRowKey={(r) => r.id}
            empty="No webhooks"
            columns={[
              {
                key: "endpoint",
                header: "Endpoint",
                render: (row) => (
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="break-all text-sm font-semibold">{row.url}</span>
                    <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">
                      {row.secret}
                    </span>
                  </div>
                ),
              },
              {
                key: "events",
                header: "Events",
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    {row.events.map((ev) => (
                      <span
                        key={ev}
                        className="border border-[var(--color-border-muted)] px-2 py-0.5 font-mono text-[10px] normal-case"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <div className="flex flex-col gap-1">
                    <Badge variant={row.enabled ? "inverted" : "default"}>
                      {row.enabled ? "ENABLED" : "DISABLED"}
                    </Badge>
                    {row.lastStatus ? (
                      <Badge variant={row.lastStatus === "OK" ? "default" : "outline"}>
                        last: {row.lastStatus}
                      </Badge>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                        never delivered
                      </span>
                    )}
                    {row.lastDeliveredAt ? (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {new Date(row.lastDeliveredAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "actions",
                header: "",
                className: "text-right",
                render: (row) => (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => sendTest(row)}>
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => rotateSecret(row)}
                    >
                      Rotate
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleEnabled(row)}
                    >
                      {row.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setRemoving(row)}>
                      Remove
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={close}
        title={editing ? "Edit webhook" : "Register webhook"}
        description="HTTPS URL + at least one event. The secret is shown once on create + on rotate — store it."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="webhook-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editing ? "Save" : "Register"}
            </Button>
          </div>
        }
      >
        <form id="webhook-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your.app/webhooks/team1"
            error={
              url.length > 0 && !urlValid ? "Must be an https:// URL" : undefined
            }
            required
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide">
              Events <span aria-hidden>*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {WEBHOOK_EVENT_OPTIONS.map((ev) => {
                const active = events.includes(ev);
                return (
                  <button
                    key={ev}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleEvent(ev)}
                    className={
                      active
                        ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-mono normal-case text-[var(--color-fg-on-inverted)]"
                        : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-mono normal-case text-[var(--color-fg)]"
                    }
                  >
                    {ev}
                  </button>
                );
              })}
            </div>
            {events.length === 0 ? (
              <span className="text-xs text-red-700">Pick at least one event</span>
            ) : null}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove webhook?"
        message={
          removing ? (
            <>
              Delete the webhook pointed at <strong>{removing.url}</strong>? Any in-flight
              deliveries finish; new events stop.
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
