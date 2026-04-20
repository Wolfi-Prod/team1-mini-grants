"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Modal } from "@/app/_components/ui/Modal";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import type { Project, ProjectUpdate } from "@/lib/types";

interface Props {
  project: Project;
  initialUpdates: ProjectUpdate[];
}

interface Draft {
  title: string;
  content: string;
}

const EMPTY_DRAFT: Draft = { title: "", content: "" };

export function ManageUpdatesPanel({ project, initialUpdates }: Props) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectUpdate | null>(null);
  const [removing, setRemoving] = useState<ProjectUpdate | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const validDraft =
    draft.title.trim().length > 0 && draft.content.trim().length >= 20;

  function openAdd() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(u: ProjectUpdate) {
    setEditing(u);
    setDraft({ title: u.title, content: u.content });
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
    if (editing) {
      // API: PATCH /api/projects/:projectId/updates/:updateId
      const updated: ProjectUpdate = {
        ...editing,
        title: draft.title.trim(),
        content: draft.content.trim(),
      };
      setUpdates((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      toast.success("Update saved (mock)");
    } else {
      // API: POST /api/projects/:projectId/updates
      const next: ProjectUpdate = {
        id: `pu_local_${Date.now()}`,
        projectId: project.id,
        title: draft.title.trim(),
        content: draft.content.trim(),
        createdAt: new Date().toISOString(),
      };
      setUpdates((prev) => [next, ...prev]);
      toast.success("Update posted (mock)");
    }
    closeModal();
  }

  function confirmRemove() {
    if (!removing) return;
    // API: DELETE /api/projects/:projectId/updates/:updateId
    const target = removing;
    setUpdates((prev) => prev.filter((u) => u.id !== target.id));
    toast.success("Update removed (mock)");
    setRemoving(null);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Updates — ${project.name}`}
        description="Post progress updates. Applicants, reviewers, and the public (when the Updates section is visible) see these on the project page."
        breadcrumbs={
          <Link href={`/projects/${project.id}`} className="underline underline-offset-2">
            ← Back to project
          </Link>
        }
        actions={
          <Button variant="primary" onClick={openAdd}>
            Post update
          </Button>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET    /api/projects/:id/updates",
              "POST   /api/projects/:id/updates",
              "PATCH  /api/projects/:id/updates/:updateId",
              "DELETE /api/projects/:id/updates/:updateId",
            ]}
          />

          <Card title={`Posted · ${updates.length}`}>
            {updates.length === 0 ? (
              <EmptyState
                title="No updates yet"
                description="Post progress: milestones hit, releases shipped, metrics. Reviewers notice."
                action={
                  <Button variant="primary" onClick={openAdd}>
                    Post update
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {updates.map((u) => (
                  <li key={u.id} className="flex flex-col gap-2 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-bold">{u.title}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          Posted {new Date(u.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRemoving(u)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {u.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit update" : "Post update"}
        description="Title is required. Body must be at least 20 characters — reviewers read these."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="project-update-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editing ? "Save changes" : "Post"}
            </Button>
          </div>
        }
      >
        <form id="project-update-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Mainnet beta is live"
            required
          />
          <Textarea
            label="Body"
            rows={6}
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            hint="Markdown not rendered yet — plain text for now. Min 20 chars."
            error={
              draft.content.length > 0 && draft.content.trim().length < 20
                ? "At least 20 characters"
                : undefined
            }
            required
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove update?"
        message={
          removing ? (
            <>
              Remove <strong>{removing.title}</strong>? It disappears from the project page.
              Existing applications that referenced it keep their context.
            </>
          ) : null
        }
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
