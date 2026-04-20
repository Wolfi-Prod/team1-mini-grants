export type ISODate = string;

export type OrgRole = "OWNER" | "WHITELISTED";
export type GrantRole = "VIEWER" | "EDITOR" | "REVIEWER";
export type GrantStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";

export type ProjectVisibility = "PUBLIC" | "PRIVATE" | "CUSTOM";

/**
 * Sections on a project page whose visibility an owner can toggle when visibility === "CUSTOM".
 * Name, logo, banner, one-liner description, pictures, and categories are always public for
 * non-private projects (PUBLIC or CUSTOM) — they're the baseline discoverability surface.
 */
export type ProjectSectionKey =
  | "problemStatement"
  | "websiteUrl"
  | "projectUrl"
  | "otherLinks"
  | "contractAddresses"
  | "team"
  | "files"
  | "updates"
  | "applications";

export const PROJECT_TOGGLEABLE_SECTIONS: ProjectSectionKey[] = [
  "problemStatement",
  "websiteUrl",
  "projectUrl",
  "otherLinks",
  "contractAddresses",
  "team",
  "files",
  "updates",
  "applications",
];

export const PROJECT_SECTION_LABELS: Record<ProjectSectionKey, string> = {
  problemStatement: "Problem statement",
  websiteUrl: "Website URL",
  projectUrl: "Live demo URL",
  otherLinks: "Other links",
  contractAddresses: "Smart contracts",
  team: "Team",
  files: "Files",
  updates: "Updates",
  applications: "Applications history",
};
export type QuestionType = "TEXT" | "TEXTAREA" | "SELECT" | "MULTI_SELECT" | "URL" | "NUMBER";
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";
export type ReviewDecision = "APPROVE" | "REJECT" | "REQUEST_CHANGES";
export type DisbursementStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type InvitationType = "ORGANIZATION" | "GRANT";

export type ProfileViewMode = "public" | "self" | "admin" | "org";

export interface User {
  id: string;
  email: string;
  name: string | null;
  builderHubId: string | null;
  image: string | null;
  telegram: string | null;
  country: string | null;
  state: string | null;
  walletAddress: string | null;
  isPlatformAdmin: boolean;
  /** Short bio shown on the applicant profile page. */
  bio: string | null;
  /** Unique URL handle used at /u/[handle]. Derived from builderHubId or slugified name. */
  handle: string;
  /** When false, even the public view renders a "This profile is private" placeholder
   *  (admins + org-scoped views still work). Default true. */
  isProfilePublic: boolean;
  /** Set when the user finishes onboarding. Null = fresh account, must complete
   *  /onboarding before sensitive actions (applying to grants, submitting to hackathons). */
  onboardingCompletedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  createdAt: ISODate;
}

