import type { Grant, GrantQuestion, GrantPermission } from "@/lib/types";

export const MINIGRANT_ID = "grant_minigrant";

export const mockGrants: Grant[] = [
  {
    id: "grant_minigrant",
    organizationId: "org_team1",
    title: "Backyard Minigrant",
    slug: "backyard-minigrant",
    description:
      "Backyard's flagship grant program. Small, fast grants for builders shipping in the ecosystem.",
    requirements: "Working prototype or a clear technical spec. Open to solo builders and teams.",
    fundingPool: 1000000,
    currency: "USD",
    deadline: "2026-12-31T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: true,
    spotlightRank: null,
    createdAt: "2025-10-01T09:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_defi",
    organizationId: "org_avalanche",
    title: "DeFi Builders Grant",
    slug: "defi-builders",
    description:
      "Funding for DeFi primitives, lending, DEXs, and structured products on Avalanche.",
    requirements: "Deployed contracts on C-Chain or a subnet. Open-source preferred.",
    fundingPool: 500000,
    currency: "USD",
    deadline: "2026-06-30T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: 1,
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_infra",
    organizationId: "org_avalanche",
    title: "Infra & Tooling Grant",
    slug: "infra-tooling",
    description: "Dev tools, indexers, RPC, explorers, SDKs.",
    requirements: "Working demo or repo required.",
    fundingPool: 250000,
    currency: "USD",
    deadline: "2026-05-15T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: 2,
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_nft",
    organizationId: "org_subnet",
    title: "NFT Creators Grant",
    slug: "nft-creators",
    description: "NFT creator tools, marketplaces, and artist support.",
    requirements: null,
    fundingPool: 100000,
    currency: "USD",
    deadline: "2026-07-31T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: null,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_bridge",
    organizationId: "org_subnet",
    title: "Bridge Builders Grant",
    slug: "bridge-builders",
    description: "Cross-chain bridges, message passing, and L2 interoperability.",
    requirements: "Security audit required before disbursement.",
    fundingPool: 300000,
    currency: "USD",
    deadline: "2026-08-15T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: null,
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-03-12T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_education",
    organizationId: "org_avalanche",
    title: "Education & Content Grant",
    slug: "education-content",
    description:
      "Tutorials, video courses, documentation, workshops, and developer education content.",
    requirements: "Portfolio of prior educational work.",
    fundingPool: 75000,
    currency: "USD",
    deadline: "2026-09-30T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: null,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_gaming",
    organizationId: "org_avalanche",
    title: "Gaming Grant",
    slug: "gaming",
    description: "On-chain games, gaming infrastructure, and player tooling.",
    requirements: null,
    fundingPool: 400000,
    currency: "USD",
    deadline: "2026-10-31T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: null,
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_privacy",
    organizationId: "org_team1",
    title: "Privacy & Identity Grant",
    slug: "privacy-identity",
    description: "Zero-knowledge proofs, private transactions, decentralized identity, and data sovereignty tools.",
    requirements: "Working demo or published research. Open to individuals and teams.",
    fundingPool: 250000,
    currency: "USD",
    deadline: "2026-11-30T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: 2,
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_security",
    organizationId: "org_team1",
    title: "Security Tooling Grant",
    slug: "security-tooling",
    description: "Audit tools, vulnerability scanners, fuzzing frameworks, and security monitoring for smart contracts.",
    requirements: "Prior security work or published audit reports.",
    fundingPool: 150000,
    currency: "USD",
    deadline: "2026-10-15T23:59:59Z",
    status: "OPEN",
    isPublic: true,
    isFlagship: false,
    spotlightRank: 3,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "grant_draft",
    organizationId: "org_avalanche",
    title: "DAO Infrastructure (draft)",
    slug: "dao-infrastructure",
    description: "Governance tooling for DAOs. Not yet published.",
    requirements: null,
    fundingPool: null,
    currency: "USD",
    deadline: null,
    status: "DRAFT",
    isPublic: false,
    isFlagship: false,
    spotlightRank: null,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    deletedAt: null,
  },
];

