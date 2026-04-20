/**
 * Canonical status → Badge variant mapping.
 * From DESIGN_SYSTEM_PLAN.md §9.1: every status always renders the same way everywhere.
 */

import type { Variant } from "@/app/_components/ui/Badge";
import type {
  ApplicationStatus,
  DisbursementStatus,
  GrantStatus,
  ReviewDecision,
} from "@/lib/types";

// Application status
const APPLICATION_VARIANT: Record<ApplicationStatus, Variant> = {
  DRAFT: "neutral",
  SUBMITTED: "info",
  IN_REVIEW: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

const APPLICATION_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

// Grant status
const GRANT_VARIANT: Record<GrantStatus, Variant> = {
  DRAFT: "neutral",
  OPEN: "success",
  CLOSED: "neutral",
  ARCHIVED: "neutral",
};

// Disbursement status
const DISBURSEMENT_VARIANT: Record<DisbursementStatus, Variant> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};

// Review decision
const REVIEW_VARIANT: Record<ReviewDecision, Variant> = {
  APPROVE: "success",
  REJECT: "danger",
  REQUEST_CHANGES: "info",
};

const REVIEW_LABEL: Record<ReviewDecision, string> = {
  APPROVE: "Approved",
  REJECT: "Rejected",
  REQUEST_CHANGES: "Changes asked",
};

export function applicationBadge(status: ApplicationStatus) {
  return { variant: APPLICATION_VARIANT[status], label: APPLICATION_LABEL[status] };
}

export function grantBadge(status: GrantStatus) {
  return {
    variant: GRANT_VARIANT[status],
    label: status.charAt(0) + status.slice(1).toLowerCase(),
  };
}

export function disbursementBadge(status: DisbursementStatus) {
  return {
    variant: DISBURSEMENT_VARIANT[status],
    label: status.charAt(0) + status.slice(1).toLowerCase(),
  };
}

export function reviewBadge(decision: ReviewDecision) {
  return { variant: REVIEW_VARIANT[decision], label: REVIEW_LABEL[decision] };
}
