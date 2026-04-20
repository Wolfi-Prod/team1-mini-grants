import type { OrganizationMember } from "@/lib/types";

export interface OrgMemberRow {
  membership: OrganizationMember;
  user: {
    id: string;
    name: string;
    email: string;
    handle: string;
  } | null;
}
