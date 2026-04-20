"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Grant, Organization } from "@/lib/types";

interface Props {
  grants: Grant[];
  orgs: Organization[];
}

type SortKey = "az" | "za" | "newest" | "deadline";

interface Filters {
  search: string;
  status: string;
  sort: SortKey;
}

const DEFAULTS: Filters = { search: "", status: "ALL", sort: "az" };
const COLS = 3;
const ROWS = 2;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function GrantsGrid({ grants, orgs }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const orgById = useMemo(
    () => Object.fromEntries(orgs.map((o) => [o.id, o])),
    [orgs],
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = grants.filter((g) => {
      if (filters.status !== "ALL" && g.status !== filters.status) return false;
      if (q) {
        const hay = `${g.title} ${g.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (filters.sort) {
        case "az": return a.title.localeCompare(b.title);
        case "za": return b.title.localeCompare(a.title);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "deadline": {
          const da = daysUntil(a.deadline) ?? 9999;
          const db = daysUntil(b.deadline) ?? 9999;
          return da - db;
        }
      }
    });
    return list;
  }, [grants, filters]);

  const perPage = COLS * ROWS;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageGrants = filtered.slice(page * perPage, (page + 1) * perPage);

  const hasFilters = filters.search !== "" || filters.status !== "ALL";

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ── Search + filter bar ── */}
      <div className="px-6 md:px-8">
        <div className="flex items-center gap-3 py-3">
          <input
            type="text"
            placeholder="Search grants..."
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
            Filters
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setFilters(DEFAULTS); setPage(0); }}
              className="text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
            >
              Clear
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="pb-4">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Status</span>
                <div className="flex flex-col gap-1">
                  {[{ value: "ALL", label: "All" }, { value: "OPEN", label: "Open" }, { value: "CLOSED", label: "Closed" }].map((s) => (
                    <label key={s.value} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="status" checked={filters.status === s.value} onChange={() => { setFilters((f) => ({ ...f, status: s.value })); setPage(0); }} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>Sort</span>
                <div className="flex flex-col gap-1">
                  {[{ value: "az", label: "A → Z" }, { value: "za", label: "Z → A" }, { value: "newest", label: "Newest" }, { value: "deadline", label: "Deadline" }].map((s) => (
                    <label key={s.value} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="sort" checked={filters.sort === s.value} onChange={() => { setFilters((f) => ({ ...f, sort: s.value as SortKey })); setPage(0); }} className="h-3 w-3 accent-[var(--line)]" />
                      <span className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid (3 cols) ── */}
      {pageGrants.length === 0 ? (
        <div className="flex items-center justify-center px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
            No grants match your filters
          </p>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--line)",
            padding: "1px 0",
          }}
        >
          {pageGrants.map((g) => {
            const org = orgById[g.organizationId];
            const days = daysUntil(g.deadline);
            return (
              <Link
                key={g.id}
                href={`/discover/grants/${g.id}`}
                className="flex flex-col p-5 transition-colors duration-150"
                style={{ background: "var(--bg)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--soft)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg)"; }}
              >
                {/* Image placeholder */}
                <div
                  className="mb-4 flex aspect-[4/3] w-full items-center justify-center border"
                  style={{ borderColor: "var(--line)", background: "var(--soft)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(24px, 3vw, 40px)",
                      fontWeight: 400,
                      color: "var(--muted)",
                    }}
                  >
                    {g.title}
                  </span>
                </div>

                {/* Status + funding */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="text-[8px] uppercase tracking-[0.14em]"
                    style={{
                      color: g.status === "OPEN" ? "var(--accent)" : "var(--muted)",
                      fontFamily: "var(--font-mono-display)",
                    }}
                  >
                    {g.status}
                  </span>
                  {g.fundingPool !== null && (
                    <span
                      className="text-[8px] uppercase tracking-[0.14em]"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
                    >
                      ${g.fundingPool.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  className="mb-1 line-clamp-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--ink)",
                  }}
                >
                  {g.title}
                </h3>

                {/* Description */}
                <p
                  className="mb-3 line-clamp-2"
                  style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--muted)" }}
                >
                  {g.description}
                </p>

                {/* Org + deadline */}
                <div className="mt-auto flex items-center justify-between gap-2">
                  {org && (
                    <span className="text-[8px] uppercase tracking-[0.14em]" style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}>
                      {org.name}
                    </span>
                  )}
                  {days !== null && (
                    <span
                      className="text-[8px] uppercase tracking-[0.14em]"
                      style={{
                        color: days > 0 ? "var(--muted)" : "var(--accent)",
                        fontFamily: "var(--font-mono-display)",
                      }}
                    >
                      {days > 0 ? `${days}d left` : "Closed"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-6 py-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] disabled:opacity-30"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className="h-8 w-8 text-[11px] uppercase tracking-[0.08em]"
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
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] disabled:opacity-30"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
