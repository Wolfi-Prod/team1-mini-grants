import type {
  Project,
  ProjectSectionKey,
  ProjectTeamMember,
  ProjectUpdate,
  ProjectVersion,
  FileLink,
  User,
  Application,
  Grant,
} from "@/lib/types";
import { PROJECT_TOGGLEABLE_SECTIONS } from "@/lib/types";

export const mockProjects: Project[] = [
  {
    id: "proj_01",
    userId: "user_applicant",
    name: "AvaSwap DEX",
    description:
      "A gas-optimized AMM-style decentralized exchange for Avalanche C-Chain.",
    problemStatement:
      "Existing DEXs on Avalanche have high slippage for small traders. AvaSwap rebalances fee tiers dynamically.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DeFi", "Infra"],
    websiteUrl: "https://avaswap.example",
    projectUrl: "https://app.avaswap.example",
    otherLinks: ["https://github.com/avaswap"],
    isFeatured: true,
    visibility: "CUSTOM",
    hiddenSections: ["applications"],
    archivedAt: null,
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_02",
    userId: "user_applicant",
    name: "GlacierNFT",
    description: "Permissionless NFT minting tooling with cold-storage support.",
    problemStatement: "Creators want NFT tools that don't lock their private keys.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["NFT", "Tooling"],
    websiteUrl: "https://glaciernft.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "CUSTOM",
    hiddenSections: ["files", "team", "contractAddresses", "applications"],
    archivedAt: null,
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_03",
    userId: "user_applicant",
    name: "SnowBridge",
    description: "Bridging stablecoins between Avalanche and other EVM L2s.",
    problemStatement: null,
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Bridge", "DeFi"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PRIVATE",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_04",
    userId: "user_applicant",
    name: "CrystalLend",
    description:
      "Fixed-rate lending protocol with on-chain credit scoring for Avalanche and its subnets.",
    problemStatement: "Variable-rate lending is too volatile for small borrowers.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DeFi", "Lending"],
    websiteUrl: "https://crystallend.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: true,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-18T09:00:00Z",
    updatedAt: "2026-03-30T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_05",
    userId: "user_applicant",
    name: "Permafrost Indexer",
    description: "Fast, incremental indexer for Avalanche C-Chain and subnet events.",
    problemStatement: null,
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Infra", "Tooling"],
    websiteUrl: "https://permafrost.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "CUSTOM",
    hiddenSections: ["applications"],
    archivedAt: "2026-04-05T09:00:00Z",
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-04-05T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_06",
    userId: "user_applicant",
    name: "IceType Fonts",
    description: "On-chain royalty-preserving fonts for NFT creators.",
    problemStatement: null,
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["NFT", "Tooling"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "CUSTOM",
    hiddenSections: ["applications"],
    archivedAt: null,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-22T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_07",
    userId: "user_builder_01",
    name: "SubnetWatch",
    description: "Real-time monitoring dashboard for Avalanche subnets. Tracks validator uptime, gas usage, and cross-chain messages with 15-second refresh intervals.",
    problemStatement: "Subnet operators have no unified view of network health across chains.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Infra", "Analytics"],
    websiteUrl: "https://subnetwatch.example",
    projectUrl: "https://app.subnetwatch.example",
    otherLinks: [],
    isFeatured: true,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_08",
    userId: "user_builder_02",
    name: "VaultDAO",
    description: "Multi-sig treasury management for DAOs on Avalanche. Supports tiered approval flows, scheduled payouts, and on-chain accounting exports.",
    problemStatement: "DAOs need treasury tools that go beyond basic multi-sig.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DAO", "DeFi"],
    websiteUrl: "https://vaultdao.example",
    projectUrl: null,
    otherLinks: ["https://github.com/vaultdao"],
    isFeatured: true,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-05T09:00:00Z",
    updatedAt: "2026-03-28T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_09",
    userId: "user_builder_03",
    name: "ChainProof",
    description: "Zero-knowledge proof generator for on-chain identity verification. Prove your credentials without revealing personal data.",
    problemStatement: "On-chain identity checks require exposing sensitive information.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Privacy", "Identity"],
    websiteUrl: "https://chainproof.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-14T09:00:00Z",
    updatedAt: "2026-04-05T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_10",
    userId: "user_builder_01",
    name: "PayStream",
    description: "Token streaming protocol for continuous payroll and vesting schedules. Employees withdraw earned tokens every second.",
    problemStatement: "Monthly payroll cycles create cash flow friction for contributors.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DeFi", "Payments"],
    websiteUrl: "https://paystream.example",
    projectUrl: "https://app.paystream.example",
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-03-30T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_11",
    userId: "user_builder_04",
    name: "PixelVerse",
    description: "Fully on-chain pixel art creation and trading platform. Every pixel is an NFT composable into larger artworks.",
    problemStatement: "Digital artists want provably scarce building blocks, not static JPEGs.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["NFT", "Gaming"],
    websiteUrl: "https://pixelverse.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: true,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-01-28T09:00:00Z",
    updatedAt: "2026-04-02T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_12",
    userId: "user_builder_02",
    name: "NodeRank",
    description: "Reputation scoring system for blockchain validators. Tracks uptime, slashing events, and governance participation across multiple networks.",
    problemStatement: "Delegators have no reliable way to compare validator performance.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Infra", "Analytics"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-04-08T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_13",
    userId: "user_builder_03",
    name: "GasGuard",
    description: "Gas price prediction and transaction batching service. Saves users up to 40% on gas fees by timing transactions to low-fee windows.",
    problemStatement: "Users overpay for gas because they submit transactions at peak times.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Tooling", "DeFi"],
    websiteUrl: "https://gasguard.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "CUSTOM",
    hiddenSections: ["applications"],
    archivedAt: null,
    createdAt: "2026-03-12T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_14",
    userId: "user_builder_04",
    name: "ForkAlert",
    description: "Automated monitoring for smart contract forks and clones. Get notified when someone deploys a modified version of your contract.",
    problemStatement: "Builders get forked without knowing. ForkAlert tracks bytecode similarity.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Security", "Tooling"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-04-12T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_15",
    userId: "user_builder_05",
    name: "LiquidStake",
    description: "Liquid staking derivative for AVAX. Stake your tokens and receive a transferable receipt that earns yield while remaining liquid for DeFi.",
    problemStatement: "Staked AVAX is locked and unusable. Liquid staking fixes this.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DeFi", "Staking"],
    websiteUrl: "https://liquidstake.example",
    projectUrl: "https://app.liquidstake.example",
    otherLinks: [],
    isFeatured: true,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-04-14T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_16",
    userId: "user_builder_05",
    name: "ContractCanvas",
    description: "Visual smart contract builder with drag-and-drop components. Generates auditable Solidity from a flowchart interface.",
    problemStatement: "Non-coders want to deploy contracts without writing Solidity.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Tooling", "Education"],
    websiteUrl: "https://contractcanvas.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-04-06T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_17",
    userId: "user_builder_01",
    name: "BountyBoard",
    description: "Decentralized bounty marketplace for open-source contributors. Post tasks, set milestones, pay on completion with escrow protection.",
    problemStatement: "Open-source contributions lack structured incentives.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["DAO", "Marketplace"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-04-15T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_18",
    userId: "user_builder_02",
    name: "DataVault",
    description: "Encrypted off-chain storage with on-chain access control. Store documents, keys, and configs with granular permission NFTs.",
    problemStatement: "Sensitive data needs encryption at rest with blockchain-grade access control.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Privacy", "Infra"],
    websiteUrl: "https://datavault.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "CUSTOM",
    hiddenSections: ["applications"],
    archivedAt: null,
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-04-09T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_19",
    userId: "user_builder_03",
    name: "OracleNet",
    description: "Decentralized oracle network optimized for Avalanche subnets. Delivers price feeds, weather data, and sports scores with sub-second latency.",
    problemStatement: "Existing oracles are too slow for time-sensitive subnet applications.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Infra", "Oracle"],
    websiteUrl: "https://oraclenet.example",
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-04-11T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "proj_20",
    userId: "user_builder_04",
    name: "MintDrop",
    description: "Airdrop distribution engine for token launches. Schedule multi-chain drops with Merkle proofs, vesting cliffs, and claim analytics.",
    problemStatement: "Token airdrops are manual, error-prone, and expensive at scale.",
    logoUrl: null,
    bannerUrl: null,
    imageUrls: [],
    contractAddresses: [],
    categories: ["Tooling", "Payments"],
    websiteUrl: null,
    projectUrl: null,
    otherLinks: [],
    isFeatured: false,
    visibility: "PUBLIC",
    hiddenSections: [],
    archivedAt: null,
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-04-16T09:00:00Z",
    deletedAt: null,
  },
];

