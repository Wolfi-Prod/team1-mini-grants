import { notFound, redirect } from "next/navigation";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById, mockProjectTeam } from "@/lib/mock/projects";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { ManageTeamPanel } from "./_components/ManageTeamPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageTeamPage({ params }: PageProps) {
  const { id } = await params;
  const role = await getServerRole();

  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/team`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/team`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  const team = mockProjectTeam.filter((m) => m.projectId === project.id);

  return <ManageTeamPanel project={project} initialTeam={team} />;
}
