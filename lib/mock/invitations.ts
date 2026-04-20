import type { Invitation } from "@/lib/types";

export const mockInvitations: Invitation[] = [
  {
    // Alice — pending org invitation. Fuels the /invitations inbox as Alice.
    id: "inv_01",
    email: "alice.applicant@example.com",
    token: "tok_subnet_member_01",
    type: "ORGANIZATION",
    organizationId: "org_subnet",
    grantId: null,
    orgRole: "WHITELISTED",
    grantRole: null,
    invitedBy: "user_owner",
    expiresAt: "2026-05-01T09:00:00Z",
    acceptedAt: null,
    declinedAt: null,
    createdAt: "2026-04-10T09:00:00Z",
  },
  {
    // Alice — pending grant reviewer invite. Second pending row in her inbox.
    id: "inv_03",
    email: "alice.applicant@example.com",
    token: "tok_infra_reviewer_03",
    type: "GRANT",
    organizationId: null,
    grantId: "grant_infra",
    orgRole: null,
    grantRole: "REVIEWER",
    invitedBy: "user_owner",
    expiresAt: "2026-05-05T09:00:00Z",
    acceptedAt: null,
    declinedAt: null,
    createdAt: "2026-04-12T09:00:00Z",
  },
  {
    // Alice — already-accepted invite. Shows in the "history" tab / past invites.
    id: "inv_04",
    email: "alice.applicant@example.com",
    token: "tok_past_04",
    type: "GRANT",
    organizationId: null,
    grantId: "grant_defi",
    orgRole: null,
    grantRole: "VIEWER",
    invitedBy: "user_owner",
    expiresAt: "2026-03-15T09:00:00Z",
    acceptedAt: "2026-02-28T09:00:00Z",
    declinedAt: null,
    createdAt: "2026-02-20T09:00:00Z",
  },
  {
    // Alice — expired, untouched. Shows with an EXPIRED badge.
    id: "inv_05",
    email: "alice.applicant@example.com",
    token: "tok_expired_05",
    type: "ORGANIZATION",
    organizationId: "org_avalanche",
    grantId: null,
    orgRole: "WHITELISTED",
    grantRole: null,
    invitedBy: "user_owner",
    expiresAt: "2026-02-01T09:00:00Z",
    acceptedAt: null,
    declinedAt: null,
    createdAt: "2026-01-01T09:00:00Z",
  },
  {
    // External user (not signed up yet) — surfaces on /invite/[token] without needing an account.
    id: "inv_02",
    email: "ruth.reviewer@example.com",
    token: "tok_defi_reviewer_02",
    type: "GRANT",
    organizationId: null,
    grantId: "grant_defi",
    orgRole: null,
    grantRole: "REVIEWER",
    invitedBy: "user_owner",
    expiresAt: "2026-04-30T09:00:00Z",
    acceptedAt: "2026-03-17T09:00:00Z",
    declinedAt: null,
    createdAt: "2026-03-15T09:00:00Z",
  },
];

export function findInvitationByToken(token: string): Invitation | undefined {
  return mockInvitations.find((i) => i.token === token);
}

export function findInvitationsForEmail(email: string): Invitation[] {
  return mockInvitations.filter((i) => i.email === email);
}

export function findPendingInvitationsForEmail(email: string): Invitation[] {
  return mockInvitations.filter(
    (i) => i.email === email && !i.acceptedAt && !i.declinedAt,
  );
}

export function isInvitationExpired(i: Invitation, now: Date = new Date()): boolean {
  return new Date(i.expiresAt).getTime() < now.getTime();
}

export function invitationState(
  i: Invitation,
): "PENDING" | "EXPIRED" | "ACCEPTED" | "DECLINED" {
  if (i.acceptedAt) return "ACCEPTED";
  if (i.declinedAt) return "DECLINED";
  if (isInvitationExpired(i)) return "EXPIRED";
  return "PENDING";
}
