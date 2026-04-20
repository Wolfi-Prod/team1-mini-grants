import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import type { Grant, Organization } from "@/lib/types";

interface Props {
  grant: Grant;
  org?: Organization;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function GrantRowCard({ grant, org }: Props) {
  const days = daysUntil(grant.deadline);
  return (
    <Link
      href={`/discover/grants/${grant.id}`}
      className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-5 hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant="default">{grant.status}</Badge>
        {grant.fundingPool !== null ? (
          <span className="text-[10px] font-bold uppercase tracking-widest">
            ${grant.fundingPool.toLocaleString()} {grant.currency}
          </span>
        ) : null}
      </div>
      <h3 className="text-base uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{grant.title}</h3>
      {org ? (
        <p className="text-[10px] font-semibold uppercase tracking-widest">{org.name}</p>
      ) : null}
      <p className="line-clamp-3 text-xs leading-relaxed">{grant.description}</p>
      {days !== null ? (
        <p className="mt-auto text-[10px] uppercase tracking-widest">
          {days > 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Closed"}
        </p>
      ) : null}
    </Link>
  );
}
