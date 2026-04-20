"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Competition, Organization } from "@/lib/types";

interface ChallengeItem extends Competition {
  org?: Organization;
  teamCount: number;
  timing: string;
}

interface Props {
  challenges: ChallengeItem[];
}

type SortKey = "az" | "za" | "newest" | "pool";
type StatusFilter = "ALL" | "OPEN" | "UPCOMING" | "CLOSED";

export function ChallengeListDetail({ challenges }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("az");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = challenges.filter((c) => {
      if (status !== "ALL" && c.status !== status) return false;
      if (q && !`${c.title} ${c.description}`.toLowerCase().includes(q)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "az": return a.title.localeCompare(b.title);
        case "za": return b.title.localeCompare(a.title);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "pool": return (b.totalPool ?? 0) - (a.totalPool ?? 0);
      }
    });
    return list;
  }, [challenges, search, status, sort]);

  const active = filtered[selected] ?? filtered[0];
  const hasFilters = search !== "" || status !== "ALL";

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── Search + filter bar ── */}
      <div className="px-6 md:px-8">
        <div className="flex items-center gap-3 py-3">
          <input
            type="text"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(0); }}
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
            Filters
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(""); setStatus("ALL"); setSort("az"); setSelected(0); }}
              className="text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="pb-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Status */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Status</span>
                <div className="flex flex-col gap-1">
                  {(["ALL", "OPEN", "UPCOMING", "CLOSED"] as const).map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="status" checked={status === s} onChange={() => { setStatus(s); setSelected(0); }} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Sort</span>
                <div className="flex flex-col gap-1">
                  {([{ value: "az", label: "A → Z" }, { value: "za", label: "Z → A" }, { value: "newest", label: "Newest" }, { value: "pool", label: "Prize pool" }] as const).map((s) => (
                    <label key={s.value} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="sort" checked={sort === s.value} onChange={() => { setSort(s.value); setSelected(0); }} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── List (left, scrollable) + Detail (right) ── */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(280px, 1fr) 2fr",
          borderTop: "1px solid var(--line)",
          height: "calc(100vh - var(--nav-h) - 200px)",
          minHeight: "400px",
        }}
      >
        {/* Left: scrollable challenge list */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ borderRight: "1px solid var(--line)" }}
        >
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center p-6">
              <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                No challenges found
              </span>
            </div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(i)}
                className="flex flex-col gap-1 p-4 text-left transition-colors duration-100"
                style={{
                  background: i === selected ? "var(--soft)" : "var(--bg)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <h3
                  className="line-clamp-1"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "15px",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--ink)",
                  }}
                >
                  {c.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-display)" }}>
                    {c.status}
                  </span>
                  {c.totalPool !== null && (
                    <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                      ${c.totalPool.toLocaleString()}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right: detail panel (scrollable) */}
        <div className="flex flex-col overflow-y-auto p-6 md:p-8">
          {active ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-display)" }}>
                  {active.status}
                </span>
                {active.totalPool !== null && (
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                    ${active.totalPool.toLocaleString()} {active.currency}
                  </span>
                )}
              </div>

              <h2
                className="mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  color: "var(--ink)",
                }}
              >
                {active.title}
              </h2>

              {active.org && (
                <span className="mb-4 text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                  by {active.org.name}
                </span>
              )}

              <p className="mb-6 max-w-xl" style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--muted)" }}>
                {active.description}
              </p>

              {active.rules && (
                <div className="mb-6">
                  <span className="mb-2 block text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                    Rules
                  </span>
                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--muted)" }}>
                    {active.rules}
                  </p>
                </div>
              )}

              <div className="mb-6 flex flex-wrap gap-6 border-t pt-4" style={{ borderColor: "var(--line)" }}>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Teams</span>
                  <span className="text-sm" style={{ color: "var(--ink)", fontFamily: "var(--font-mono-display)" }}>{active.teamCount}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Team size</span>
                  <span className="text-sm" style={{ color: "var(--ink)", fontFamily: "var(--font-mono-display)" }}>{active.minTeamSize}–{active.maxTeamSize}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Timing</span>
                  <span className="text-sm" style={{ color: "var(--ink)", fontFamily: "var(--font-mono-display)" }}>{active.timing}</span>
                </div>
              </div>

              <div className="mt-auto">
                <Link href={`/challenges/${active.id}`} className="btn btn--primary">
                  View challenge
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                Select a challenge
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
