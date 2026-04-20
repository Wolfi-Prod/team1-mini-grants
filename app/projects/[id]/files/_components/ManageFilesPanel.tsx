"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import type { FileLink, Project } from "@/lib/types";

const FILE_TYPE_OPTIONS = [
  { value: "pitch-deck", label: "Pitch deck" },
  { value: "whitepaper", label: "Whitepaper" },
  { value: "demo-video", label: "Demo video" },
  { value: "design", label: "Design / Figma" },
  { value: "audit", label: "Audit report" },
  { value: "other", label: "Other" },
];

interface Props {
  project: Project;
  initialFiles: FileLink[];
}

interface FileDraft {
  name: string;
  url: string;
  type: string;
}

const EMPTY_DRAFT: FileDraft = {
  name: "",
  url: "",
  type: "pitch-deck",
};

function isHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ManageFilesPanel({ project, initialFiles }: Props) {
  // Local optimistic list — mock API doesn't persist.
  const [files, setFiles] = useState<FileLink[]>(initialFiles);
  const [addOpen, setAddOpen] = useState(false);
  const [editFile, setEditFile] = useState<FileLink | null>(null);
  const [removeFile, setRemoveFile] = useState<FileLink | null>(null);
  const [draft, setDraft] = useState<FileDraft>(EMPTY_DRAFT);

  const urlValid = isHttpUrl(draft.url.trim());
  const validDraft = draft.name.trim().length > 0 && urlValid;

  function openAdd() {
    setEditFile(null);
    setDraft(EMPTY_DRAFT);
    setAddOpen(true);
  }

  function openEdit(file: FileLink) {
    setEditFile(file);
    setDraft({ name: file.name, url: file.url, type: file.type });
    setAddOpen(true);
  }

  function closeModal() {
    setAddOpen(false);
    setEditFile(null);
    setDraft(EMPTY_DRAFT);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    if (editFile) {
      // API: PATCH /api/projects/:projectId/files/:fileId
      // body: { name, url, type }
      const updated: FileLink = {
        ...editFile,
        name: draft.name.trim(),
        url: draft.url.trim(),
        type: draft.type,
      };
      setFiles((prev) => prev.map((f) => (f.id === editFile.id ? updated : f)));
      toast.success(`Updated ${updated.name} (mock)`);
    } else {
      // API: POST /api/projects/:projectId/files
      // body: { name, url, type }
      const dupe = files.find((f) => f.url.trim() === draft.url.trim());
      if (dupe) {
        toast.error("That URL is already attached");
        return;
      }
      const newFile: FileLink = {
        id: `fl_local_${Date.now()}`,
        projectId: project.id,
        name: draft.name.trim(),
        url: draft.url.trim(),
        type: draft.type,
        uploadedBy: project.userId,
        createdAt: new Date().toISOString(),
      };
      setFiles((prev) => [newFile, ...prev]);
      toast.success(`Attached ${newFile.name} (mock)`);
    }
    closeModal();
  }

  function confirmRemove() {
    if (!removeFile) return;
    // API: DELETE /api/projects/:projectId/files/:fileId
    const target = removeFile;
    setFiles((prev) => prev.filter((f) => f.id !== target.id));
    toast.success(`Removed ${target.name} (mock)`);
    setRemoveFile(null);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Manage files — ${project.name}`}
        description="Attach pitch decks, whitepapers, audits, or demo recordings. Paste a URL — no uploads yet. Everything listed here shows on the project page unless the Files section is hidden."
        breadcrumbs={
          <Link href={`/projects/${project.id}`} className="underline underline-offset-2">
            ← Back to project
          </Link>
        }
        actions={
          <Button variant="primary" onClick={openAdd}>
            Attach file link
          </Button>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET    /api/projects/:id/files",
              "POST   /api/projects/:id/files",
              "PATCH  /api/projects/:id/files/:fileId",
              "DELETE /api/projects/:id/files/:fileId",
            ]}
          />

          <Card title={`Files · ${files.length} attached`}>
            {files.length === 0 ? (
              <EmptyState
                title="No files attached"
                description="Pitch decks, whitepapers, demos. Paste a URL — we support any public link."
                action={
                  <Button variant="primary" onClick={openAdd}>
                    Attach file link
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {files.map((f) => {
                  const typeLabel =
                    FILE_TYPE_OPTIONS.find((o) => o.value === f.type)?.label ?? f.type;
                  return (
                    <li
                      key={f.id}
                      className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold">{f.name}</span>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-xs text-[var(--color-fg-muted)] underline underline-offset-2"
                        >
                          {f.url}
                        </a>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(f)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRemoveFile(f)}
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <Modal
        open={addOpen}
        onClose={closeModal}
        title={editFile ? `Edit ${editFile.name}` : "Attach file link"}
        description="Name + URL are required. Type helps reviewers scan the list."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="file-link-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editFile ? "Save changes" : "Attach"}
            </Button>
          </div>
        }
      >
        <form id="file-link-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Name"
            placeholder="AvaSwap Pitch Deck"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            error={
              draft.url.length > 0 && !urlValid
                ? "Enter a full http:// or https:// URL"
                : undefined
            }
            required
          />
          <Select
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            options={FILE_TYPE_OPTIONS}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removeFile !== null}
        title="Remove file?"
        message={
          removeFile ? (
            <>
              Remove <strong>{removeFile.name}</strong> from {project.name}? The URL
              itself isn&apos;t deleted — we just stop listing it on your project.
            </>
          ) : null
        }
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onClose={() => setRemoveFile(null)}
      />
    </div>
  );
}