export interface Grant {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  fundingPool: number | null;
  currency: string;
  deadline: ISODate | null;
  status: GrantStatus;
  isPublic: boolean;
  isFlagship: boolean;
  spotlightRank: number | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

export interface GrantQuestion {
  id: string;
  grantId: string;
  label: string;
  description: string | null;
  type: QuestionType;
  options: string[];
  isRequired: boolean;
  sortOrder: number;
  createdAt: ISODate;
}

export interface GrantPermission {
  id: string;
  grantId: string;
  userId: string;
  role: GrantRole;
  createdAt: ISODate;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  problemStatement: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  imageUrls: string[];
  categories: string[];
  websiteUrl: string | null;
  projectUrl: string | null;
  otherLinks: string[];
  contractAddresses: string[];
  isFeatured: boolean;
  visibility: ProjectVisibility;
  /**
   * When visibility === "CUSTOM", sections listed here are hidden from the public showcase.
   * Ignored when visibility === "PUBLIC" (everything visible) or "PRIVATE" (everything hidden).
   */
  hiddenSections: ProjectSectionKey[];
  /** Archived projects don't appear in discover/showcase but remain in the owner's list. */
  archivedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  /** Admin-only hard delete. Never surfaced to users — owners use archive instead. */
  deletedAt: ISODate | null;
}

export interface ProjectTeamMember {
  id: string;
  projectId: string;
  name: string;
  email: string;
  role: string | null;
  github: string | null;
  twitter: string | null;
  linkedIn: string | null;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  snapshot: Record<string, unknown>;
  changedBy: string;
  changeLog: string | null;
  createdAt: ISODate;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: ISODate;
}

export interface FileLink {
  id: string;
  projectId: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  createdAt: ISODate;
}

export interface Application {
  id: string;
  projectId: string;
  grantId: string;
  status: ApplicationStatus;
  coverNote: string | null;
  fundingRequested: number | null;
  submittedAt: ISODate | null;
  decidedAt: ISODate | null;
  decidedBy: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ApplicationAnswer {
  id: string;
  applicationId: string;
  questionId: string;
  answer: string;
}

export interface ApplicationVersion {
  id: string;
  applicationId: string;
  /** 1-indexed; increments on every submit / resubmit. Version 1 = initial submit. */
  version: number;
  /**
   * Snapshot of the application + answers at the time this version was created.
   * Structured so a simple field-by-field diff UI can walk `coverNote` and each
   * answer by `questionId`.
   */
  snapshot: {
    coverNote: string | null;
    fundingRequested: number | null;
    answers: { questionId: string; answer: string }[];
  };
  /** Who submitted this version — almost always the applicant; orgs never write here. */
  submittedBy: string;
  createdAt: ISODate;
}

export interface ReviewerAssignment {
  id: string;
  applicationId: string;
  reviewerId: string;
  assignedBy: string;
  assignedAt: ISODate;
  dueDate: ISODate | null;
}

export interface Review {
  id: string;
  applicationId: string;
  reviewerId: string;
  decision: ReviewDecision;
  feedback: string;
  score: number | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface FundingDisbursement {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: DisbursementStatus;
  milestone: string | null;
  note: string | null;
  disbursedAt: ISODate | null;
  createdAt: ISODate;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  readAt: ISODate | null;
  createdAt: ISODate;
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  type: InvitationType;
  organizationId: string | null;
  grantId: string | null;
  orgRole: OrgRole | null;
  grantRole: GrantRole | null;
  invitedBy: string;
  expiresAt: ISODate;
  acceptedAt: ISODate | null;
  declinedAt: ISODate | null;
  createdAt: ISODate;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: ISODate;
}

// ---------- Competitions (hackathons + challenges) ----------

export type CompetitionFormat = "HACKATHON" | "CHALLENGE";

export type CompetitionStatus =
  | "DRAFT"
  | "UPCOMING"
  | "OPEN"
  | "JUDGING"
  | "ANNOUNCED"
  | "CLOSED";

export interface Competition {
  id: string;
  organizationId: string;
  format: CompetitionFormat;
  title: string;
  slug: string;
  description: string;
  rules: string;
  partner: string | null;
  partnerLogoUrl: string | null;
  bannerUrl: string | null;
  registrationOpensAt: ISODate | null;
  submissionDeadline: ISODate | null;
  judgingEndsAt: ISODate | null;
  resultsAnnouncedAt: ISODate | null;
  minTeamSize: number;
  maxTeamSize: number;
  totalPool: number | null;
  currency: string;
  status: CompetitionStatus;
  isPublic: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

export interface CompetitionMainPrize {
  id: string;
  competitionId: string;
  rank: number;
  label: string;
  amount: number | null;
  currency: string;
  description: string | null;
}

export interface CompetitionTrack {
  id: string;
  competitionId: string;
  name: string;
  description: string | null;
  prizeAmount: number | null;
  currency: string;
  sortOrder: number;
}

export interface CompetitionTeam {
  id: string;
  competitionId: string;
  name: string;
  leadUserId: string;
  /** Opt-in public. Default false = loose private (name + count visible, roster hidden). */
  isPublic: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt: ISODate | null;
}

export interface CompetitionTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "LEAD" | "MEMBER";
  joinedAt: ISODate;
}

export type CompetitionTeamInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "BLOCKED_ALREADY_ON_TEAM";

export interface CompetitionTeamInvitation {
  id: string;
  teamId: string;
  competitionId: string;
  email: string;
  invitedUserId: string | null;
  status: CompetitionTeamInvitationStatus;
  invitedBy: string;
  message: string | null;
  createdAt: ISODate;
  respondedAt: ISODate | null;
}

export type CompetitionSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "WITHDRAWN"
  | "WINNER"
  | "NOT_SELECTED";

export interface CompetitionSubmission {
  id: string;
  competitionId: string;
  teamId: string;
  projectId: string;
  status: CompetitionSubmissionStatus;
  submittedAt: ISODate | null;
  decidedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CompetitionSubmissionTrack {
  id: string;
  submissionId: string;
  trackId: string;
}
