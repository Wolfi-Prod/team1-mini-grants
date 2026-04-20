"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
  categories: string[];
  acceptedCountByProject: Record<string, number>;
}

type SortKey = "az" | "za" | "newest" | "oldest";
type FundedFilter = "any" | "yes" | "no";
type ProgramFilter = "all" | "challenge" | "hackathon" | "grant";

interface Filters {
  search: string;
  categories: string[];
  techstack: string[];
  funded: FundedFilter;
  program: ProgramFilter;
  sort: SortKey;
}

const DEFAULTS: Filters = {
  search: "",
  categories: [],
  techstack: [],
  funded: "any",
  program: "all",
  sort: "az",
};

const TECH_STACKS = ["Solidity", "Rust", "TypeScript", "Python", "Go", "React", "Node.js"];

const COLS = 6;
const MAX_ROWS = 2;

export function ShowcaseGrid({ projects, categories, acceptedCountByProject }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.categories.length > 0) {
        if (!filters.categories.some((c) => p.categories.includes(c))) return false;
      }
      if (filters.funded !== "any") {
        const count = acceptedCountByProject[p.id] ?? 0;
        if (filters.funded === "yes" && count === 0) return false;
        if (filters.funded === "no" && count > 0) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "az": return a.name.localeCompare(b.name);
        case "za": return b.name.localeCompare(a.name);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
    return list;
  }, [projects, filters, acceptedCountByProject]);

  const perPage = COLS * MAX_ROWS;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageProjects = filtered.slice(page * perPage, (page + 1) * perPage);

  const hasFilters =
    filters.search !== "" ||
    filters.categories.length > 0 ||
    filters.techstack.length > 0 ||
    filters.funded !== "any" ||
    filters.program !== "all";

  const toggleArrayFilter = (key: "categories" | "techstack", value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((x) => x !== value)
        : [...f[key], value],
    }));
    setPage(0);
  };

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── Search + filter bar (no bottom border) ── */}
      <div className="px-6 md:px-8">
        <div className="flex items-center gap-3 py-3">
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(0); }}
            className="h-8 flex-1 border-0 bg-transparent px-0 text-[13px] outline-none placeholder:text-[var(--color-fg-subtle)]"
            style={{ color: "var(--ink)" }}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition-colors duration-100"
            style={{
              borderColor: filtersOpen ? "var(--line)" : "var(--soft)",
              color: filtersOpen ? "var(--ink)" : "var(--muted)",
              fontFamily: "var(--font-mono-display)",
              background: filtersOpen ? "var(--soft)" : "transparent",
            }}
          >
            Filters {hasFilters ? `(${filters.categories.length + filters.techstack.length + (filters.funded !== "any" ? 1 : 0) + (filters.program !== "all" ? 1 : 0)})` : ""}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setFilters(DEFAULTS); setPage(0); }}
              className="text-[11px] uppercase tracking-[0.08em] transition-colors duration-100"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="py-4">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Category</span>
                <div className="flex flex-col gap-1">
                  {categories.map((c) => (
                    <label key={c} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggleArrayFilter("categories", c)} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Tech Stack</span>
                <div className="flex flex-col gap-1">
                  {TECH_STACKS.map((t) => (
                    <label key={t} className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={filters.techstack.includes(t)} onChange={() => toggleArrayFilter("techstack", t)} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Program</span>
                <div className="flex flex-col gap-1">
                  {(["all", "challenge", "hackathon", "grant"] as const).map((p) => (
                    <label key={p} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="program" checked={filters.program === p} onChange={() => { setFilters((f) => ({ ...f, program: p })); setPage(0); }} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{p === "all" ? "All" : p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Sort</span>
                  <div className="flex flex-col gap-1">
                    {([{ value: "az", label: "A → Z" }, { value: "za", label: "Z → A" }, { value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }] as const).map((s) => (
                      <label key={s.value} className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="sort" checked={filters.sort === s.value} onChange={() => { setFilters((f) => ({ ...f, sort: s.value })); setPage(0); }} className="h-3 w-3 accent-[var(--line)]" />
                        <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Funded</span>
                  <div className="flex flex-col gap-1">
                    {([{ value: "any", label: "Any" }, { value: "yes", label: "Funded" }, { value: "no", label: "Not funded" }] as const).map((f) => (
                      <label key={f.value} className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="funded" checked={filters.funded === f.value} onChange={() => { setFilters((prev) => ({ ...prev, funded: f.value })); setPage(0); }} className="h-3 w-3 accent-[var(--line)]" />
                        <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid (6 cols, with image placeholders) ── */}
      {pageProjects.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
            No projects match your filters
          </p>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "1px",
            background: "var(--line)",
            padding: "1px 0",
          }}
        >
          {pageProjects.map((p) => {
            const accepted = acceptedCountByProject[p.id] ?? 0;
            return (
              <Link
                key={p.id}
                href={`/discover/projects/${p.id}`}
                className="group flex flex-col p-4 transition-colors duration-150"
                style={{ background: "var(--bg)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg)"; }}
              >
                {/* Image placeholder */}
                <div
                  className="mb-3 flex aspect-square w-full items-center justify-center border"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "32px",
                      fontWeight: 400,
                      fontStyle: "italic",
                      color: "var(--muted)",
                    }}
                  >
                    {p.name.charAt(0)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="mb-1 line-clamp-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--ink)",
                  }}
                >
                  {p.name}
                </h3>

                {/* Description */}
                <p
                  className="mb-2 line-clamp-2"
                  style={{ fontSize: "11px", lineHeight: 1.4, color: "var(--muted)" }}
                >
                  {p.description}
                </p>

                {/* Categories + funded */}
                <div className="mt-auto flex items-center gap-2">
                  {p.categories.slice(0, 1).map((c) => (
                    <span key={c} className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{c}</span>
                  ))}
                  {accepted > 0 && (
                    <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-display)" }}>Funded</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Pagination (below grid) ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-6 py-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors duration-100 disabled:opacity-30"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className="h-8 w-8 text-[11px] uppercase tracking-[0.08em] transition-colors duration-100"
              style={{
                background: i === page ? "var(--ink)" : "var(--soft)",
                color: i === page ? "var(--bg)" : "var(--muted)",
                fontFamily: "var(--font-mono-display)",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors duration-100 disabled:opacity-30"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
