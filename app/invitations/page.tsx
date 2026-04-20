import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerUser, getServerRole } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import {
  findInvitationsForEmail,
  invitationState,
} from "@/lib/mock/invitations";
import { findOrgById } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findUserById } from "@/lib/mock/users";
import type { Invitation } from "@/lib/types";

interface InviteRow {
  invitation: Invitation;
  state: ReturnType<typeof invitationState>;
  targetLabel: string;
  inviterName: string;
  whenLabel: string;
}

function buildRow(invitation: Invitation): InviteRow {
  const state = invitationState(invitation);
  const inviter = findUserById(invitation.invitedBy);
  const org =
    invitation.organizationId !== null
      ? findOrgById(invitation.organizationId) ?? null
      : null;
  const grant =
    invitation.grantId !== null ? findGrantById(invitation.grantId) ?? null : null;
  const grantOrg = grant ? findOrgById(grant.organizationId) ?? null : null;
  const targetLabel =
    invitation.type === "ORGANIZATION"
      ? (org?.name ?? "Unknown organization")
      : grant
        ? `${grant.title}${grantOrg ? ` · ${grantOrg.name}` : ""}`
        : "Unknown grant";

  const whenLabel =
    state === "PENDING"
      ? `expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
      : state === "ACCEPTED" && invitation.acceptedAt
        ? `accepted ${new Date(invitation.acceptedAt).toLocaleDateString()}`
        : state === "DECLINED" && invitation.declinedAt
          ? `declined ${new Date(invitation.declinedAt).toLocaleDateString()}`
          : `expired ${new Date(invitation.expiresAt).toLocaleDateString()}`;

  return {
    invitation,
    state,
    targetLabel,
    inviterName: inviter?.name ?? "someone",
    whenLabel,
  };
}

function InvitationTable({ rows }: { rows: InviteRow[] }) {
  return (
    <Table
      dense
      rows={rows}
      getRowKey={(r) => r.invitation.id}
      empty="No invitations"
      columns={[
        {
          key: "target",
          header: "Target",
          render: (r) => (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold">{r.targetLabel}</span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                invited by {r.inviterName}
              </span>
            </div>
          ),
        },
        {
          key: "type",
          header: "Type",
          render: (r) => (
            <Badge>{r.invitation.type === "ORGANIZATION" ? "Org" : "Grant"}</Badge>
          ),
        },
        {
          key: "role",
          header: "Role",
          render: (r) =>
            r.invitation.orgRole ?? r.invitation.grantRole ?? (
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                —
              </span>
            ),
        },
        {
          key: "state",
          header: "State",
          render: (r) => (
            <Badge
              variant={
                r.state === "PENDING"
                  ? "inverted"
                  : r.state === "ACCEPTED"
                    ? "default"
                    : "outline"
              }
            >
              {r.state}
            </Badge>
          ),
        },
        {
          key: "when",
          header: "When",
          render: (r) => (
            <span className="whitespace-nowrap text-xs text-[var(--color-fg-muted)]">
              {r.whenLabel}
            </span>
          ),
        },
        {
          key: "actions",
          header: "",
          className: "text-right",
          render: (r) => (
            <Link href={`/invite/${r.invitation.token}`}>
              <Button
                size="sm"
                variant={r.state === "PENDING" ? "primary" : "secondary"}
              >
                {r.state === "PENDING" ? "Review" : "View"}
              </Button>
            </Link>
          ),
        },
      ]}
    />
  );
}

export default async function InvitationsInboxPage() {
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/invitations"));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/invitations"));

  const all = findInvitationsForEmail(user.email);
  const pending: InviteRow[] = [];
  const past: InviteRow[] = [];
  for (const i of all) {
    const row = buildRow(i);
    if (row.state === "PENDING") pending.push(row);
    else past.push(row);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Invitations"
        description="Accept or decline invites sent to your email. Past invitations stay here as a receipt."
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET  /api/me/invitations",
              "POST /api/invites/:token/accept",
              "POST /api/invites/:token/decline",
            ]}
          />

          <Card title={`Pending · ${pending.length}`}>
            {pending.length === 0 ? (
              <EmptyState
                title="No pending invitations"
                description="When someone invites you to an org or a grant, it'll show up here."
              />
            ) : (
              <InvitationTable rows={pending} />
            )}
          </Card>

          {past.length > 0 ? (
            <Card title={`Past · ${past.length}`}>
              <InvitationTable rows={past} />
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
