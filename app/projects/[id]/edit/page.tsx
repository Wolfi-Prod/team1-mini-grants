import { notFound, redirect } from "next/navigation";
import { getServerRole, getServerUser, getServerOrg } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { findProjectById } from "@/lib/mock/projects";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { EditProjectForm } from "./_components/EditProjectForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const role = await getServerRole();

  if (!isAuthenticated(role)) redirect(loginRedirectUrl(`/projects/${id}/edit`));
  if (role === "admin") redirect("/admin");
  if (role === "org") {
    const org = await getServerOrg();
    if (org) redirect(`/dashboard/${org.slug}`);
    redirect("/");
  }

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl(`/projects/${id}/edit`));

  const project = findProjectById(id);
  if (!project || project.deletedAt) notFound();

  // Owner-only. Non-owners are bounced to the public project page.
  if (project.userId !== user.id) redirect(`/discover/projects/${project.id}`);

  return <EditProjectForm project={project} />;
}
