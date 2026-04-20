import { cookies } from "next/headers";
import type { User, Organization } from "@/lib/types";
import { MOCK_AUTH_COOKIE, MOCK_PROFILE_INCOMPLETE_COOKIE } from "./constants";
import { MOCK_ROLES, type MockRole } from "./roles";
import { MOCK_USERS_BY_ROLE, MOCK_PRIMARY_ORG_BY_ROLE } from "@/lib/mock/roleBindings";

export async function getServerRole(): Promise<MockRole> {
  const store = await cookies();
  const raw = store.get(MOCK_AUTH_COOKIE)?.value;
  if (raw && (MOCK_ROLES as readonly string[]).includes(raw)) {
    return raw as MockRole;
  }
  return "visitor";
}

export async function getServerUser(): Promise<User | null> {
  const role = await getServerRole();
  const user = MOCK_USERS_BY_ROLE[role];
  if (!user) return null;
  // Dev toggle: pretend the current applicant hasn't finished onboarding. Lets us demo
  // the /onboarding gate without editing mock data. Only applies to the applicant role —
  // admin + org aren't subject to the gate.
  const store = await cookies();
  const incomplete = store.get(MOCK_PROFILE_INCOMPLETE_COOKIE)?.value === "1";
  if (incomplete && role === "applicant") {
    return { ...user, onboardingCompletedAt: null, bio: null };
  }
  return user;
}

export async function getServerOrg(): Promise<Organization | null> {
  const role = await getServerRole();
  return MOCK_PRIMARY_ORG_BY_ROLE[role] ?? null;
}