export const mockProjectTeam: ProjectTeamMember[] = [
  {
    id: "pt_01",
    projectId: "proj_01",
    name: "Alice Applicant",
    email: "alice.applicant@example.com",
    role: "Founder",
    github: "alice",
    twitter: "@alice",
    linkedIn: null,
  },
  {
    id: "pt_02",
    projectId: "proj_01",
    name: "Bob Builder",
    email: "bob@avaswap.example",
    role: "Smart Contract Engineer",
    github: "bob",
    twitter: null,
    linkedIn: "bob-builder",
  },
  {
    id: "pt_03",
    projectId: "proj_02",
    name: "Alice Applicant",
    email: "alice.applicant@example.com",
    role: "Product",
    github: null,
    twitter: null,
    linkedIn: null,
  },
];

export const mockProjectUpdates: ProjectUpdate[] = [
  {
    id: "pu_01",
    projectId: "proj_01",
    title: "Mainnet beta live",
    content: "We shipped the mainnet beta this week. 120 wallets so far.",
    createdAt: "2026-03-18T09:00:00Z",
  },
  {
    id: "pu_02",
    projectId: "proj_01",
    title: "Security audit kickoff",
    content: "Third-party audit starting next Monday.",
    createdAt: "2026-03-22T09:00:00Z",
  },
];

