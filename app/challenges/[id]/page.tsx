import { notFound } from "next/navigation";
import { getServerUser, getServerRole, getServerOrg } from "@/lib/auth/serverAuth";
import { findCompetitionById } from "@/lib/mock/competitions";
import { CompetitionDetail } from "@/app/_components/competitions/CompetitionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const viewer = await getServerUser();
  const role = await getServerRole();
  const isAdmin = viewer?.isPlatformAdmin ?? false;
  const viewerOrg = role === "org" ? await getServerOrg() : null;

  const competition = findCompetitionById(id);
  const isOrgRunningThisComp =
    !!viewerOrg && !!competition && viewerOrg.id === competition.organizationId;

  const tree = (
    <CompetitionDetail
      competitionId={id}
      expectedFormat="CHALLENGE"
      viewer={viewer}
      isAdmin={isAdmin}
      isOrgRunningThisComp={isOrgRunningThisComp}
    />
  );

  if (!competition) notFound();
  if (competition.format !== "CHALLENGE") notFound();
  if (competition.deletedAt) notFound();
  if (!competition.isPublic && !isAdmin && !isOrgRunningThisComp) notFound();
  if (competition.status === "DRAFT" && !isAdmin && !isOrgRunningThisComp) notFound();

  return tree;
}
