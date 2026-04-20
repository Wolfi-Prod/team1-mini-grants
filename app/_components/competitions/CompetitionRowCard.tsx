import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import { getCompetitionTimingLabel } from "@/lib/mock/competitions";
import type { Competition, Organization } from "@/lib/types";

interface Props {
  competition: Competition;
  org?: Organization;
  teamCount: number;
}

export function CompetitionRowCard({ competition, org, teamCount }: Props) {
  const basePath =
    competition.format === "HACKATHON" ? "/hackathons" : "/challenges";
  const timing = getCompetitionTimingLabel(competition);

  return (
    <Link
      href={`${basePath}/${competition.id}`}
      className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-5 hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <Badge variant="default">{competition.status}</Badge>
          <Badge variant="default">{competition.format}</Badge>
        </div>
        {competition.totalPool !== null ? (
          <span className="text-[10px] font-bold uppercase tracking-widest">
            ${competition.totalPool.toLocaleString()} {competition.currency}
          </span>
        ) : null}
      </div>
      <h3 className="text-base uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        {competition.title}
      </h3>
      {competition.partner || org ? (
        <p className="text-[10px] font-semibold uppercase tracking-widest">
          {competition.partner
            ? `Partner: ${competition.partner}`
            : `by ${org?.name ?? "Unknown"}`}
        </p>
      ) : null}
      <p className="line-clamp-3 text-xs leading-relaxed">
        {competition.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-[10px] uppercase tracking-widest">
        <span>{timing}</span>
        <span>
          {teamCount} team{teamCount === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
