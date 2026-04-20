"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { DisbursementStatus, FundingDisbursement } from "@/lib/types";

const STATUS_OPTIONS: { value: DisbursementStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "USDC", label: "USDC" },
  { value: "AVAX", label: "AVAX" },
];

interface Props {
  applicationId: string;
  defaultCurrency: string;
  fundingRequested: number | null;
  initialDisbursements: FundingDisbursement[];
  readOnly: boolean;
}

interface Draft {
  amount: string;
  currency: string;
  status: DisbursementStatus;
  milestone: string;
  note: string;
  disbursedAt: string;
}

function emptyDraft(currency: string): Draft {
  return {
    amount: "",
    currency,
    status: "PENDING",
    milestone: "",
    note: "",
    disbursedAt: "",
  };
}

export function DisbursementsPanel({
  applicationId,
  defaultCurrency,
  fundingRequested,
  initialDisbursements,
  readOnly,
}: Props) {
  const [rows, setRows] = useState<FundingDisbursement[]>(initialDisbursements);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FundingDisbursement | null>(null);
  const [removing, setRemoving] = useState<FundingDisbursement | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft(defaultCurrency));

  const totals = useMemo(() => {
    const completed = rows
      .filter((r) => r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amount, 0);
    const pending = rows
      .filter((r) => r.status === "PENDING")
      .reduce((sum, r) => sum + r.amount, 0);
    return { completed, pending };
  }, [rows]);

  const amountNumber = Number(draft.amount);
  const amountValid =
    draft.amount.trim().length > 0 && Number.isFinite(amountNumber) && amountNumber > 0;
  const validDraft = amountValid;

  function openAdd() {
    setEditing(null);
    setDraft(emptyDraft(defaultCurrency));
    setModalOpen(true);
  }

  function openEdit(d: FundingDisbursement) {
    setEditing(d);
    setDraft({
      amount: String(d.amount),
      currency: d.currency,
      status: d.status,
      milestone: d.milestone ?? "",
      note: d.note ?? "",
      disbursedAt: d.disbursedAt ? d.disbursedAt.slice(0, 10) : "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setDraft(emptyDraft(defaultCurrency));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    const disbursedAt =
      draft.status === "COMPLETED" && draft.disbursedAt
        ? new Date(draft.disbursedAt).toISOString()
        : draft.status === "COMPLETED"
          ? new Date().toISOString()
          : null;
    if (editing) {
      // API: PATCH /api/applications/:appId/disbursements/:disbursementId
      setRows((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
                ...editing,
                amount: amountNumber,
                currency: draft.currency,
                status: draft.status,
                milestone: draft.milestone.trim() || null,
                note: draft.note.trim() || null,
                disbursedAt,
              }
            : r,
        ),
      );
      toast.success("Disbursement updated (mock)");
    } else {
      // API: POST /api/applications/:appId/disbursements
      const next: FundingDisbursement = {
        id: `disb_local_${Date.now()}`,
        applicationId,
        amount: amountNumber,
        currency: draft.currency,
        status: draft.status,
        milestone: draft.milestone.trim() || null,
        note: draft.note.trim() || null,
        disbursedAt,
        createdAt: new Date().toISOString(),
      };
      setRows((prev) => [next, ...prev]);
      toast.success("Disbursement recorded (mock)");
    }
    closeModal();
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/applications/:appId/disbursements/:disbursementId
    const targetId = removing.id;
    setRows((prev) => prev.filter((r) => r.id !== targetId));
    toast.success("Disbursement removed (mock)");
    setRemoving(null);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
            Completed
          </span>
          <span className="text-xl font-bold">
            {defaultCurrency} {totals.completed.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
            Pending
          </span>
          <span className="text-xl font-bold">
            {defaultCurrency} {totals.pending.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
            Funding requested
          </span>
          <span className="text-xl font-bold">
            {fundingRequested !== null
              ? `${defaultCurrency} ${fundingRequested.toLocaleString()}`
              : "—"}
          </span>
        </div>
      </div>

      <Card
        title={`Disbursements · ${rows.length}`}
        actions={
          !readOnly ? (
            <Button size="sm" variant="primary" onClick={openAdd}>
              Record disbursement
            </Button>
          ) : null
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No disbursements yet"
            description={
              readOnly
                ? "Once the application is accepted, you can record milestone payouts here."
                : "Record a milestone payment to start tracking funding flow."
            }
            action={
              !readOnly ? (
                <Button variant="primary" onClick={openAdd}>
                  Record disbursement
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table
            dense
            rows={rows}
            getRowKey={(d) => d.id}
            empty="No disbursements"
            columns={[
              {
                key: "amount",
                header: "Amount",
                numeric: true,
                render: (d) => (
                  <span className="whitespace-nowrap font-semibold">
                    {d.currency} {d.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (d) => (
                  <Badge variant={d.status === "COMPLETED" ? "inverted" : "default"}>
                    {d.status}
                  </Badge>
                ),
              },
              {
                key: "milestone",
                header: "Milestone",
                render: (d) => (
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {d.milestone ? (
                      <span className="text-xs">{d.milestone}</span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                        —
                      </span>
                    )}
                    {d.note ? (
                      <span className="text-[11px] text-[var(--color-fg-muted)]">{d.note}</span>
                    ) : null}
                  </div>
                ),
              },
              {
                key: "date",
                header: "Date",
                render: (d) => (
                  <span className="whitespace-nowrap text-xs text-[var(--color-fg-muted)]">
                    {d.disbursedAt
                      ? new Date(d.disbursedAt).toLocaleDateString()
                      : `created ${new Date(d.createdAt).toLocaleDateString()}`}
                  </span>
                ),
              },
              ...(!readOnly
                ? [
                    {
                      key: "actions",
                      header: "",
                      className: "text-right",
                      render: (d: typeof rows[number]) => (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEdit(d)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setRemoving(d)}
                          >
                            Remove
                          </Button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit disbursement" : "Record disbursement"}
        description="Amount is required. Setting status to Completed without a date stamps today automatically."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="disbursement-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editing ? "Save changes" : "Record"}
            </Button>
          </div>
        }
      >
        <form id="disbursement-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_120px]">
            <Input
              label="Amount"
              type="number"
              min={0}
              step={0.01}
              value={draft.amount}
              onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
              error={
                draft.amount.length > 0 && !amountValid
                  ? "Enter a positive number"
                  : undefined
              }
              required
            />
            <Select
              label="Currency"
              value={draft.currency}
              onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value }))}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <Select
            label="Status"
            value={draft.status}
            onChange={(e) =>
              setDraft((d) => ({ ...d, status: e.target.value as DisbursementStatus }))
            }
            options={STATUS_OPTIONS}
          />
          <Input
            label="Milestone"
            value={draft.milestone}
            onChange={(e) => setDraft((d) => ({ ...d, milestone: e.target.value }))}
            placeholder="Milestone 1 — initial deployment"
          />
          <Input
            label="Disbursed on"
            type="date"
            value={draft.disbursedAt}
            onChange={(e) => setDraft((d) => ({ ...d, disbursedAt: e.target.value }))}
            hint="Auto-stamps today if left blank and status is Completed."
          />
          <Textarea
            label="Note"
            rows={2}
            value={draft.note}
            onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            hint="Optional — tx hash, bank ref, anything for the audit trail."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove disbursement?"
        message={
          removing ? (
            <>
              Remove this {removing.currency} {removing.amount.toLocaleString()}{" "}
              {removing.status.toLowerCase()} disbursement? Totals re-compute; audit log
              keeps the trace.
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
