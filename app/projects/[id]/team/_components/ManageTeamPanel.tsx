"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import { Modal } from "@/app/_components/ui/Modal";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import type { Project, ProjectTeamMember } from "@/lib/types";

interface Props {
  project: Project;
  initialTeam: ProjectTeamMember[];
}

interface MemberDraft {
  name: string;
  email: string;
  role: string;
  github: string;
  twitter: string;
  linkedIn: string;
}

const EMPTY_DRAFT: MemberDraft = {
  name: "",
  email: "",
  role: "",
  github: "",
  twitter: "",
  linkedIn: "",
};

export function ManageTeamPanel({ project, initialTeam }: Props) {
  // Local optimistic list — mock API doesn't persist, so we stash adds/removes here
  // so the user sees immediate feedback until they refresh.
  const [team, setTeam] = useState<ProjectTeamMember[]>(initialTeam);
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<ProjectTeamMember | null>(null);
  const [removeMember, setRemoveMember] = useState<ProjectTeamMember | null>(null);
  const [draft, setDraft] = useState<MemberDraft>(EMPTY_DRAFT);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim());
  const validDraft = draft.name.trim().length > 0 && validEmail;

  function openAdd() {
    setEditMember(null);
    setDraft(EMPTY_DRAFT);
    setAddOpen(true);
  }

  function openEdit(member: ProjectTeamMember) {
    setEditMember(member);
    setDraft({
      name: member.name,
      email: member.email,
      role: member.role ?? "",
      github: member.github ?? "",
      twitter: member.twitter ?? "",
      linkedIn: member.linkedIn ?? "",
    });
    setAddOpen(true);
  }

  function closeModal() {
    setAddOpen(false);
    setEditMember(null);
    setDraft(EMPTY_DRAFT);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validDraft) return;
    if (editMember) {
      // API: PATCH /api/projects/:projectId/team/:memberId
      // body: { name, email, role?, github?, twitter?, linkedIn? }
      const updated: ProjectTeamMember = {
        ...editMember,
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role.trim() || null,
        github: draft.github.trim() || null,
        twitter: draft.twitter.trim() || null,
        linkedIn: draft.linkedIn.trim() || null,
      };
      setTeam((prev) => prev.map((m) => (m.id === editMember.id ? updated : m)));
      toast.success(`Updated ${updated.name} (mock)`);
    } else {
      // API: POST /api/projects/:projectId/team
      // body: { name, email, role?, github?, twitter?, linkedIn? }
      const dupe = team.find(
        (m) => m.email.toLowerCase() === draft.email.trim().toLowerCase(),
      );
      if (dupe) {
        toast.error(`${draft.email} is already on the team`);
        return;
      }
      const newMember: ProjectTeamMember = {
        id: `pt_local_${Date.now()}`,
        projectId: project.id,
        name: draft.name.trim(),
        email: draft.email.trim(),
        role: draft.role.trim() || null,
        github: draft.github.trim() || null,
        twitter: draft.twitter.trim() || null,
        linkedIn: draft.linkedIn.trim() || null,
      };
      setTeam((prev) => [...prev, newMember]);
      toast.success(`Added ${newMember.name} (mock)`);
    }
    closeModal();
  }

  function confirmRemove() {
    if (!removeMember) return;
    // API: DELETE /api/projects/:projectId/team/:memberId
    const target = removeMember;
    setTeam((prev) => prev.filter((m) => m.id !== target.id));
    toast.success(`Removed ${target.name} (mock)`);
    setRemoveMember(null);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Manage team — ${project.name}`}
        description="Add teammates so reviewers know who's building. Everyone listed here appears on the project page unless the Team section is hidden."
        breadcrumbs={
          <Link href={`/projects/${project.id}`} className="underline underline-offset-2">
            ← Back to project
          </Link>
        }
        actions={
          <Button variant="primary" onClick={openAdd}>
            Add member
          </Button>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET    /api/projects/:id/team",
              "POST   /api/projects/:id/team",
              "PATCH  /api/projects/:id/team/:memberId",
              "DELETE /api/projects/:id/team/:memberId",
            ]}
          />

          <Card title={`Team · ${team.length} member${team.length === 1 ? "" : "s"}`}>
            {team.length === 0 ? (
              <EmptyState
                title="No team members yet"
                description="Add your teammates so reviewers know who's building."
                action={
                  <Button variant="primary" onClick={openAdd}>
                    Add member
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-black">
                {team.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{m.name}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">{m.email}</span>
                      {m.role ? (
                        <span className="text-[10px] uppercase tracking-widest">
                          {m.role}
                        </span>
                      ) : null}
                      <div className="flex flex-wrap gap-3 pt-1 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {m.github ? <span>GH: {m.github}</span> : null}
                        {m.twitter ? <span>X: {m.twitter}</span> : null}
                        {m.linkedIn ? <span>LI: {m.linkedIn}</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setRemoveMember(m)}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <Modal
        open={addOpen}
        onClose={closeModal}
        title={editMember ? `Edit ${editMember.name}` : "Add team member"}
        description="Name + email are required. The rest are optional handles shown on the project page."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="team-member-form"
              variant="primary"
              disabled={!validDraft}
            >
              {editMember ? "Save changes" : "Add member"}
            </Button>
          </div>
        }
      >
        <form id="team-member-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            error={
              draft.email.length > 0 && !validEmail ? "Enter a valid email" : undefined
            }
            required
          />
          <Input
            label="Role"
            placeholder="e.g. Founder, Smart Contract Engineer"
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="GitHub"
              placeholder="handle"
              value={draft.github}
              onChange={(e) => setDraft((d) => ({ ...d, github: e.target.value }))}
            />
            <Input
              label="Twitter / X"
              placeholder="@handle"
              value={draft.twitter}
              onChange={(e) => setDraft((d) => ({ ...d, twitter: e.target.value }))}
            />
            <Input
              label="LinkedIn"
              placeholder="slug"
              value={draft.linkedIn}
              onChange={(e) => setDraft((d) => ({ ...d, linkedIn: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={removeMember !== null}
        title="Remove team member?"
        message={
          removeMember ? (
            <>
              Remove <strong>{removeMember.name}</strong> ({removeMember.email}) from{" "}
              {project.name}? They&apos;ll no longer appear on the project page. You can
              re-add them any time.
            </>
          ) : null
        }
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onClose={() => setRemoveMember(null)}
      />
    </div>
  );
}
