export type MockRole = "visitor" | "applicant" | "admin" | "org";

export const MOCK_ROLES: MockRole[] = ["visitor", "applicant", "admin", "org"];

export const ROLE_LABELS: Record<MockRole, string> = {
  visitor: "Visitor (logged out)",
  applicant: "Applicant",
  admin: "Platform Admin",
  org: "Organization",
};

export const ROLE_DESCRIPTIONS: Record<MockRole, string> = {
  visitor: "Not logged in. Public pages only.",
  applicant: "Creates projects, applies to grants, tracks outcomes.",
  admin: "Runs the platform. Owns /admin dashboard with modular access.",
  org: "Runs an organization. Owns /dashboard/[orgSlug] with modular access.",
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULES (what a dashboard is made of)
// ─────────────────────────────────────────────────────────────────────────────

export type AdminModule =
  | "adminOverview"
  | "organizations"
  | "users"
  | "auditLog"
  | "featured";

export type OrgModule =
  | "orgOverview"
  | "grants"
  | "applications"
  | "review"
  | "members"
  | "orgSettings"
  | "disbursements";

export type Module = AdminModule | OrgModule;

export const ALL_ADMIN_MODULES: AdminModule[] = [
  "adminOverview",
  "organizations",
  "users",
  "auditLog",
  "featured",
];

export const ALL_ORG_MODULES: OrgModule[] = [
  "orgOverview",
  "grants",
  "applications",
  "review",
  "members",
  "orgSettings",
  "disbursements",
];

export const MODULE_LABELS: Record<Module, string> = {
  adminOverview: "Overview",
  organizations: "Organizations",
  users: "Users",
  auditLog: "Audit Log",
  featured: "Featured Projects",
  orgOverview: "Overview",
  grants: "Grants",
  applications: "Applications",
  review: "Review",
  members: "Members",
  orgSettings: "Settings",
  disbursements: "Disbursements",
};

export const MODULE_DESCRIPTIONS: Record<Module, string> = {
  adminOverview: "Platform stats and recent activity.",
  organizations: "Create, suspend, and manage organizations.",
  users: "Search users and toggle platform admin flag.",
  auditLog: "Filterable audit log of every mutation.",
  featured: "Toggle featured projects on the discover page.",
  orgOverview: "Grant counts, application pipeline, recent activity.",
  grants: "Create, edit, open, close, and archive grants.",
  applications: "Read applications and make accept/reject decisions.",
  review: "Submit reviews (score, feedback, recommendation).",
  members: "Add, remove, and assign module access to org users.",
  orgSettings: "Org name, logo, description, website.",
  disbursements: "Record milestone payouts to accepted projects.",
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE PRESETS (dev-only Module Switcher previews different combos)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminPreset {
  key: string;
  label: string;
  modules: AdminModule[];
}

export interface OrgPreset {
  key: string;
  label: string;
  modules: OrgModule[];
}

export const ADMIN_PRESETS: AdminPreset[] = [
  { key: "full", label: "Full access", modules: [...ALL_ADMIN_MODULES] },
  {
    key: "orgsOnly",
    label: "Orgs management only",
    modules: ["adminOverview", "organizations"],
  },
  {
    key: "auditOnly",
    label: "Audit log only",
    modules: ["adminOverview", "auditLog"],
  },
  {
    key: "usersOnly",
    label: "Users only",
    modules: ["adminOverview", "users"],
  },
];

export const ORG_PRESETS: OrgPreset[] = [
  { key: "full", label: "Full access (owner)", modules: [...ALL_ORG_MODULES] },
  {
    key: "editor",
    label: "Editor (grants + applications)",
    modules: ["orgOverview", "grants", "applications"],
  },
  {
    key: "reviewer",
    label: "Reviewer (review only)",
    modules: ["orgOverview", "review"],
  },
  {
    key: "decisions",
    label: "Decisions (applications only)",
    modules: ["orgOverview", "applications"],
  },
  {
    key: "people",
    label: "People (members + settings)",
    modules: ["orgOverview", "members", "orgSettings"],
  },
  {
    key: "funding",
    label: "Funding (disbursements only)",
    modules: ["orgOverview", "disbursements"],
  },
];

export const DEFAULT_ADMIN_PRESET = "full";
export const DEFAULT_ORG_PRESET = "full";

export function getAdminPreset(key: string): AdminPreset {
  return ADMIN_PRESETS.find((p) => p.key === key) ?? ADMIN_PRESETS[0];
}

export function getOrgPreset(key: string): OrgPreset {
  return ORG_PRESETS.find((p) => p.key === key) ?? ORG_PRESETS[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Role helpers
// ─────────────────────────────────────────────────────────────────────────────

export function isAuthenticated(role: MockRole): boolean {
  return role !== "visitor";
}

export function isAdmin(role: MockRole): boolean {
  return role === "admin";
}

export function isOrg(role: MockRole): boolean {
  return role === "org";
}

export function hasOwnDashboard(role: MockRole): boolean {
  return role === "admin" || role === "org";
}
