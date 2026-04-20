import Link from "next/link";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
  acceptedCount?: number;
}

export function ProjectRowCard({ project, acceptedCount }: Props) {
  return (
    <Link
      href={`/discover/projects/${project.id}`}
      className="flex flex-col gap-3 border border-[var(--color-border-muted)] p-5 hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
    >
      <h3 className="text-base uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>{project.name}</h3>
      <p className="line-clamp-3 text-xs leading-relaxed">{project.description}</p>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {project.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {project.categories.map((c) => (
              <span
                key={c}
                className="border border-current px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
        {acceptedCount !== undefined && acceptedCount > 0 ? (
          <p className="text-[10px] font-semibold uppercase tracking-widest">
            Accepted for funding — {acceptedCount} grant{acceptedCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