export const mockProjectVersions: ProjectVersion[] = [
  {
    id: "pv_01",
    projectId: "proj_01",
    version: 1,
    snapshot: { name: "AvaSwap DEX", description: "Initial version" },
    changedBy: "user_applicant",
    changeLog: "Initial version",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "pv_02",
    projectId: "proj_01",
    version: 2,
    snapshot: { name: "AvaSwap DEX", description: "Added team details" },
    changedBy: "user_applicant",
    changeLog: "Added team details and problem statement",
    createdAt: "2026-02-05T09:00:00Z",
  },
];

export const mockFileLinks: FileLink[] = [
  {
    id: "fl_01",
    projectId: "proj_01",
    name: "AvaSwap Pitch Deck",
    url: "https://example.com/avaswap-deck.pdf",
    type: "application/pdf",
    uploadedBy: "user_applicant",
    createdAt: "2026-01-20T09:00:00Z",
  },
  {
    id: "fl_02",
    projectId: "proj_01",
    name: "AvaSwap Whitepaper",
    url: "https://example.com/avaswap-whitepaper.pdf",
    type: "application/pdf",
    uploadedBy: "user_applicant",
    createdAt: "2026-01-21T09:00:00Z",
  },
];

export function findProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id);
}

export function findProjectsByOwner(userId: string): Project[] {
  return mockProjects.filter((p) => p.userId === userId && !p.deletedAt);
}

export function findFeaturedProjects(): Project[] {
  return mockProjects.filter(
    (p) =>
      p.isFeatured &&
      !p.deletedAt &&
      !p.archivedAt &&
      p.visibility !== "PRIVATE",
  );
}

/**
 * Projects that are eligible for Discover / public showcase listings.
 * Excludes private, archived, and soft-deleted rows.
 */
export function findPublicProjects(): Project[] {
  return mockProjects.filter(
    (p) => !p.deletedAt && !p.archivedAt && p.visibility !== "PRIVATE",
  );
}

// ---------- Visibility helpers ----------

/**
 * Returns true if the given section should be visible on the public showcase for this project.
 * PUBLIC → always true. PRIVATE → always false. CUSTOM → visible iff not in hiddenSections.
 * Owners and org-with-application viewers bypass this; use canSeeFullProject for that.
 */
export function isSectionPublic(
  project: Project,
  section: ProjectSectionKey,
): boolean {
  if (project.visibility === "PRIVATE") return false;
  if (project.visibility === "PUBLIC") return true;
  return !project.hiddenSections.includes(section);
}

/**
 * Count of toggleable sections hidden on the public showcase for this project.
 * PUBLIC → 0. PRIVATE → all toggleable sections. CUSTOM → length of hiddenSections.
 */
export function countHiddenSections(project: Project): number {
  if (project.visibility === "PUBLIC") return 0;
  if (project.visibility === "PRIVATE") return PROJECT_TOGGLEABLE_SECTIONS.length;
  return project.hiddenSections.length;
}

/**
 * Human-readable visibility label used on the visibility pill in listings and headers.
 * "PUBLIC", "PRIVATE", "CUSTOM · 3 hidden", "ARCHIVED" (archive wins over visibility for display).
 */
export function getVisibilityLabel(project: Project): string {
  if (project.archivedAt) return "ARCHIVED";
  if (project.visibility === "PUBLIC") return "PUBLIC";
  if (project.visibility === "PRIVATE") return "PRIVATE";
  const n = project.hiddenSections.length;
  if (n === 0) return "CUSTOM";
  return `CUSTOM · ${n} hidden`;
}

/**
 * Should the given viewer see the **full** project (bypassing visibility + section toggles)?
 *
 * Full access granted when:
 *  - viewer is the project owner
 *  - viewer is a platform admin
 *  - viewer is an org user whose org runs a grant that has received any application from
 *    this project (grant-visibility override — reviewer fairness, forever, even WITHDRAWN)
 *
 * Caller supplies the applications + grants slices so this helper stays pure and server-safe.
 * TODO(tier-2): wire the org-membership check through /lib/auth when org review pages land.
 */
export function canSeeFullProject(
  viewer: User | null,
  project: Project,
  applications: Application[],
  grants: Grant[],
  viewerOrgIds: string[] = [],
): boolean {
  if (!viewer) return false;
  if (viewer.isPlatformAdmin) return true;
  if (project.userId === viewer.id) return true;
  if (viewerOrgIds.length === 0) return false;

  const relevantGrantIds = new Set(
    applications.filter((a) => a.projectId === project.id).map((a) => a.grantId),
  );
  if (relevantGrantIds.size === 0) return false;

  return grants.some(
    (g) => relevantGrantIds.has(g.id) && viewerOrgIds.includes(g.organizationId),
  );
}
