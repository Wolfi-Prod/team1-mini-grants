"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";
import { Textarea } from "@/app/_components/ui/Textarea";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { ApplicationStatus } from "@/lib/types";

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
  orgSlug: string;
  grantId: string;
}

type PendingDecision = "ACCEPT" | "REJECT" | null;

const DECIDED_STATUSES: ApplicationStatus[] = [
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export function DecisionPanel({
  applicationId,
  currentStatus,
  orgSlug,
  grantId,
}: Props) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState<PendingDecision>(null);

  const decided = DECIDED_STATUSES.includes(currentStatus);

  function confirmDecision() {
    if (!pending) return;
    const isAccept = pending === "ACCEPT";
    // API: PATCH /api/applications/:id
    // body: { status: isAccept ? "ACCEPTED" : "REJECTED", decisionFeedback: feedback }
    toast.success(
      isAccept
        ? `Application accepted (mock). Applicant will be notified.`
        : `Application rejected (mock). Applicant will be notified.`,
    );
    setPending(null);
    setFeedback("");
    router.refresh();
    void applicationId;
    void orgSlug;
    void grantId;
  }

  function handleRequestChanges() {
    if (feedback.trim().length < 10) {
      toast("Write at least 10 characters of feedback first.");
      return;
    }
    // API: POST /api/applications/:id/request-changes
    // body: { feedback }
    toast.success("Request-changes message sent (mock).");
    setFeedback("");
    router.refresh();
  }

  if (decided) {
    return (
      <Card title="Decision">
        <p className="text-sm">
          This application has already been decided ({currentStatus}). Reopen from the
          grant settings if you need to change it.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card title="Decision">
        <div className="flex flex-col gap-3">
          <Textarea
            label="Decision feedback"
            rows={4}
            placeholder="Why accept / reject / request changes? Shared with the applicant."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => setPending("ACCEPT")}
            >
              Accept application
            </Button>
            <Button variant="secondary" onClick={handleRequestChanges}>
              Request changes
            </Button>
            <Button
              variant="danger"
              onClick={() => setPending("REJECT")}
            >
              Reject application
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={pending === "ACCEPT" ? "Accept application?" : "Reject application?"}
        destructive={pending === "REJECT"}
        confirmLabel={pending === "ACCEPT" ? "Accept" : "Reject"}
        message={
          pending === "ACCEPT" ? (
            <>
              Accepting marks the application as <strong>ACCEPTED</strong>. The applicant
              is notified and funding can be disbursed. This decision is reversible only
              from grant settings.
            </>
          ) : (
            <>
              Rejecting marks the application as <strong>REJECTED</strong>. The applicant
              is notified. Feedback above is shared with them.
            </>
          )
        }
        onConfirm={confirmDecision}
        onClose={() => setPending(null)}
      />
    </>
  );
}
