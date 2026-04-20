import type {
  Application,
  Competition,
  CompetitionSubmission,
  CompetitionTeam,
  Grant,
  Organization,
  Project,
  ProfileViewMode,
  User,
} from "@/lib/types";
import { mockApplications } from "./applications";
import { findCompetitionTeamsByUser } from "./competitions";
import { mockGrants } from "./grants";
import { mockOrgs, mockOrgMembers } from "./orgs";
import { mockProjects } from "./projects";

const base = (overrides: Partial<User>): User => ({
  id: "user_00",
  email: "placeholder@example.com",
  name: null,
  builderHubId: null,
  image: null,
  telegram: null,
  country: null,
  state: null,
  walletAddress: null,
  isPlatformAdmin: false,
  bio: null,
  handle: "user",
  isProfilePublic: true,
  // Every seeded user is marked complete by default. To demo the onboarding gate, flip
  // the RoleSwitcher "Simulate incomplete profile" toggle — it overrides this at read-time.
  onboardingCompletedAt: "2026-01-12T09:00:00Z",
  createdAt: "2026-01-10T09:00:00Z",
  updatedAt: "2026-01-10T09:00:00Z",
  deletedAt: null,
  ...overrides,
});

export const mockUsers: User[] = [
  base({
    id: "user_applicant",
    email: "alice.applicant@example.com",
    name: "Alice Applicant",
    handle: "alice",
    bio: "Building DeFi and NFT tooling on Avalanche. Previously at a stablecoin team. Always looking for co-builders.",
    telegram: "@alice_a",
    country: "US",
    state: "CA",
    walletAddress: "0xA11CE0000000000000000000000000000000A11CE",
  }),
  base({
    id: "user_reviewer",
    email: "ruth.reviewer@example.com",
    name: "Ruth Reviewer",
    handle: "ruth",
    bio: "Reviewer on the Backyard network. Focused on infra and security.",
    country: "DE",
    state: "BE",
  }),
  base({
    id: "user_owner",
    email: "oscar.owner@avalanche.org",
    name: "Oscar Owner",
    handle: "oscar",
    bio: "Runs grants at the Avalanche Foundation. DM for collabs.",
    country: "CH",
    state: "ZH",
  }),
  base({
    id: "user_whitelisted",
    email: "wendy.whitelist@avalanche.org",
    name: "Wendy Whitelist",
    handle: "wendy",
    country: "GB",
    state: "ENG",
  }),
  base({
    id: "user_editor",
    email: "eddie.editor@avalanche.org",
    name: "Eddie Editor",
    handle: "eddie",
    country: "US",
    state: "NY",
  }),
  base({
    id: "user_grantreviewer",
    email: "gina.grantreviewer@example.com",
    name: "Gina GrantReviewer",
    handle: "gina",
    country: "SG",
    state: "SG",
  }),
  base({
    id: "user_admin",
    email: "paul.admin@team1.xyz",
    name: "Paul PlatformAdmin",
    handle: "paul",
    bio: "Platform admin. Keeps the pipes clean.",
    isPlatformAdmin: true,
    country: "US",
    state: "NY",
  }),
  base({
    id: "user_builder_01",
    email: "marco.builder@example.com",
    name: "Marco Rivera",
    handle: "marco",
    bio: "Full-stack dev building infra tools for Avalanche subnets. Rust and TypeScript.",
    country: "MX",
    state: "CDMX",
    walletAddress: "0xB01D000000000000000000000000000000000001",
  }),
  base({
    id: "user_builder_02",
    email: "suki.builder@example.com",
    name: "Suki Chen",
    handle: "suki",
    bio: "DAO tooling and treasury management. Ex-MakerDAO contributor.",
    country: "TW",
    state: "TPE",
    walletAddress: "0xB01D000000000000000000000000000000000002",
  }),
  base({
    id: "user_builder_03",
    email: "kai.builder@example.com",
    name: "Kai Nakamura",
    handle: "kai",
    bio: "Privacy researcher turned builder. Zero-knowledge proofs and identity.",
    country: "JP",
    state: "TK",
    walletAddress: "0xB01D000000000000000000000000000000000003",
  }),
  base({
    id: "user_builder_04",
    email: "nina.builder@example.com",
    name: "Nina Okafor",
    handle: "nina",
    bio: "Security engineer and NFT builder. Previously audited 30+ DeFi protocols.",
    country: "NG",
    state: "LA",
    walletAddress: "0xB01D000000000000000000000000000000000004",
  }),
  base({
    id: "user_builder_05",
    email: "leo.builder@example.com",
    name: "Leo Petrov",
    handle: "leo",
    bio: "DeFi protocol designer. Focused on liquid staking and yield optimization.",
    country: "BG",
    state: "SF",
    walletAddress: "0xB01D000000000000000000000000000000000005",
  }),
];

export function findUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function findUserByHandle(handle: string): User | undefined {
  return mockUsers.find((u) => u.handle === handle.toLowerCase());
}

