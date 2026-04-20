import type { Organization } from "@/lib/types";

export interface AdminOrgRow {
  org: Organization;
  memberCount: number;
  grantCount: number;
  openGrantCount: number;
}
