import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import {
  findFeaturedProjects,
  findPublicProjects,
  isSectionPublic,
} from "@/lib/mock/projects";
import { mockApplications } from "@/lib/mock/applications";
import { FeaturedCarousel } from "./_components/FeaturedCarousel";
import { ShowcaseGrid } from "./_components/ShowcaseGrid";

export default function ShowcasePage() {
  const featured = findFeaturedProjects();
  const all = findPublicProjects();

  const categories = Array.from(
    new Set(all.flatMap((p) => p.categories)),
  ).sort();

  const acceptedCountByProject: Record<string, number> = {};
  const applicationsPublicByProject = new Map<string, boolean>();
  for (const p of all) {
    applicationsPublicByProject.set(p.id, isSectionPublic(p, "applications"));
  }
  for (const app of mockApplications) {
    if (app.status !== "ACCEPTED") continue;
    if (!applicationsPublicByProject.get(app.projectId)) continue;
    acceptedCountByProject[app.projectId] =
      (acceptedCountByProject[app.projectId] ?? 0) + 1;
  }

  return (
    <div
      className="flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <MockApiBadge
        endpoints={[
          "GET /api/showcase/projects?featured=true",
          "GET /api/showcase/projects?search=&categories=&funded=&sort=",
        ]}
      />

      {/* ── Featured carousel (scrolling right to left) ── */}
      {featured.length > 0 && (
        <FeaturedCarousel
          projects={featured}
          acceptedCountByProject={acceptedCountByProject}
        />
      )}

      {/* ── All projects grid (6 columns) ── */}
      <ShowcaseGrid
        projects={all}
        categories={categories}
        acceptedCountByProject={acceptedCountByProject}
      />

      {/* ── Footer bar ── */}
      <div
        className="mt-auto flex items-center justify-between px-6 py-4 md:px-8"
        style={{
          borderTop: "1px solid var(--line)",
          marginLeft: "calc(var(--rail-w) * -1 - 1px)",
          marginRight: "calc(var(--rail-w) * -1 - 1px)",
          paddingLeft: "calc(var(--rail-w) + var(--pad-x))",
          paddingRight: "calc(var(--rail-w) + var(--pad-x))",
        }}
      >
        <span
          className="text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          Backyard Showcase
        </span>
        <span
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          Live
        </span>
      </div>
    </div>
  );
}
