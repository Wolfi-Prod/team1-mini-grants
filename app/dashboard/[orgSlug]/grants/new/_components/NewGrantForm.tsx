"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Select } from "@/app/_components/ui/Select";
import type { QuestionType } from "@/lib/types";

interface Props {
  orgSlug: string;
}

interface DraftQuestion {
  localId: string;
  label: string;
  description: string;
  type: QuestionType;
  options: string; // comma-separated for SELECT / MULTI_SELECT
  isRequired: boolean;
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "TEXT", label: "Short text" },
  { value: "TEXTAREA", label: "Long text" },
  { value: "URL", label: "URL" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Single select" },
  { value: "MULTI_SELECT", label: "Multi select" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function blankQuestion(): DraftQuestion {
  return {
    localId: `q_${Math.random().toString(36).slice(2, 8)}`,
    label: "",
    description: "",
    type: "TEXTAREA",
    options: "",
    isRequired: true,
  };
}

export function NewGrantForm({ orgSlug }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [fundingPool, setFundingPool] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "OPEN">("DRAFT");
  const [isPublic, setIsPublic] = useState(true);
  const [isFlagship, setIsFlagship] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  const derivedSlug = slugTouched ? slug : slugify(title);
  const fundingPoolNum = fundingPool === "" ? null : Number(fundingPool);
  const fundingPoolInvalid =
    fundingPool !== "" && (Number.isNaN(fundingPoolNum) || (fundingPoolNum ?? 0) < 0);

  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    derivedSlug.length > 0 &&
    !fundingPoolInvalid &&
    questions.every((q) => {
      if (q.label.trim().length === 0) return false;
      if (
        (q.type === "SELECT" || q.type === "MULTI_SELECT") &&
        q.options.trim().length === 0
      ) {
        return false;
      }
      return true;
    });

  function updateQuestion(localId: string, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q)),
    );
  }

  function removeQuestion(localId: string) {
    setQuestions((prev) => prev.filter((q) => q.localId !== localId));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, blankQuestion()]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: POST /api/grants
    // body: {
    //   title, slug, description, requirements?, fundingPool?, currency,
    //   deadline?, status, isPublic, isFlagship, organizationId
    // }
    // API: POST /api/grants/:id/questions  (bulk)
    // body: { questions: [{ label, description?, type, options[], isRequired, sortOrder }] }
    toast.success(
      `Grant "${title.trim()}" created as ${status} (mock). ${questions.length} question${
        questions.length === 1 ? "" : "s"
      }.`,
    );
    router.push(`/dashboard/${orgSlug}/grants`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card title="Grant details">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            placeholder="DeFi Builders Grant"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Slug"
            placeholder="defi-builders"
            hint="URL-friendly. Auto-derived from title — click to override."
            value={derivedSlug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            onFocus={() => {
              if (!slugTouched) {
                setSlug(derivedSlug);
                setSlugTouched(true);
              }
            }}
          />
          <Textarea
            label="Description"
            placeholder="What is this grant for, who is it for, what are you funding?"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Textarea
            label="Requirements"
            placeholder="Optional — what must applicants already have?"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Funding pool"
              type="number"
              min={0}
              step="any"
              leading="$"
              placeholder="100000"
              value={fundingPool}
              onChange={(e) => setFundingPool(e.target.value)}
              error={fundingPoolInvalid ? "Positive number." : undefined}
            />
            <Input
              label="Currency"
              placeholder="USD"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide">
              Publish status <span aria-hidden>*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {(["DRAFT", "OPEN"] as const).map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatus(s)}
                    className={
                      active
                        ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                        : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--color-fg-subtle)]">
              {status === "DRAFT"
                ? "Draft grants are only visible to your org. Applicants can't see or apply."
                : "Open grants are public on Discover and accept applications."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Public on Discover
            </label>
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
              <input
                type="checkbox"
                checked={isFlagship}
                onChange={(e) => setIsFlagship(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              Flagship (pinned hero)
            </label>
          </div>
        </div>
      </Card>

      <Card
        title="Questions"
        description="What applicants must answer beyond their cover note."
        actions={
          <Button size="sm" variant="secondary" onClick={addQuestion} type="button">
            + Add question
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          {questions.map((q, idx) => (
            <div key={q.localId} className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Question {idx + 1}
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  onClick={() => removeQuestion(q.localId)}
                  disabled={questions.length === 1}
                >
                  Remove
                </Button>
              </div>
              <Input
                label="Label"
                placeholder="e.g. What is your go-to-market plan?"
                value={q.label}
                onChange={(e) => updateQuestion(q.localId, { label: e.target.value })}
                required
              />
              <Input
                label="Helper text"
                placeholder="Optional"
                value={q.description}
                onChange={(e) =>
                  updateQuestion(q.localId, { description: e.target.value })
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Select
                  label="Type"
                  value={q.type}
                  options={QUESTION_TYPE_OPTIONS}
                  onChange={(e) =>
                    updateQuestion(q.localId, {
                      type: e.target.value as QuestionType,
                    })
                  }
                />
                <label className="flex items-center gap-2 self-end text-xs font-medium uppercase tracking-wide">
                  <input
                    type="checkbox"
                    checked={q.isRequired}
                    onChange={(e) =>
                      updateQuestion(q.localId, { isRequired: e.target.checked })
                    }
                    className="h-4 w-4 accent-black"
                  />
                  Required
                </label>
              </div>
              {q.type === "SELECT" || q.type === "MULTI_SELECT" ? (
                <Input
                  label="Options (comma-separated)"
                  placeholder="DEX, Lending, Stablecoin"
                  value={q.options}
                  onChange={(e) =>
                    updateQuestion(q.localId, { options: e.target.value })
                  }
                  required
                />
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-muted)] pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/dashboard/${orgSlug}/grants`)}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!valid || submitting}>
          {status === "DRAFT" ? "Save draft" : "Publish grant"}
        </Button>
      </div>
    </form>
  );
}
