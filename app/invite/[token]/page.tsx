import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import {
  findInvitationByToken,
  invitationState,
} from "@/lib/mock/invitations";
import { findOrgById } from "@/lib/mock/orgs";
import { findGrantById } from "@/lib/mock/grants";
import { findUserById } from "@/lib/mock/users";
import { getServerUser } from "@/lib/auth/serverAuth";
import { InviteActions } from "./_components/InviteActions";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InviteTokenPage({ params }: PageProps) {
  const { token } = await params;
  const invite = findInvitationByToken(token);

  // Unknown / revoked token → 404. We intentionally don't leak the distinction.
  if (!invite) notFound();

  const state = invitationState(invite);
  const inviter = findUserById(invite.invitedBy) ?? null;
  const org =
    invite.organizationId !== null ? findOrgById(invite.organizationId) ?? null : null;
  const grant =
    invite.grantId !== null ? findGrantById(invite.grantId) ?? null : null;
  const grantOrg =
    grant?.organizationId !== undefined ? findOrgById(grant.organizationId) ?? null : null;

  const viewer = await getServerUser();
  const emailMatchesViewer = viewer?.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="flex flex-col">
      <PageHeader
        title="You've been invited"
        description="This is a public page — no login required to view the invitation details."
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET  /api/invites/:token",
              "POST /api/invites/:token/accept",
              "POST /api/invites/:token/decline",
            ]}
          />

          <Card title={invite.type === "ORGANIZATION" ? "Organization invite" : "Grant invite"}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    state === "PENDING"
                      ? "inverted"
                      : state === "ACCEPTED"
                        ? "default"
                        : "outline"
                  }
                >
                  {state}
                </Badge>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                  Expires {new Date(invite.expiresAt).toLocaleDateString()}
                </span>
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Invited email
                  </dt>
                  <dd className="mt-0.5 font-semibold">{invite.email}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    {invite.type === "ORGANIZATION" ? "Organization" : "Grant"}
                  </dt>
                  <dd className="mt-0.5 font-semibold">
                    {invite.type === "ORGANIZATION"
                      ? (org?.name ?? "Unknown organization")
                      : grant
                        ? `${grant.title}${grantOrg ? ` · ${grantOrg.name}` : ""}`
                        : "Unknown grant"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Role
                  </dt>
                  <dd className="mt-0.5 font-semibold">
                    {invite.orgRole ?? invite.grantRole ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                    Invited by
                  </dt>
                  <dd className="mt-0.5">{inviter?.name ?? "Someone from the team"}</dd>
                </div>
              </dl>

              {state === "PENDING" ? (
                viewer && !emailMatchesViewer ? (
                  <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
                    You&apos;re signed in as <strong>{viewer.email}</strong>, but this invite
                    was sent to <strong>{invite.email}</strong>. Sign out to accept this
                    invitation from a different account.
                  </p>
                ) : (
                  <InviteActions
                    token={invite.token}
                    needsLogin={!viewer}
                    destination={
                      invite.type === "ORGANIZATION" && org
                        ? `/dashboard/${org.slug}`
                        : grant && grantOrg
                          ? `/dashboard/${grantOrg.slug}/grants/${grant.id}`
                          : "/"
                    }
                  />
                )
              ) : state === "ACCEPTED" ? (
                <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
                  You already accepted this invitation{" "}
                  {invite.acceptedAt
                    ? `on ${new Date(invite.acceptedAt).toLocaleDateString()}`
                    : ""}
                  . It doesn&apos;t need any more action.
                </p>
              ) : state === "DECLINED" ? (
                <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
                  You declined this invitation. Reach out to {inviter?.name ?? "the sender"} if
                  you&apos;d like to revisit.
                </p>
              ) : (
                <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
                  This invitation has expired. Ask {inviter?.name ?? "the sender"} to send a
                  new one.
                </p>
              )}

              {!viewer && state === "PENDING" ? (
                <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
                  You&apos;ll need to sign in (or create an account with{" "}
                  <strong>{invite.email}</strong>) to accept.{" "}
                  <Link
                    href={`/login?returnTo=${encodeURIComponent(`/invite/${invite.token}`)}`}
                    className="underline underline-offset-2"
                  >
                    Sign in →
                  </Link>
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
