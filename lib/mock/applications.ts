import type { Application, ApplicationAnswer, ApplicationVersion } from "@/lib/types";

export const mockApplications: Application[] = [
  {
    id: "app_01",
    projectId: "proj_01",
    grantId: "grant_defi",
    status: "IN_REVIEW",
    coverNote:
      "We're requesting funding to complete our security audit and launch on mainnet.",
    fundingRequested: 50000,
    submittedAt: "2026-03-15T09:00:00Z",
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-03-14T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "app_02",
    projectId: "proj_02",
    grantId: "grant_nft",
    status: "SUBMITTED",
    coverNote: "Funding to expand cold-storage key support to Ledger and Keystone.",
    fundingRequested: 25000,
    submittedAt: "2026-04-01T09:00:00Z",
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-03-30T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "app_03",
    projectId: "proj_03",
    grantId: "grant_defi",
    status: "DRAFT",
    coverNote: null,
    fundingRequested: null,
    submittedAt: null,
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T09:00:00Z",
  },
  {
    id: "app_04",
    projectId: "proj_01",
    grantId: "grant_infra",
    status: "ACCEPTED",
    coverNote: "Indexer + explorer contribution.",
    fundingRequested: 15000,
    submittedAt: "2026-02-10T09:00:00Z",
    decidedAt: "2026-02-28T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-02-08T09:00:00Z",
    updatedAt: "2026-02-28T09:00:00Z",
  },
  {
    id: "app_05",
    projectId: "proj_07",
    grantId: "grant_infra",
    status: "ACCEPTED",
    coverNote: "SubnetWatch monitoring dashboard for validator operators.",
    fundingRequested: 35000,
    submittedAt: "2026-02-15T09:00:00Z",
    decidedAt: "2026-03-05T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
  },
  {
    id: "app_06",
    projectId: "proj_08",
    grantId: "grant_minigrant",
    status: "ACCEPTED",
    coverNote: "VaultDAO treasury management for Avalanche DAOs.",
    fundingRequested: 20000,
    submittedAt: "2026-02-20T09:00:00Z",
    decidedAt: "2026-03-10T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-02-18T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "app_07",
    projectId: "proj_10",
    grantId: "grant_defi",
    status: "IN_REVIEW",
    coverNote: "PayStream continuous payroll protocol.",
    fundingRequested: 45000,
    submittedAt: "2026-03-20T09:00:00Z",
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "app_08",
    projectId: "proj_11",
    grantId: "grant_nft",
    status: "ACCEPTED",
    coverNote: "PixelVerse on-chain pixel art platform.",
    fundingRequested: 30000,
    submittedAt: "2026-02-25T09:00:00Z",
    decidedAt: "2026-03-15T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-02-22T09:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "app_09",
    projectId: "proj_15",
    grantId: "grant_defi",
    status: "ACCEPTED",
    coverNote: "LiquidStake AVAX liquid staking derivative.",
    fundingRequested: 75000,
    submittedAt: "2026-01-25T09:00:00Z",
    decidedAt: "2026-02-15T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "app_10",
    projectId: "proj_04",
    grantId: "grant_minigrant",
    status: "ACCEPTED",
    coverNote: "CrystalLend fixed-rate lending for small borrowers.",
    fundingRequested: 40000,
    submittedAt: "2026-03-01T09:00:00Z",
    decidedAt: "2026-03-20T09:00:00Z",
    decidedBy: "user_owner",
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "app_11",
    projectId: "proj_12",
    grantId: "grant_infra",
    status: "SUBMITTED",
    coverNote: "NodeRank validator reputation scoring.",
    fundingRequested: 28000,
    submittedAt: "2026-04-01T09:00:00Z",
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "app_12",
    projectId: "proj_19",
    grantId: "grant_infra",
    status: "IN_REVIEW",
    coverNote: "OracleNet decentralized oracle for subnets.",
    fundingRequested: 55000,
    submittedAt: "2026-03-25T09:00:00Z",
    decidedAt: null,
    decidedBy: null,
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
  },
];

