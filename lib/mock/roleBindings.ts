import type { User, Organization } from "@/lib/types";
import type { MockRole } from "@/lib/auth/roles";
import { mockUsers } from "./users";
import { mockOrgs } from "./orgs";

function userById(id: string): User {
  const u = mockUsers.find((x) => x.id === id);
  if (!u) throw new Error(`mock user ${id} not found`);
  return u;
}

function orgById(id: string): Organization {
  const o = mockOrgs.find((x) => x.id === id);
  if (!o) throw new Error(`mock org ${id} not found`);
  return o;
}

export const MOCK_USERS_BY_ROLE: Record<MockRole, User | null> = {
  visitor: null,
  applicant: userById("user_applicant"),
  admin: userById("user_admin"),
  org: userById("user_owner"),
};

export const MOCK_PRIMARY_ORG_BY_ROLE: Record<MockRole, Organization | null> = {
  visitor: null,
  applicant: null,
  admin: null,
  org: orgById("org_avalanche"),
};
