import type {
  Competition,
  CompetitionFormat,
  CompetitionMainPrize,
  CompetitionSubmission,
  CompetitionSubmissionTrack,
  CompetitionTeam,
  CompetitionTeamInvitation,
  CompetitionTeamMember,
  CompetitionTrack,
} from "@/lib/types";

// ---------- Competitions ----------

export const mockCompetitions: Competition[] = [
  {
    id: "comp_summer_hack",
    organizationId: "org_avalanche",
    format: "HACKATHON",
    title: "Avalanche Summer Hack 2026",
    slug: "avalanche-summer-hack-2026",
    description:
      "A 4-week online hackathon for builders shipping on Avalanche. Bring a team, build a subnet, DeFi primitive, or consumer app, and compete for a $100k prize pool.",
    rules:
      "Teams must submit a working demo + repo link by the submission deadline. All code must be open-source (MIT or Apache-2.0). Judging is in two rounds: community vote (30%) and expert panel (70%). Projects must be started during the hackathon window — no pre-existing code allowed except shared libraries.",
    partner: "Ava Labs",
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: "2026-05-01T00:00:00Z",
    submissionDeadline: "2026-05-28T23:59:59Z",
    judgingEndsAt: "2026-06-05T23:59:59Z",
    resultsAnnouncedAt: "2026-06-10T18:00:00Z",
    minTeamSize: 1,
    maxTeamSize: 5,
    totalPool: 100000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_subnet_jam",
    organizationId: "org_subnet",
    format: "HACKATHON",
    title: "Subnet Jam",
    slug: "subnet-jam",
    description:
      "72-hour sprint to ship a subnet. Partnered with the Subnet Labs team. Solo and team entries welcome.",
    rules:
      "You have 72 hours to deploy a working subnet with at least one custom precompile. Repo + video walkthrough required at submission.",
    partner: "Subnet Labs",
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: "2026-04-20T00:00:00Z",
    submissionDeadline: "2026-04-27T23:59:59Z",
    judgingEndsAt: "2026-04-30T23:59:59Z",
    resultsAnnouncedAt: "2026-05-02T18:00:00Z",
    minTeamSize: 1,
    maxTeamSize: 3,
    totalPool: 30000,
    currency: "USD",
    status: "UPCOMING",
    isPublic: true,
    createdAt: "2026-03-15T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_security_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "Smart Contract Security Challenge",
    slug: "smart-contract-security-challenge",
    description:
      "Rolling challenge: find critical vulnerabilities in deployed contracts from our partner protocols. Responsible disclosure required. Bounties vary by severity.",
    rules:
      "Submit findings via our disclosure form. Include a proof-of-concept exploit. Payouts are made within 30 days of confirmed finding. Duplicate reports go to the first submitter by timestamp.",
    partner: "Backyard Security",
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: null,
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 2,
    totalPool: 250000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_zk_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "ZK Infrastructure Challenge",
    slug: "zk-infrastructure-challenge",
    description:
      "A $50k challenge for teams building zero-knowledge infrastructure — proving systems, verifiers, zk-rollups. One-off, no recurring deadline.",
    rules:
      "Submissions must include: benchmark numbers, a detailed technical writeup, and open-source code. Judging by the Ava Labs research team.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: "2026-03-01T00:00:00Z",
    submissionDeadline: "2026-05-31T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 4,
    totalPool: 50000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-04-05T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_defi_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "DeFi Protocol Challenge",
    slug: "defi-protocol-challenge",
    description: "Build a novel DeFi primitive on Avalanche. Lending, staking, or something new — surprise us.",
    rules: "Open-source code required. Submit a working demo with documentation.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-06-30T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 4,
    totalPool: 35000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_nft_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "NFT Utility Challenge",
    slug: "nft-utility-challenge",
    description: "Go beyond PFPs. Build NFTs with real utility — access control, identity, gaming assets, or ticketing.",
    rules: "Submit a working dApp with at least one utility NFT use case deployed on testnet.",
    partner: "Backyard Labs",
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-07-15T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 3,
    totalPool: 20000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_data_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "On-Chain Analytics Challenge",
    slug: "on-chain-analytics-challenge",
    description: "Build dashboards, indexers, or analytics tools for Avalanche on-chain data.",
    rules: "Must query live chain data. Open-source preferred. Demo required.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-08-01T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 2,
    totalPool: 15000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_tooling_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "Developer Tooling Challenge",
    slug: "developer-tooling-challenge",
    description: "Build CLI tools, SDKs, or dev workflows that make Avalanche development faster and easier.",
    rules: "Must be published to npm or crates.io. Include README with quick-start guide.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: null,
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 3,
    totalPool: 25000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_gaming_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "Web3 Gaming Challenge",
    slug: "web3-gaming-challenge",
    description: "Build a playable on-chain game or gaming infrastructure. From casual to complex.",
    rules: "Playable demo required. Smart contracts on testnet. Game design doc appreciated.",
    partner: "Backyard Gaming",
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-09-01T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 5,
    totalPool: 40000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_governance_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "DAO Governance Challenge",
    slug: "dao-governance-challenge",
    description: "Design and deploy novel governance mechanisms for DAOs. Voting, delegation, or treasury management.",
    rules: "Working smart contracts with a frontend. Writeup explaining the governance model.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-07-31T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 4,
    totalPool: 30000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_bridge_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "Cross-Chain Bridge Challenge",
    slug: "cross-chain-bridge-challenge",
    description: "Build or improve cross-chain bridges connecting Avalanche to other networks. Security-first.",
    rules: "Security audit plan required. Testnet deployment mandatory. Bug bounty commitment appreciated.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: "2026-08-15T23:59:59Z",
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 2,
    maxTeamSize: 5,
    totalPool: 60000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "comp_privacy_challenge",
    organizationId: "org_avalanche",
    format: "CHALLENGE",
    title: "Privacy Infrastructure Challenge",
    slug: "privacy-infrastructure-challenge",
    description: "Build privacy-preserving tools — confidential transactions, private smart contracts, or encrypted state.",
    rules: "Cryptographic approach must be documented. Working prototype required.",
    partner: null,
    partnerLogoUrl: null,
    bannerUrl: null,
    registrationOpensAt: null,
    submissionDeadline: null,
    judgingEndsAt: null,
    resultsAnnouncedAt: null,
    minTeamSize: 1,
    maxTeamSize: 3,
    totalPool: 45000,
    currency: "USD",
    status: "OPEN",
    isPublic: true,
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
];

// ---------- Main prizes ----------

export const mockCompetitionMainPrizes: CompetitionMainPrize[] = [
  // Summer Hack — ranked main prizes
  {
    id: "mp_sh_01",
    competitionId: "comp_summer_hack",
    rank: 1,
    label: "First place",
    amount: 40000,
    currency: "USD",
    description: "Plus mentorship from Ava Labs research team.",
  },
  {
    id: "mp_sh_02",
    competitionId: "comp_summer_hack",
    rank: 2,
    label: "Runner-up",
    amount: 20000,
    currency: "USD",
    description: null,
  },
  {
    id: "mp_sh_03",
    competitionId: "comp_summer_hack",
    rank: 3,
    label: "Third place",
    amount: 10000,
    currency: "USD",
    description: null,
  },
  {
    id: "mp_sh_04",
    competitionId: "comp_summer_hack",
    rank: 4,
    label: "Community favourite",
    amount: 5000,
    currency: "USD",
    description: "Voted by the community.",
  },
  // Subnet Jam — 1st/2nd only
  {
    id: "mp_sj_01",
    competitionId: "comp_subnet_jam",
    rank: 1,
    label: "First place",
    amount: 15000,
    currency: "USD",
    description: null,
  },
  {
    id: "mp_sj_02",
    competitionId: "comp_subnet_jam",
    rank: 2,
    label: "Runner-up",
    amount: 5000,
    currency: "USD",
    description: null,
  },
  // ZK Challenge — single prize
  {
    id: "mp_zk_01",
    competitionId: "comp_zk_challenge",
    rank: 1,
    label: "Winning submission",
    amount: 50000,
    currency: "USD",
    description: "Paid as a grant disbursement.",
  },
  // Security challenge uses severity-tiered bounties not ranked prizes; no main prizes here.
];

// ---------- Tracks ----------

export const mockCompetitionTracks: CompetitionTrack[] = [
  // Summer Hack — 5 tracks, $5k each
  {
    id: "ct_sh_defi",
    competitionId: "comp_summer_hack",
    name: "DeFi track",
    description: "DEXs, lending, structured products, stablecoins.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 0,
  },
  {
    id: "ct_sh_nft",
    competitionId: "comp_summer_hack",
    name: "NFT + Gaming track",
    description: "Consumer apps, gaming primitives, on-chain collectibles.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 1,
  },
  {
    id: "ct_sh_infra",
    competitionId: "comp_summer_hack",
    name: "Infra + Tooling track",
    description: "Indexers, RPCs, SDKs, developer experience.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 2,
  },
  {
    id: "ct_sh_subnet",
    competitionId: "comp_summer_hack",
    name: "Subnet track",
    description: "Application-specific subnets and precompiles.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 3,
  },
  {
    id: "ct_sh_social",
    competitionId: "comp_summer_hack",
    name: "Social + Community track",
    description: "Creator economy, social primitives, DAO tooling.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 4,
  },
  // Subnet Jam — 2 tracks
  {
    id: "ct_sj_game",
    competitionId: "comp_subnet_jam",
    name: "Gaming subnet",
    description: null,
    prizeAmount: 2500,
    currency: "USD",
    sortOrder: 0,
  },
  {
    id: "ct_sj_defi",
    competitionId: "comp_subnet_jam",
    name: "DeFi subnet",
    description: null,
    prizeAmount: 2500,
    currency: "USD",
    sortOrder: 1,
  },
  // Security Challenge — severity tracks
  {
    id: "ct_sec_crit",
    competitionId: "comp_security_challenge",
    name: "Critical",
    description: "Funds at risk, governance takeover, protocol-level.",
    prizeAmount: 50000,
    currency: "USD",
    sortOrder: 0,
  },
  {
    id: "ct_sec_high",
    competitionId: "comp_security_challenge",
    name: "High",
    description: "Significant user-level impact.",
    prizeAmount: 15000,
    currency: "USD",
    sortOrder: 1,
  },
  {
    id: "ct_sec_med",
    competitionId: "comp_security_challenge",
    name: "Medium",
    description: "Edge-case exploitation, limited blast radius.",
    prizeAmount: 5000,
    currency: "USD",
    sortOrder: 2,
  },
  // ZK Challenge has no tracks — one prize pool.
];

// ---------- Teams ----------

export const mockCompetitionTeams: CompetitionTeam[] = [
  {
    id: "team_sh_01",
    competitionId: "comp_summer_hack",
    name: "AvaSwap Core",
    leadUserId: "user_applicant",
    isPublic: true,
    createdAt: "2026-04-02T09:00:00Z",
    updatedAt: "2026-04-10T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "team_sh_02",
    competitionId: "comp_summer_hack",
    name: "Glacier Builders",
    leadUserId: "user_whitelisted",
    isPublic: false,
    createdAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "team_sh_03",
    competitionId: "comp_summer_hack",
    name: "Solo Shipper",
    leadUserId: "user_editor",
    isPublic: false,
    createdAt: "2026-04-08T09:00:00Z",
    updatedAt: "2026-04-08T09:00:00Z",
    deletedAt: null,
  },
  {
    id: "team_zk_01",
    competitionId: "comp_zk_challenge",
    name: "Frozen Proofs",
    leadUserId: "user_applicant",
    isPublic: true,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
    deletedAt: null,
  },
];

export const mockCompetitionTeamMembers: CompetitionTeamMember[] = [
  // AvaSwap Core — 3 members
  {
    id: "tm_sh_01_01",
    teamId: "team_sh_01",
    userId: "user_applicant",
    role: "LEAD",
    joinedAt: "2026-04-02T09:00:00Z",
  },
  {
    id: "tm_sh_01_02",
    teamId: "team_sh_01",
    userId: "user_reviewer",
    role: "MEMBER",
    joinedAt: "2026-04-03T09:00:00Z",
  },
  {
    id: "tm_sh_01_03",
    teamId: "team_sh_01",
    userId: "user_grantreviewer",
    role: "MEMBER",
    joinedAt: "2026-04-04T09:00:00Z",
  },
  // Glacier Builders — 2 members
  {
    id: "tm_sh_02_01",
    teamId: "team_sh_02",
    userId: "user_whitelisted",
    role: "LEAD",
    joinedAt: "2026-04-05T09:00:00Z",
  },
  {
    id: "tm_sh_02_02",
    teamId: "team_sh_02",
    userId: "user_editor",
    role: "MEMBER",
    joinedAt: "2026-04-06T09:00:00Z",
  },
  // Solo Shipper — 1 member
  {
    id: "tm_sh_03_01",
    teamId: "team_sh_03",
    userId: "user_editor",
    role: "LEAD",
    joinedAt: "2026-04-08T09:00:00Z",
  },
  // Frozen Proofs — solo
  {
    id: "tm_zk_01_01",
    teamId: "team_zk_01",
    userId: "user_applicant",
    role: "LEAD",
    joinedAt: "2026-03-10T09:00:00Z",
  },
];

// ---------- Submissions ----------

// ---------- Team invitations ----------

export const mockCompetitionTeamInvitations: CompetitionTeamInvitation[] = [
  {
    // Pending invite for Wendy from AvaSwap Core — she's not yet on any team for the hack.
    id: "inv_sh_01",
    teamId: "team_sh_01",
    competitionId: "comp_summer_hack",
    email: "wendy.whitelist@avalanche.org",
    invitedUserId: "user_whitelisted",
    status: "PENDING",
    invitedBy: "user_applicant",
    message: "We need a subnet expert. Come join the AvaSwap Core team!",
    createdAt: "2026-04-10T09:00:00Z",
    respondedAt: null,
  },
  {
    // Invite blocked because the target is already on another team in the same comp.
    id: "inv_sh_02",
    teamId: "team_sh_01",
    competitionId: "comp_summer_hack",
    email: "eddie.editor@avalanche.org",
    invitedUserId: "user_editor",
    status: "BLOCKED_ALREADY_ON_TEAM",
    invitedBy: "user_applicant",
    message: "Want to join?",
    createdAt: "2026-04-11T09:00:00Z",
    respondedAt: null,
  },
];

// ---------- Submissions ----------

export const mockCompetitionSubmissions: CompetitionSubmission[] = [
  {
    id: "sub_sh_01",
    competitionId: "comp_summer_hack",
    teamId: "team_sh_01",
    projectId: "proj_01",
    status: "SUBMITTED",
    submittedAt: "2026-05-20T14:00:00Z",
    decidedAt: null,
    createdAt: "2026-04-15T09:00:00Z",
    updatedAt: "2026-05-20T14:00:00Z",
  },
];

export const mockCompetitionSubmissionTracks: CompetitionSubmissionTrack[] = [
  // AvaSwap Core submission entered in DeFi + Infra tracks
  {
    id: "st_sh_01_defi",
    submissionId: "sub_sh_01",
    trackId: "ct_sh_defi",
  },
  {
    id: "st_sh_01_infra",
    submissionId: "sub_sh_01",
    trackId: "ct_sh_infra",
  },
];

// ---------- Helpers ----------

export function findCompetitionById(id: string): Competition | undefined {
  return mockCompetitions.find((c) => c.id === id);
}

export function findCompetitionsByFormat(
  format: CompetitionFormat,
): Competition[] {
  return mockCompetitions.filter(
    (c) => c.format === format && c.isPublic && !c.deletedAt && c.status !== "DRAFT",
  );
}

export function findMainPrizesByCompetition(
  competitionId: string,
): CompetitionMainPrize[] {
  return mockCompetitionMainPrizes
    .filter((p) => p.competitionId === competitionId)
    .sort((a, b) => a.rank - b.rank);
}

export function findTracksByCompetition(
  competitionId: string,
): CompetitionTrack[] {
  return mockCompetitionTracks
    .filter((t) => t.competitionId === competitionId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findTeamsByCompetition(
  competitionId: string,
): CompetitionTeam[] {
  return mockCompetitionTeams.filter(
    (t) => t.competitionId === competitionId && !t.deletedAt,
  );
}

export function findMembersByTeam(teamId: string): CompetitionTeamMember[] {
  return mockCompetitionTeamMembers.filter((m) => m.teamId === teamId);
}

export function findSubmissionsByCompetition(
  competitionId: string,
): CompetitionSubmission[] {
  return mockCompetitionSubmissions.filter(
    (s) => s.competitionId === competitionId,
  );
}

export function findSubmissionByTeam(
  teamId: string,
): CompetitionSubmission | undefined {
  return mockCompetitionSubmissions.find((s) => s.teamId === teamId);
}

export function findTracksBySubmission(
  submissionId: string,
): CompetitionSubmissionTrack[] {
  return mockCompetitionSubmissionTracks.filter(
    (st) => st.submissionId === submissionId,
  );
}

export function findTeamForUserInCompetition(
  userId: string,
  competitionId: string,
): CompetitionTeam | undefined {
  const teamIds = new Set(
    mockCompetitionTeamMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.teamId),
  );
  return mockCompetitionTeams.find(
    (t) => t.competitionId === competitionId && teamIds.has(t.id) && !t.deletedAt,
  );
}

export function findPendingInvitesForUser(
  userId: string,
  competitionId: string,
): CompetitionTeamInvitation[] {
  return mockCompetitionTeamInvitations.filter(
    (i) =>
      i.invitedUserId === userId &&
      i.competitionId === competitionId &&
      i.status === "PENDING",
  );
}

export interface UserCompetitionRow {
  team: CompetitionTeam;
  competition: Competition;
  submission: CompetitionSubmission | null;
}

export function findCompetitionTeamsByUser(userId: string): UserCompetitionRow[] {
  const teamIds = new Set(
    mockCompetitionTeamMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.teamId),
  );
  const rows: UserCompetitionRow[] = [];
  for (const team of mockCompetitionTeams) {
    if (!teamIds.has(team.id) || team.deletedAt) continue;
    const competition = mockCompetitions.find((c) => c.id === team.competitionId);
    if (!competition) continue;
    const submission =
      mockCompetitionSubmissions.find((s) => s.teamId === team.id) ?? null;
    rows.push({ team, competition, submission });
  }
  return rows;
}

/**
 * Derive a human-readable time-window label for a competition. Used on listing cards.
 *  - OPEN + deadline → "N days left"
 *  - UPCOMING + registration → "Opens in N days"
 *  - JUDGING → "Judging"
 *  - ANNOUNCED → "Results announced"
 *  - CLOSED → "Closed"
 *  - CHALLENGE with no deadline → "Rolling"
 */
export function getCompetitionTimingLabel(c: Competition): string {
  const now = Date.now();
  const daysFrom = (iso: string) =>
    Math.ceil((new Date(iso).getTime() - now) / (1000 * 60 * 60 * 24));

  if (c.status === "CLOSED") return "Closed";
  if (c.status === "ANNOUNCED") return "Results announced";
  if (c.status === "JUDGING") return "Judging";
  if (c.status === "UPCOMING" && c.registrationOpensAt) {
    const d = daysFrom(c.registrationOpensAt);
    return d > 0 ? `Opens in ${d} day${d === 1 ? "" : "s"}` : "Opening soon";
  }
  if (c.status === "OPEN") {
    if (c.submissionDeadline) {
      const d = daysFrom(c.submissionDeadline);
      if (d > 0) return `${d} day${d === 1 ? "" : "s"} left`;
      return "Closing";
    }
    return "Rolling";
  }
  return c.status;
}
