import type { FundingDisbursement } from "@/lib/types";

export const mockDisbursements: FundingDisbursement[] = [
  {
    id: "disb_01",
    applicationId: "app_04",
    amount: 7500,
    currency: "USD",
    status: "COMPLETED",
    milestone: "Milestone 1 — Repo + initial deployment",
    note: "Paid via USDC on Avalanche.",
    disbursedAt: "2026-03-05T09:00:00Z",
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "disb_02",
    applicationId: "app_04",
    amount: 7500,
    currency: "USD",
    status: "PENDING",
    milestone: "Milestone 2 — v1 indexer release",
    note: null,
    disbursedAt: null,
    createdAt: "2026-04-05T09:00:00Z",
  },
];

export function findDisbursementsByApplication(appId: string): FundingDisbursement[] {
  return mockDisbursements.filter((d) => d.applicationId === appId);
}