export const mockGrantQuestions: GrantQuestion[] = [
  {
    id: "gq_mg_01",
    grantId: "grant_minigrant",
    label: "What are you building?",
    description: "Short pitch, 2-3 sentences.",
    type: "TEXTAREA",
    options: [],
    isRequired: true,
    sortOrder: 0,
    createdAt: "2025-10-01T09:00:00Z",
  },
  {
    id: "gq_mg_02",
    grantId: "grant_minigrant",
    label: "Link to a demo, repo, or doc",
    description: null,
    type: "URL",
    options: [],
    isRequired: false,
    sortOrder: 1,
    createdAt: "2025-10-01T09:00:00Z",
  },
  {
    id: "gq_01",
    grantId: "grant_defi",
    label: "What is your go-to-market plan?",
    description: "How will you get your first 1,000 users?",
    type: "TEXTAREA",
    options: [],
    isRequired: true,
    sortOrder: 0,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "gq_02",
    grantId: "grant_defi",
    label: "Primary category",
    description: null,
    type: "SELECT",
    options: ["DEX", "Lending", "Stablecoin", "Derivatives", "Yield"],
    isRequired: true,
    sortOrder: 1,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "gq_03",
    grantId: "grant_defi",
    label: "Demo URL",
    description: "Link to a live demo or testnet deployment.",
    type: "URL",
    options: [],
    isRequired: false,
    sortOrder: 2,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "gq_04",
    grantId: "grant_infra",
    label: "What problem does your tool solve?",
    description: null,
    type: "TEXTAREA",
    options: [],
    isRequired: true,
    sortOrder: 0,
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "gq_05",
    grantId: "grant_nft",
    label: "Who are your target creators?",
    description: null,
    type: "TEXTAREA",
    options: [],
    isRequired: true,
    sortOrder: 0,
    createdAt: "2026-02-20T09:00:00Z",
  },
];

export const mockGrantPermissions: GrantPermission[] = [
  {
    id: "gp_01",
    grantId: "grant_defi",
    userId: "user_editor",
    role: "EDITOR",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "gp_02",
    grantId: "grant_defi",
    userId: "user_grantreviewer",
    role: "REVIEWER",
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "gp_03",
    grantId: "grant_infra",
    userId: "user_grantreviewer",
    role: "VIEWER",
    createdAt: "2026-02-15T09:00:00Z",
  },
];

export function findGrantPermissionsByGrant(grantId: string): GrantPermission[] {
  return mockGrantPermissions.filter((p) => p.grantId === grantId);
}

export function findGrantById(id: string): Grant | undefined {
  return mockGrants.find((g) => g.id === id);
}

export function findGrantBySlug(slug: string): Grant | undefined {
  return mockGrants.find((g) => g.slug === slug);
}

export function findGrantsByOrg(orgId: string): Grant[] {
  return mockGrants.filter((g) => g.organizationId === orgId && !g.deletedAt);
}

export function findPublicOpenGrants(): Grant[] {
  return mockGrants.filter(
    (g) => g.isPublic && g.status === "OPEN" && !g.deletedAt,
  );
}

export function findFlagshipGrant(): Grant | undefined {
  return mockGrants.find(
    (g) => g.isFlagship && g.isPublic && g.status === "OPEN" && !g.deletedAt,
  );
}

export function findSpotlightGrants(): Grant[] {
  return mockGrants
    .filter(
      (g) =>
        g.spotlightRank !== null &&
        !g.isFlagship &&
        g.isPublic &&
        g.status === "OPEN" &&
        !g.deletedAt,
    )
    .sort((a, b) => (a.spotlightRank ?? 0) - (b.spotlightRank ?? 0));
}

export function findOtherGrants(): Grant[] {
  return mockGrants
    .filter(
      (g) =>
        !g.isFlagship &&
        g.spotlightRank === null &&
        g.isPublic &&
        !g.deletedAt,
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function findQuestionsByGrant(grantId: string): GrantQuestion[] {
  return mockGrantQuestions
    .filter((q) => q.grantId === grantId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