/**
 * A profile is "complete" when the user has explicitly finished /onboarding (backing
 * timestamp) AND the minimum public-surface fields (name, handle, bio) are populated.
 * Sensitive actions (applying to grants, submitting to competitions) require this.
 */
export function isProfileComplete(user: User): boolean {
  if (!user.onboardingCompletedAt) return false;
  if (!user.name || user.name.trim().length === 0) return false;
  if (!user.handle || user.handle.trim().length === 0) return false;
  if (!user.bio || user.bio.trim().length === 0) return false;
  return true;
}

/**
 * Derive the profile view mode a viewer should see when looking at a target user.
 *
 *  - `self`   — viewer is the target (fat view including drafts + private projects)
 *  - `admin`  — viewer is a platform admin (fat view of everything)
 *  - `org`    — viewer is any org member (fat view scoped to that org's grants/comps only)
 *  - `public` — everything else (thin view: name, bio, public projects only)
 */
export function getProfileViewFor(
  viewer: User | null,
  target: User,
  viewerOrgIds: string[],
): ProfileViewMode {
  if (!viewer) return "public";
  if (viewer.id === target.id) return "self";
  if (viewer.isPlatformAdmin) return "admin";
  if (viewerOrgIds.length > 0) return "org";
  return "public";
}

/** Org ids a viewer is a member of (OWNER or WHITELISTED). */
export function findOrgIdsForUser(userId: string): string[] {
  return mockOrgMembers
    .filter((m) => m.userId === userId)
    .map((m) => m.organizationId);
}

// ---------- Profile data aggregations ----------

/**
 * Projects visible on a profile page, filtered by view mode.
 *  - public → only PUBLIC + non-archived
 *  - self / admin → everything (including private + archived + drafts)
 *  - org → projects that have applied to a grant run by one of the viewer's orgs
 */
export function getProjectsForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): Project[] {
  const owned = mockProjects.filter(
    (p) => p.userId === target.id && !p.deletedAt,
  );

  if (mode === "self" || mode === "admin") return owned;

  if (mode === "public") {
    return owned.filter(
      (p) => p.visibility === "PUBLIC" && !p.archivedAt,
    );
  }

  // mode === "org" — narrow to projects that have applied to a grant run by one of
  // this viewer's orgs. Basic details (name, description, banner, logo, categories) only.
  const viewerGrantIds = new Set(
    mockGrants
      .filter((g) => viewerOrgIds.includes(g.organizationId))
      .map((g) => g.id),
  );
  const relevantProjectIds = new Set(
    mockApplications
      .filter((a) => viewerGrantIds.has(a.grantId))
      .map((a) => a.projectId),
  );
  return owned.filter((p) => relevantProjectIds.has(p.id));
}

export interface GrantHistoryRow {
  application: Application;
  grant: Grant;
  org: Organization | null;
}

/**
 * Grant history (applications joined with grant + org), filtered by view mode.
 *  - public → []
 *  - self / admin → every application, every org
 *  - org → only rows where the grant is run by one of the viewer's orgs
 */
export function getGrantHistoryForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): GrantHistoryRow[] {
  if (mode === "public") return [];

  const projectIds = new Set(
    mockProjects
      .filter((p) => p.userId === target.id && !p.deletedAt)
      .map((p) => p.id),
  );

  const rows = mockApplications
    .filter((a) => projectIds.has(a.projectId))
    .map((a): GrantHistoryRow | null => {
      const grant = mockGrants.find((g) => g.id === a.grantId);
      if (!grant) return null;
      const org = mockOrgs.find((o) => o.id === grant.organizationId) ?? null;
      return { application: a, grant, org };
    })
    .filter((r): r is GrantHistoryRow => r !== null);

  if (mode === "self" || mode === "admin") return rows;

  // mode === "org" — narrow to grants belonging to the viewer's orgs.
  return rows.filter((r) => viewerOrgIds.includes(r.grant.organizationId));
}

export interface CompetitionHistoryRow {
  team: CompetitionTeam;
  competition: Competition;
  submission: CompetitionSubmission | null;
}

/**
 * Competition team memberships + submissions for a user, filtered by view mode.
 *  - public → []
 *  - self / admin → every membership
 *  - org → only memberships in competitions run by one of the viewer's orgs
 */
export function getCompetitionHistoryForProfileView(
  target: User,
  mode: ProfileViewMode,
  viewerOrgIds: string[],
): CompetitionHistoryRow[] {
  if (mode === "public") return [];

  const rows = findCompetitionTeamsByUser(target.id).map((r) => ({
    team: r.team,
    competition: r.competition,
    submission: r.submission ?? null,
  }));

  if (mode === "self" || mode === "admin") return rows;

  // mode === "org" — narrow to competitions run by the viewer's orgs.
  return rows.filter((r) => viewerOrgIds.includes(r.competition.organizationId));
}
