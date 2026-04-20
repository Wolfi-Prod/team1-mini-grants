import type { GrantStatus } from "@/lib/types";

export interface TemplateRow {
  id: string;
  title: string;
  requirements: string | null;
  currency: string;
  fundingPool: number | null;
  isFlagship: boolean;
  questionCount: number;
  status: GrantStatus;
  createdAt: string;
}
