import type { ApplicationStatus, GrantStatus, ProjectVisibility } from "@/lib/types";

export interface SearchProject {
  id: string;
  name: string;
  description: string;
  categories: string[];
  ownerId: string;
  visibility: ProjectVisibility;
}

export interface SearchGrant {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  status: GrantStatus;
  isPublic: boolean;
}

export interface SearchApplication {
  id: string;
  projectId: string;
  grantId: string;
  status: ApplicationStatus;
  coverNote: string;
}

export interface SearchUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  bio: string;
}

export interface SearchOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface SearchCorpus {
  projects: SearchProject[];
  grants: SearchGrant[];
  applications: SearchApplication[];
  users: SearchUser[];
  orgs: SearchOrg[];
}

export type Scope = "all" | "projects" | "grants" | "applications" | "users" | "orgs";
