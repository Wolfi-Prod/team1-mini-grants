import { notFound, redirect } from "next/navigation";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById, mockProjectUpdates } from "@/lib/mock/projects";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { ManageUpdatesPanel } from "./_components/ManageUpdatesPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageUpdatesPage({ params }: PageProps) {
  const { id } = await params;
  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/updates`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }
  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/updates`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  const updates = mockProjectUpdates
    .filter((u) => u.projectId === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <ManageUpdatesPanel project={project} initialUpdates={updates} />;
}
