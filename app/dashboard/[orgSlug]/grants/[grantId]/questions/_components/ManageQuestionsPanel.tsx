"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { Badge } from "@/app/_components/ui/Badge";
import type { GrantQuestion, QuestionType } from "@/lib/types";

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "URL", label: "URL" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Single select" },
  { value: "MULTI_SELECT", label: "Multi select" },
];

const TYPE_LABELS: Record<QuestionType, string> = Object.fromEntries(
  TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<QuestionType, string>;

const SELECT_TYPES: QuestionType[] = ["SELECT", "MULTI_SELECT"];

interface Props {
  grantId: string;
  initialQuestions: GrantQuestion[];
}

interface Draft {
  label: string;
  description: string;
  type: QuestionType;
  options: string; // comma-separated
  isRequired: boolean;
}

const EMPTY_DRAFT: Draft = {
  label: "",
  description: "",
  type: "TEXTAREA",
  options: "",
  isRequired: true,
};

function splitOptions(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function ManageQuestionsPanel({ grantId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<GrantQuestion[]>(
    [...initialQuestions].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GrantQuestion | null>(null);
  const [removing, setRemoving] = useState<GrantQuestion | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const needsOptions = SELECT_TYPES.includes(draft.type);
  const optionsParsed = splitOptions(draft.options);
  const optionsValid = !needsOptions || optionsParsed.length >= 2;
  const validDraft = draft.label.trim().length > 0 && optionsValid;

  function openAdd() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(q: GrantQuestion) {
    setEditing(q);
    setDraft({
      label: q.label,
      description: q.description ?? "",
      type: q.type,
      options: q.options.join(", "),
      isRequired: q.isRequired,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    const options = needsOptions ? optionsParsed : [];
    if (editing) {
      // API: PATCH /api/grants/:grantId/questions/:questionId
      const updated: GrantQuestion = {
        ...editing,
        label: draft.label.trim(),
        description: draft.description.trim() || null,
        type: draft.type,
        options,
        isRequired: draft.isRequired,
      };
      setQuestions((prev) => prev.map((q) => (q.id === editing.id ? updated : q)));
      toast.success(`Updated question (mock)`);
    } else {
      // API: POST /api/grants/:grantId/questions
      const next: GrantQuestion = {
        id: `gq_local_${Date.now()}`,
        grantId,
        label: draft.label.trim(),
        description: draft.description.trim() || null,
        type: draft.type,
        options,
        isRequired: draft.isRequired,
        sortOrder: questions.length,
        createdAt: new Date().toISOString(),
      };
      setQuestions((prev) => [...prev, next]);
      toast.success(`Added question (mock)`);
    }
    closeModal();
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/grants/:grantId/questions/:questionId
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== removing.id)
        .map((q, i) => ({ ...q, sortOrder: i })),
    );
    toast.success(`Removed question (mock)`);
    setRemoving(null);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    // API: POST /api/grants/:grantId/questions/reorder  body: { order: [id, id, ...] }
    setQuestions((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((q, i) => ({ ...q, sortOrder: i }));
    });
  }

  return (
    <>
      <Card
        title={`Questions · ${questions.length}`}
        actions={
          <Button variant="primary" size="sm" onClick={openAdd}>
            Add question
          </Button>
        }
      >
        {questions.length === 0 ? (
          <EmptyState
            title="No questions yet"
            description="Applicants can still submit a cover note, but questions help you ask for structured details."
            action={
              <Button variant="primary" onClick={openAdd}>
                Add question
              </Button>
            }
          />
        ) : (
          <ol className="flex flex-col divide-y divide-black">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-muted)] text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">{q.label}</span>
                      <Badge>{TYPE_LABELS[q.type]}</Badge>
                      {q.isRequired ? <Badge variant="inverted">Required</Badge> : null}
                    </div>
                    {q.description ? (
                      <span className="text-xs text-[var(--color-fg-muted)]">{q.description}</span>
                    ) : null}
                    {SELECT_TYPES.includes(q.type) && q.options.length > 0 ? (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {q.options.join(" · ")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} aria-hidden />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => move(i, 1)}
                    disabled={i === questions.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} aria-hidden />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(q)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRemoving(q)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit question" : "Add question"}
        description="Label is required. For SELECT types, at least 2 comma-separated options are required."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="grant-question-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editing ? "Save changes" : "Add question"}
            </Button>
          </div>
        }
      >
        <form id="grant-question-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Label"
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            required
          />
          <Textarea
            label="Helper text"
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            hint="Optional — shown under the label when applicants answer."
          />
          <Select
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as QuestionType }))}
            options={TYPE_OPTIONS}
          />
          {needsOptions ? (
            <Input
              label="Options"
              value={draft.options}
              onChange={(e) => setDraft((d) => ({ ...d, options: e.target.value }))}
              hint="Comma-separated. Example: Red, Green, Blue"
              error={!optionsValid ? "Enter at least 2 options" : undefined}
              required
            />
          ) : null}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={draft.isRequired}
              onChange={(e) => setDraft((d) => ({ ...d, isRequired: e.target.checked }))}
            />
            <span>
              <span className="font-semibold">Required.</span> Applicants can&apos;t submit
              without filling this in.
            </span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove question?"
        message={
          removing ? (
            <>
              Remove <strong>{removing.label}</strong>? Existing applications keep their
              answer; new applications won&apos;t see this question.
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