export const mockApplicationAnswers: ApplicationAnswer[] = [
  {
    id: "ans_01",
    applicationId: "app_01",
    questionId: "gq_01",
    answer:
      "Launch on Avalanche C-Chain then integrate with Trader Joe and Benqi for bootstrapped liquidity.",
  },
  {
    id: "ans_02",
    applicationId: "app_01",
    questionId: "gq_02",
    answer: "DEX",
  },
  {
    id: "ans_03",
    applicationId: "app_01",
    questionId: "gq_03",
    answer: "https://app.avaswap.example/testnet",
  },
  {
    id: "ans_04",
    applicationId: "app_02",
    questionId: "gq_05",
    answer: "Creators in the 1-10k follower range who self-custody.",
  },
];

export function findApplicationById(id: string): Application | undefined {
  return mockApplications.find((a) => a.id === id);
}

export function findApplicationsByProject(projectId: string): Application[] {
  return mockApplications.filter((a) => a.projectId === projectId);
}

export function findApplicationsByGrant(grantId: string): Application[] {
  return mockApplications.filter((a) => a.grantId === grantId);
}

export function findApplicationsByApplicant(userId: string): Application[] {
  // applicant owns the project that owns the application
  // caller must resolve projects; this is a convenience
  return mockApplications.filter((a) => a.projectId.startsWith("proj_") && !!userId);
}

export function findAnswersByApplication(appId: string): ApplicationAnswer[] {
  return mockApplicationAnswers.filter((a) => a.applicationId === appId);
}

/**
 * Mock application versions. Alice's DeFi Builders application (app_01) has 2 versions
 * because the org asked for changes between submit and resubmit — that's the demo case
 * for the diff viewer. Other apps have v1 only.
 */
export const mockApplicationVersions: ApplicationVersion[] = [
  {
    id: "av_app01_v1",
    applicationId: "app_01",
    version: 1,
    snapshot: {
      coverNote:
        "We need funding to finish our MVP — most of the work is still ahead of us.",
      fundingRequested: 40000,
      answers: [
        { questionId: "q_defi_01", answer: "AMM with single-pool liquidity." },
        { questionId: "q_defi_02", answer: "$40,000" },
        { questionId: "q_defi_03", answer: "Plan to audit later." },
      ],
    },
    submittedBy: "user_applicant",
    createdAt: "2026-03-14T09:00:00Z",
  },
  {
    id: "av_app01_v2",
    applicationId: "app_01",
    version: 2,
    snapshot: {
      coverNote:
        "We're requesting funding to complete our security audit and launch on mainnet.",
      fundingRequested: 50000,
      answers: [
        {
          questionId: "q_defi_01",
          answer:
            "AMM-style DEX with dynamic fee tiers; reduces slippage for small traders.",
        },
        { questionId: "q_defi_02", answer: "$50,000" },
        {
          questionId: "q_defi_03",
          answer:
            "Third-party audit with Quantstamp starts next Monday; funding covers the full scope.",
        },
      ],
    },
    submittedBy: "user_applicant",
    createdAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "av_app02_v1",
    applicationId: "app_02",
    version: 1,
    snapshot: {
      coverNote:
        "GlacierNFT is the open-source NFT minting suite with cold-storage support.",
      fundingRequested: 25000,
      answers: [],
    },
    submittedBy: "user_applicant",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "av_app04_v1",
    applicationId: "app_04",
    version: 1,
    snapshot: {
      coverNote:
        "Permafrost Indexer — subgraph-style archival indexer for Avalanche state.",
      fundingRequested: 15000,
      answers: [],
    },
    submittedBy: "user_applicant",
    createdAt: "2026-02-01T09:00:00Z",
  },
];

export function findVersionsByApplication(appId: string): ApplicationVersion[] {
  return mockApplicationVersions
    .filter((v) => v.applicationId === appId)
    .sort((a, b) => a.version - b.version);
}
