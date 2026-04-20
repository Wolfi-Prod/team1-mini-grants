"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Modal } from "@/app/_components/ui/Modal";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { OrgRole } from "@/lib/types";
import type { OrgMemberRow } from "./types";

const ROLE_OPTIONS: { value: OrgRole; label: string }[] = [
  { value: "OWNER", label: "Owner — full control" },
  { value: "WHITELISTED", label: "Whitelisted — manage grants, no billing" },
];

interface Props {
  orgName: string;
  initialMembers: OrgMemberRow[];
}

export function ManageMembersPanel({ orgName, initialMembers }: Props) {
  const [members, setMembers] = useState<OrgMemberRow[]>(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<OrgMemberRow | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("WHITELISTED");
  const inviteEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());

  const ownerCount = members.filter((m) => m.membership.role === "OWNER").length;

  function changeRole(id: string, next: OrgRole) {
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.membership.id === id
          ? { ...m, membership: { ...m.membership, role: next } }
          : m,
      );
      // Prevent demoting the last owner.
      if (updated.filter((m) => m.membership.role === "OWNER").length === 0) {
        toast.error("At least one owner is required");
        return prev;
      }
      // API: PATCH /api/organizations/:orgId/members/:memberId  body: { role: next }
      toast.success("Role updated (mock)");
      return updated;
    });
  }

  function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inviteEmailValid) return;
    if (members.some((m) => m.user?.email.toLowerCase() === inviteEmail.toLowerCase())) {
      toast.error("That email is already a member");
      return;
    }
    // API: POST /api/organizations/:orgId/invitations
    //      body: { email, orgRole }
    // Server creates an Invitation row (not a member). This form mocks the visual.
    toast.success(
      `Invitation sent to ${inviteEmail.trim()} (mock) — they'll appear under Members after accepting.`,
    );
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("WHITELISTED");
  }

  function confirmRemove() {
    if (!removing) return;
    if (
      removing.membership.role === "OWNER" &&
      ownerCount === 1
    ) {
      toast.error("Can't remove the last owner");
      setRemoving(null);
      return;
    }
    // API: DELETE /api/organizations/:orgId/members/:memberId
    const targetId = removing.membership.id;
    setMembers((prev) => prev.filter((m) => m.membership.id !== targetId));
    toast.success("Member removed (mock)");
    setRemoving(null);
  }

  return (
    <>
      <Card
        title={`Members · ${members.length}`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            Invite member
          </Button>
        }
      >
        <Table
          dense
          rows={members}
          getRowKey={(m) => m.membership.id}
          empty="No members yet — every org needs at least one owner"
          columns={[
            {
              key: "member",
              header: "Member",
              render: (m) => (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bold">{m.user?.name ?? "Unknown user"}</span>
                  <span className="break-all text-xs text-[var(--color-fg-muted)]">
                    {m.user?.email ?? "—"}
                  </span>
                </div>
              ),
            },
            {
              key: "role",
              header: "Role",
              render: (m) => (
                <div className="flex items-center gap-2">
                  <Select
                    value={m.membership.role}
                    onChange={(e) =>
                      changeRole(m.membership.id, e.target.value as OrgRole)
                    }
                    options={ROLE_OPTIONS}
                  />
                  <Badge variant={m.membership.role === "OWNER" ? "inverted" : "default"}>
                    {m.membership.role}
                  </Badge>
                </div>
              ),
            },
            {
              key: "joined",
              header: "Joined",
              render: (m) => (
                <span className="whitespace-nowrap text-xs">
                  {new Date(m.membership.createdAt).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (m) => (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRemoving(m)}
                  disabled={m.membership.role === "OWNER" && ownerCount === 1}
                  title={
                    m.membership.role === "OWNER" && ownerCount === 1
                      ? "Promote another member to owner first"
                      : undefined
                  }
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteEmail("");
          setInviteRole("WHITELISTED");
        }}
        title={`Invite to ${orgName}`}
        description="We'll email a signed invite link. They join once they accept from /invite/<token> or their /invitations inbox."
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="org-invite-form"
              variant="primary"
              disabled={!inviteEmailValid}
            >
              Send invitation
            </Button>
          </div>
        }
      >
        <form id="org-invite-form" onSubmit={handleInvite} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            error={
              inviteEmail.length > 0 && !inviteEmailValid
                ? "Enter a valid email"
                : undefined
            }
            required
          />
          <Select
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as OrgRole)}
            options={ROLE_OPTIONS}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        title="Remove member?"
        message={
          removing ? (
            <>
              Remove <strong>{removing.user?.name ?? "this member"}</strong> from {orgName}?
              They lose dashboard access immediately. Any grants they created stay on the
              org.
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
