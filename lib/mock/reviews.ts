import type { Review, ReviewerAssignment } from "@/lib/types";
import { mockApplications } from "@/lib/mock/applications";

export const mockReviewerAssignments: ReviewerAssignment[] = [
  {
    id: "ra_01",
    applicationId: "app_01",
    reviewerId: "user_reviewer",
    assignedBy: "user_owner",
    assignedAt: "2026-03-17T09:00:00Z",
    dueDate: "2026-04-20T23:59:59Z",
  },
  {
    id: "ra_02",
    applicationId: "app_01",
    reviewerId: "user_grantreviewer",
    assignedBy: "user_owner",
    assignedAt: "2026-03-17T09:00:00Z",
    dueDate: "2026-04-20T23:59:59Z",
  },
  {
    id: "ra_03",
    applicationId: "app_02",
    reviewerId: "user_reviewer",
    assignedBy: "user_owner",
    assignedAt: "2026-04-02T09:00:00Z",
    dueDate: "2026-04-25T23:59:59Z",
  },
  {
    // Oscar (user_owner) is assigned as a reviewer on the DeFi Builders application —
    // he runs org_avalanche and sits on the review panel too. Shows up in his /reviews
    // queue as Pending.
    id: "ra_04",
    applicationId: "app_01",
    reviewerId: "user_owner",
    assignedBy: "user_owner",
    assignedAt: "2026-03-17T09:00:00Z",
    dueDate: "2026-04-20T23:59:59Z",
  },
  {
    // Oscar also on the Infra application — which has already been ACCEPTED, so this is
    // a "completed" row he's already written a review for.
    id: "ra_05",
    applicationId: "app_04",
    reviewerId: "user_owner",
    assignedBy: "user_owner",
    assignedAt: "2026-02-10T09:00:00Z",
    dueDate: "2026-02-25T23:59:59Z",
  },
];

export const mockReviews: Review[] = [
  {
    id: "rev_01",
    applicationId: "app_01",
    reviewerId: "user_reviewer",
    decision: "APPROVE",
    feedback:
      "Strong team, shipped testnet, audit planned. Recommend approval at $40k instead of $50k.",
    score: 8,
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
  },
  {
    id: "rev_02",
    applicationId: "app_04",
    reviewerId: "user_reviewer",
    decision: "APPROVE",
    feedback: "Solid contribution, easy yes.",
    score: 9,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-02-20T09:00:00Z",
  },
  {
    id: "rev_03",
    applicationId: "app_04",
    reviewerId: "user_owner",
    decision: "APPROVE",
    feedback:
      "Agree with Ruth. Permafrost is a clean indexer contribution. Approve at the requested amount.",
    score: 9,
    createdAt: "2026-02-22T09:00:00Z",
    updatedAt: "2026-02-22T09:00:00Z",
  },
];

export function findAssignmentsForReviewer(userId: string): ReviewerAssignment[] {
  return mockReviewerAssignments.filter((a) => a.reviewerId === userId);
}

export function findReviewAssignmentsByGrant(grantId: string): ReviewerAssignment[] {
  const appIds = new Set(
    mockApplications.filter((a) => a.grantId === grantId).map((a) => a.id),
  );
  return mockReviewerAssignments.filter((a) => appIds.has(a.applicationId));
}

export function isAssignmentComplete(assignment: ReviewerAssignment): boolean {
  return mockReviews.some(
    (r) =>
      r.applicationId === assignment.applicationId &&
      r.reviewerId === assignment.reviewerId,
  );
}

export function findAssignmentsForApplication(appId: string): ReviewerAssignment[] {
  return mockReviewerAssignments.filter((a) => a.applicationId === appId);
}

/**
 * True when the user is on at least one review panel. Drives the Reviews nav link's
 * visibility — applicants without any assignment don't see it.
 */
export function hasReviewerAssignments(userId: string): boolean {
  return mockReviewerAssignments.some((a) => a.reviewerId === userId);
}

export function findReviewsByApplication(appId: string): Review[] {
  return mockReviews.filter((r) => r.applicationId === appId);
}

export function findReviewByReviewer(
  appId: string,
  reviewerId: string,
): Review | undefined {
  return mockReviews.find(
    (r) => r.applicationId === appId && r.reviewerId === reviewerId,
  );
}
