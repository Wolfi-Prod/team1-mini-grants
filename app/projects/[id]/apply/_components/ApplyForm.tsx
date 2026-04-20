"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Select } from "@/app/_components/ui/Select";
import type { Grant, GrantQuestion, Project } from "@/lib/types";

interface ApplyFormProps {
  project: Project;
  grant: Grant;
  questions: GrantQuestion[];
}

type AnswerValue = string | string[];

export function ApplyForm({ project, grant, questions }: ApplyFormProps) {
  const router = useRouter();

  const [coverNote, setCoverNote] = useState("");
  const [fundingRequested, setFundingRequested] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.sortOrder - b.sortOrder),
    [questions],
  );

  const fundingNum = Number(fundingRequested);
  const fundingInvalid =
    fundingRequested.length > 0 && (Number.isNaN(fundingNum) || fundingNum < 0);
  const overPool =
    grant.fundingPool != null && !fundingInvalid && fundingNum > grant.fundingPool;

  const missingRequired = useMemo(() => {
    if (coverNote.trim().length < 10) return true;
    for (const q of sortedQuestions) {
      if (!q.isRequired) continue;
      const val = answers[q.id];
      if (q.type === "MULTI_SELECT") {
        if (!Array.isArray(val) || val.length === 0) return true;
      } else {
        if (typeof val !== "string" || val.trim().length === 0) return true;
      }
    }
    return false;
  }, [coverNote, sortedQuestions, answers]);

  function updateAnswer(qId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function toggleMultiSelect(qId: string, option: string) {
    setAnswers((prev) => {
      const current = prev[qId];
      const arr = Array.isArray(current) ? current : [];
      const next = arr.includes(option)
        ? arr.filter((x) => x !== option)
        : [...arr, option];
      return { ...prev, [qId]: next };
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (missingRequired || fundingInvalid) return;
    setSubmitting(true);
    // API: POST /api/applications
    // body: {
    //   projectId, grantId, coverNote,
    //   fundingRequested?: number,
    // }
    // API: POST /api/applications/:id/answers
    // body: { answers: [{ questionId, answer }] }
    toast.success(`Application to "${grant.title}" submitted (mock).`);
    router.push(`/projects/${project.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card title="Grant">
        <div className="flex flex-col gap-2 border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold uppercase leading-tight">
                {grant.title}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                {grant.status}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/discover/grants/${grant.id}`)}
            >
              View grant
            </Button>
          </div>
          <p className="text-sm leading-relaxed">{grant.description}</p>
          {grant.requirements ? (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest">
                Requirements
              </h4>
              <p className="mt-0.5 text-xs leading-relaxed">{grant.requirements}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
            {grant.fundingPool != null ? (
              <span>
                Pool: ${grant.fundingPool.toLocaleString()} {grant.currency}
              </span>
            ) : null}
            {grant.deadline ? (
              <span>
                Deadline: {new Date(grant.deadline).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      <Card title="Your pitch">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Cover note"
            hint="Why should this grant fund your project? Min 10 characters."
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
            required
          />
          <Input
            label="Funding requested"
            type="number"
            min={0}
            step="any"
            leading="$"
            placeholder="0"
            hint={
              grant.fundingPool != null
                ? `Pool is $${grant.fundingPool.toLocaleString()} ${grant.currency}.`
                : "Optional."
            }
            value={fundingRequested}
            onChange={(e) => setFundingRequested(e.target.value)}
            error={
              fundingInvalid
                ? "Enter a positive number."
                : overPool
                  ? "Exceeds the grant's funding pool."
                  : undefined
            }
          />
        </div>
      </Card>

      <Card title="Grant questions">
        {sortedQuestions.length === 0 ? (
          <p className="text-sm text-[var(--color-fg-muted)]">
            This grant has no custom questions. Your cover note is enough.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {sortedQuestions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(val) => updateAnswer(q.id, val)}
                onToggleMulti={(opt) => toggleMultiSelect(q.id, opt)}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-muted)] pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/discover/grants/${grant.id}`)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={missingRequired || submitting || fundingInvalid}
        >
          Submit application
        </Button>
      </div>
    </form>
  );
}

interface QuestionFieldProps {
  question: GrantQuestion;
  value: AnswerValue | undefined;
  onChange: (value: string) => void;
  onToggleMulti: (option: string) => void;
}

function QuestionField({ question, value, onChange, onToggleMulti }: QuestionFieldProps) {
  const label = question.label;
  const hint = question.description ?? undefined;
  const required = question.isRequired;
  const stringVal = typeof value === "string" ? value : "";

  switch (question.type) {
    case "TEXT":
      return (
        <Input
          label={label}
          hint={hint}
          required={required}
          value={stringVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "URL":
      return (
        <Input
          label={label}
          hint={hint}
          required={required}
          type="url"
          placeholder="https://"
          value={stringVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "NUMBER":
      return (
        <Input
          label={label}
          hint={hint}
          required={required}
          type="number"
          value={stringVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "TEXTAREA":
      return (
        <Textarea
          label={label}
          hint={hint}
          required={required}
          rows={4}
          value={stringVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "SELECT":
      return (
        <Select
          label={label}
          hint={hint}
          required={required}
          placeholder="Select an option"
          options={question.options.map((o) => ({ value: o, label: o }))}
          value={stringVal}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "MULTI_SELECT": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide">
            {label}
            {required ? <span aria-hidden> *</span> : null}
          </label>
          <div className="flex flex-wrap gap-2">
            {question.options.map((opt) => {
              const active = arr.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggleMulti(opt)}
                  className={
                    active
                      ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                      : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {hint ? <p className="text-xs text-[var(--color-fg-subtle)]">{hint}</p> : null}
        </div>
      );
    }
    default:
      return null;
  }
}
