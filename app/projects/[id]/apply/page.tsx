import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById } from "@/lib/mock/projects";
import {
  findGrantById,
  findQuestionsByGrant,
} from "@/lib/mock/grants";
import { isProfileComplete } from "@/lib/mock/users";
import { ApplyForm } from "./_components/ApplyForm";
import { loginRedirectUrl } from "@/lib/auth/returnTo";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ grant?: string }>;
}

export default async function ApplyToGrantPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { grant: grantParam } = await searchParams;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/apply${grantParam ? `?grant=${grantParam}` : ""}`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/apply${grantParam ? `?grant=${grantParam}` : ""}`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  // Profile gate: applicant must finish onboarding before applying. We preserve the
  // originally-intended apply URL as `next` so /onboarding can bounce the user back
  // exactly here after they finish their profile.
  if (!isProfileComplete(user)) {
    const applyPath = `/projects/${id}/apply${grantParam ? `?grant=${grantParam}` : ""}`;
    redirect(`/onboarding?reason=apply&next=${encodeURIComponent(applyPath)}`);
  }

  // Apply flow is grant-first: the form is only reachable when a specific grant
  // has been chosen upstream (from /discover/grants/[grantId]). Missing or invalid
  // grant param → bounce to discover so the user picks one first.
  if (!grantParam) redirect("/discover");
  const grant = findGrantById(grantParam);
  if (
    !grant ||
    grant.deletedAt ||
    !grant.isPublic ||
    grant.status !== "OPEN"
  ) {
    redirect("/discover");
  }

  const questions = findQuestionsByGrant(grant.id);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Apply to grant"
        description={
          <>
            Applying to <span className="font-semibold">{grant.title}</span> with{" "}
            <span className="font-semibold">{project.name}</span>. Answer the grant&apos;s
            questions and submit.
          </>
        }
        breadcrumbs={
          <Link
            href={`/discover/grants/${grant.id}`}
            className="underline underline-offset-2"
          >
            ← {grant.title}
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              `GET  /api/discover/grants/${grant.id}`,
              `GET  /api/discover/grants/${grant.id}/questions`,
              "POST /api/applications",
              "POST /api/applications/:id/answers",
            ]}
          />

          <ApplyForm project={project} grant={grant} questions={questions} />
        </div>
      </section>
    </div>
  );
}
