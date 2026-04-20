"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { Badge } from "@/app/_components/ui/Badge";
import { isAssignmentComplete } from "@/lib/mock/reviews";
import type { Application, Project, ReviewerAssignment, User } from "@/lib/types";

interface AppRow {
  app: Application;
  project: Project | null;
  applicant: User | null;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  handle: string;
}

interface Props {
  applications: AppRow[];
  initialAssignments: ReviewerAssignment[];
  candidates: Candidate[];
}

export function ReviewersPanel({
  applications,
  initialAssignments,
  candidates,
}: Props) {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>(initialAssignments);
  const [assigningFor, setAssigningFor] = useState<AppRow | null>(null);
  const [removing, setRemoving] = useState<ReviewerAssignment | null>(null);
  const [reviewerId, setReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Lookup used by the assign modal to hide candidates already on this application.
  const assignedByApp = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of assignments) {
      if (!map.has(a.applicationId)) map.set(a.applicationId, new Set());
      map.get(a.applicationId)!.add(a.reviewerId);
    }
    return map;
  }, [assignments]);

  function openAssign(row: AppRow) {
    setAssigningFor(row);
    setReviewerId("");
    setDueDate("");
  }

  function closeAssign() {
    setAssigningFor(null);
    setReviewerId("");
    setDueDate("");
  }

  const candidatesForCurrent = useMemo(() => {
    if (!assigningFor) return [];
    const alreadyAssigned = assignedByApp.get(assigningFor.app.id) ?? new Set<string>();
    const applicantId = assigningFor.project?.userId;
    return candidates.filter(
      (c) => !alreadyAssigned.has(c.id) && c.id !== applicantId,
    );
  }, [assigningFor, assignedByApp, candidates]);

  function handleAssign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!assigningFor || !reviewerId) return;
    const candidate = candidates.find((c) => c.id === reviewerId);
    if (!candidate) return;
    // API: POST /api/grants/:grantId/reviewer-assignments
    // body: { applicationId, reviewerId, dueDate?: string | null }
    const next: ReviewerAssignment = {
      id: `ra_local_${Date.now()}`,
      applicationId: assigningFor.app.id,
      reviewerId,
      assignedBy: "user_owner",
      assignedAt: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };
    setAssignments((prev) => [...prev, next]);
    toast.success(`Assigned ${candidate.name} (mock)`);
    closeAssign();
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/grants/:grantId/reviewer-assignments/:assignmentId
    const target = removing;
    setAssignments((prev) => prev.filter((a) => a.id !== target.id));
    toast.success("Assignment removed (mock)");
    setRemoving(null);
  }

  if (applications.length === 0) {
    return (
      <Card title="Reviewers">
        <EmptyState
          title="No applications to review yet"
          description="Reviewer assignments unlock once applicants start submitting. Check back later."
        />
      </Card>
    );
  }

  return (
    <>
      {applications.map((row) => {
        const rowAssignments = assignments.filter(
          (a) => a.applicationId === row.app.id,
        );
        return (
          <Card
            key={row.app.id}
            title={row.project?.name ?? "Unknown project"}
            actions={
              <Button
                size="sm"
                variant="primary"
                onClick={() => openAssign(row)}
                disabled={false}
              >
                Assign reviewer
              </Button>
            }
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                <Badge>{row.app.status.replace("_", " ")}</Badge>
                <span>Applicant: {row.applicant?.name ?? "Unknown"}</span>
                {row.app.submittedAt ? (
                  <span>
                    · Submitted {new Date(row.app.submittedAt).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              {rowAssignments.length === 0 ? (
                <p className="text-xs text-[var(--color-fg-muted)]">
                  No reviewers assigned yet. Click above to pick someone.
                </p>
              ) : (
                <Table
                  dense
                  rows={rowAssignments}
                  getRowKey={(a) => a.id}
                  empty="No reviewers"
                  columns={[
                    {
                      key: "reviewer",
                      header: "Reviewer",
                      render: (a) => {
                        const candidate = candidates.find((c) => c.id === a.reviewerId);
                        return (
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-bold">
                              {candidate?.name ?? "Unknown reviewer"}
                            </span>
                            <span className="break-all text-xs text-[var(--color-fg-muted)]">
                              {candidate?.email}
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      key: "due",
                      header: "Due",
                      render: (a) =>
                        a.dueDate ? (
                          <span className="whitespace-nowrap text-xs">
                            {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                            —
                          </span>
                        ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (a) => {
                        const complete = isAssignmentComplete(a);
                        return (
                          <Badge variant={complete ? "inverted" : "default"}>
                            {complete ? "Completed" : "Pending"}
                          </Badge>
                        );
                      },
                    },
                    {
                      key: "actions",
                      header: "",
                      className: "text-right",
                      render: (a) => {
                        const complete = isAssignmentComplete(a);
                        return (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setRemoving(a)}
                            disabled={complete}
                            title={
                              complete
                                ? "Can't unassign after a review is submitted"
                                : undefined
                            }
                          >
                            Remove
                          </Button>
                        );
                      },
                    },
                  ]}
                />
              )}
            </div>
          </Card>
        );
      })}

      <Modal
        open={assigningFor !== null}
        onClose={closeAssign}
        title={
          assigningFor
            ? `Assign reviewer to ${assigningFor.project?.name ?? "application"}`
            : "Assign reviewer"
        }
        description="Pick a reviewer from the pool. Applicants can't review their own project."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeAssign}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="assign-reviewer-form"
              variant="primary"
              disabled={!reviewerId}
            >
              Assign
            </Button>
          </div>
        }
      >
        <form
          id="assign-reviewer-form"
          onSubmit={handleAssign}
          className="flex flex-col gap-3"
        >
          {candidatesForCurrent.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-muted)]">
              Every eligible reviewer is already assigned to this application.
            </p>
          ) : (
            <Select
              label="Reviewer"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              options={[
                { value: "", label: "Select a reviewer..." },
                ...candidatesForCurrent.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.email})`,
                })),
              ]}
            />
          )}
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            hint="Optional — shows in the reviewer's queue."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove assignment?"
        message={
          removing ? (
            <>
              Remove this assignment? The reviewer won&apos;t see this application in their
              queue. If they already wrote a review this action is blocked (the Remove
              button is disabled in that case).
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
