import { notFound, redirect } from "next/navigation";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById, mockFileLinks } from "@/lib/mock/projects";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { ManageFilesPanel } from "./_components/ManageFilesPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageFilesPage({ params }: PageProps) {
  const { id } = await params;
  const role = await getServerRole();

  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/files`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/files`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  const files = mockFileLinks
    .filter((f) => f.projectId === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <ManageFilesPanel project={project} initialFiles={files} />;
}
