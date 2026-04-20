import { redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { mockProjects } from "@/lib/mock/projects";
import { mockGrants } from "@/lib/mock/grants";
import { mockApplications } from "@/lib/mock/applications";
import { mockUsers } from "@/lib/mock/users";
import { mockOrgs } from "@/lib/mock/orgs";
import { SearchPanel } from "./_components/SearchPanel";
import type { SearchCorpus } from "./_components/types";

interface PageProps {
  searchParams: Promise<{ q?: string; scope?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, scope } = await searchParams;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/search"));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/search"));

  // Pre-filter the corpus to what the viewer is allowed to see. We keep this broad in the
  // mock (every role sees every non-deleted resource); the real backend will ACL here
  // before returning.
  const corpus: SearchCorpus = {
    projects: mockProjects
      .filter((p) => !p.deletedAt)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        categories: p.categories,
        ownerId: p.userId,
        visibility: p.visibility,
      })),
    grants: mockGrants
      .filter((g) => !g.deletedAt)
      .map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        organizationId: g.organizationId,
        status: g.status,
        isPublic: g.isPublic,
      })),
    applications: mockApplications.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      grantId: a.grantId,
      status: a.status,
      coverNote: a.coverNote ?? "",
    })),
    users: mockUsers
      .filter((u) => !u.deletedAt)
      .map((u) => ({
        id: u.id,
        name: u.name ?? u.handle,
        handle: u.handle,
        email: u.email,
        bio: u.bio ?? "",
      })),
    orgs: mockOrgs
      .filter((o) => !o.deletedAt)
      .map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        description: o.description ?? "",
      })),
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Search"
        description="Search across projects, grants, applications, users, and organizations. Results honor what you're allowed to see."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/search?q=&scope=projects|grants|applications|users|orgs|all",
            ]}
          />
          <SearchPanel
            corpus={corpus}
            initialQuery={q ?? ""}
            initialScope={(scope ?? "all") as "all" | "projects" | "grants" | "applications" | "users" | "orgs"}
          />
        </div>
      </section>
    </div>
  );
}
