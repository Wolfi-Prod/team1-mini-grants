"use client";

import { useMemo, useState } from "react";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Button } from "@/app/_components/ui/Button";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { ProjectRowCard } from "./ProjectRowCard";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
  categories: string[];
  acceptedCountByProject: Record<string, number>;
}

type SortKey = "az" | "za" | "newest" | "oldest";
type FundedFilter = "any" | "yes" | "no";

interface Filters {
  search: string;
  categories: string[];
  funded: FundedFilter;
  sort: SortKey;
}

const DEFAULTS: Filters = {
  search: "",
  categories: [],
  funded: "any",
  sort: "az",
};

export function AllProjectsList({
  projects,
  categories,
  acceptedCountByProject,
}: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.categories.length > 0) {
        const hit = filters.categories.some((c) => p.categories.includes(c));
        if (!hit) return false;
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
        case "az":
          return a.name.localeCompare(b.name);
        case "za":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });

    return list;
  }, [projects, filters, acceptedCountByProject]);

  const hasFilters =
    filters.search !== "" ||
    filters.categories.length > 0 ||
    filters.funded !== DEFAULTS.funded ||
    filters.sort !== DEFAULTS.sort;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 border border-[var(--color-border-muted)] p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Name or description"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <Select
            label="Funding status"
            value={filters.funded}
            onChange={(e) =>
              setFilters((f) => ({ ...f, funded: e.target.value as FundedFilter }))
            }
            options={[
              { value: "any", label: "Any" },
              { value: "yes", label: "Accepted for funding" },
              { value: "no", label: "Not yet funded" },
            ]}
          />
          <Select
            label="Sort"
            value={filters.sort}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))
            }
            options={[
              { value: "az", label: "A → Z" },
              { value: "za", label: "Z → A" },
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide">Categories</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = filters.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        categories: active
                          ? f.categories.filter((x) => x !== c)
                          : [...f.categories, c],
                      }))
                    }
                    className={
                      active
                        ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                        : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border-muted)] pt-3">
          <span className="text-xs">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            {hasFilters ? " (filtered)" : ""}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters(DEFAULTS)}
            disabled={!hasFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects match your filters"
          description="Try clearing the search, categories, or funding filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectRowCard
              key={p.id}
              project={p}
              acceptedCount={acceptedCountByProject[p.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
