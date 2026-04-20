import type { Organization, OrganizationMember } from "@/lib/types";

export const mockOrgs: Organization[] = [
  {
    id: "org_team1",
    name: "Backyard",
    slug: "team1",
    description: "The Backyard platform team. Runs the flagship Minigrant program.",
    logoUrl: null,
    websiteUrl: "https://backyard.dev",
    createdAt: "2025-10-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "org_avalanche",
    name: "Avalanche Foundation",
    slug: "avalanche-foundation",
    description: "Supports builders across the Avalanche ecosystem.",
    logoUrl: null,
    websiteUrl: "https://avax.network",
    createdAt: "2025-11-01T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "org_subnet",
    name: "Subnet Labs",
    slug: "subnet-labs",
    description: "Funding subnet-native projects and tooling.",
    logoUrl: null,
    websiteUrl: "https://subnetlabs.example",
    createdAt: "2025-12-15T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
    deletedAt: null,
  },
];

export const mockOrgMembers: OrganizationMember[] = [
  {
    id: "om_01",
    organizationId: "org_avalanche",
    userId: "user_owner",
    role: "OWNER",
    createdAt: "2025-11-01T09:00:00Z",
  },
  {
    id: "om_02",
    organizationId: "org_avalanche",
    userId: "user_whitelisted",
    role: "WHITELISTED",
    createdAt: "2025-12-01T09:00:00Z",
  },
  {
    id: "om_03",
    organizationId: "org_avalanche",
    userId: "user_editor",
    role: "WHITELISTED",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "om_04",
    organizationId: "org_subnet",
    userId: "user_owner",
    role: "WHITELISTED",
    createdAt: "2026-02-01T09:00:00Z",
  },
];

export function findOrgBySlug(slug: string): Organization | undefined {
  return mockOrgs.find((o) => o.slug === slug);
}

export function findOrgById(id: string): Organization | undefined {
  return mockOrgs.find((o) => o.id === id);
}

export function findOrgMembership(
  userId: string,
  orgId: string,
): OrganizationMember | undefined {
  return mockOrgMembers.find((m) => m.userId === userId && m.organizationId === orgId);
}

export function isOrgMember(userId: string, orgId: string): boolean {
  return findOrgMembership(userId, orgId) !== undefined;
}

export function isOrgOwner(userId: string, orgId: string): boolean {
  return findOrgMembership(userId, orgId)?.role === "OWNER";
}

export function findOrgsForUser(userId: string): Organization[] {
  const memberships = mockOrgMembers.filter((m) => m.userId === userId);
  const orgIds = new Set(memberships.map((m) => m.organizationId));
  return mockOrgs.filter((o) => orgIds.has(o.id) && !o.deletedAt);
}
