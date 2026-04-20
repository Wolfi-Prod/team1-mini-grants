"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import type { Review, ReviewDecision } from "@/lib/types";

interface Props {
  applicationId: string;
  existingReview: Review | null;
}

const DECISION_OPTIONS: { value: ReviewDecision; label: string; hint: string }[] = [
  { value: "APPROVE", label: "Approve", hint: "You recommend funding this application." },
  {
    value: "REQUEST_CHANGES",
    label: "Request changes",
    hint: "You need more info or edits before deciding.",
  },
  { value: "REJECT", label: "Reject", hint: "You recommend rejecting this application." },
];

export function ReviewForm({ applicationId, existingReview }: Props) {
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision>(
    existingReview?.decision ?? "APPROVE",
  );
  const [score, setScore] = useState<string>(
    existingReview?.score != null ? String(existingReview.score) : "",
  );
  const [feedback, setFeedback] = useState(existingReview?.feedback ?? "");
  const [submitting, setSubmitting] = useState(false);

  const scoreNum = score === "" ? null : Number(score);
  const scoreInvalid =
    score !== "" &&
    (Number.isNaN(scoreNum) || (scoreNum ?? 0) < 1 || (scoreNum ?? 0) > 10);

  const feedbackOk = feedback.trim().length >= 10;
  const canSubmit = !scoreInvalid && feedbackOk;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // API: existingReview
    //   ? PATCH /api/reviews/:id  body: { decision, score, feedback }
    //   : POST  /api/reviews       body: { applicationId, decision, score, feedback }
    toast.success(
      existingReview ? "Review updated (mock)." : "Review submitted (mock).",
    );
    router.push("/reviews");
    void applicationId;
  }

  return (
    <Card
      title={existingReview ? "Your review" : "Submit your review"}
      description={
        existingReview
          ? `Last updated ${new Date(existingReview.updatedAt).toLocaleString()}`
          : "Your review is shared with org admins and other reviewers on this application."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide">
            Decision <span aria-hidden>*</span>
          </span>
          <div className="flex flex-col gap-2">
            {DECISION_OPTIONS.map((opt) => {
              const active = decision === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDecision(opt.value)}
                  className={
                    active
                      ? "flex flex-col items-start gap-0.5 border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] p-3 text-left text-[var(--color-fg-on-inverted)]"
                      : "flex flex-col items-start gap-0.5 border border-[var(--color-border-muted)] bg-[var(--color-bg)] p-3 text-left hover:bg-[var(--color-bg-muted)]"
                  }
                >
                  <span className="text-sm font-bold uppercase tracking-wide">
                    {opt.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest opacity-70">
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Score (1–10)"
          type="number"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          error={scoreInvalid ? "Score must be between 1 and 10." : undefined}
          hint="Optional. Shared with the org."
        />

        <Textarea
          label="Feedback"
          rows={6}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What did you like? What concerned you? What should the applicant fix? Min 10 characters."
          required
        />

        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-muted)] pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/reviews")}
          >
            Back to queue
          </Button>
          <Button type="submit" variant="primary" disabled={!canSubmit || submitting}>
            {existingReview ? "Update review" : "Submit review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
