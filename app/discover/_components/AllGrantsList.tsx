"use client";

import { useMemo, useState } from "react";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Button } from "@/app/_components/ui/Button";
import { Badge } from "@/app/_components/ui/Badge";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { GrantRowCard } from "./GrantRowCard";
import type { Grant, GrantStatus, Organization } from "@/lib/types";

interface Props {
  grants: Grant[];
  orgs: Organization[];
  categories: string[];
}

type DeadlineBucket = "any" | "7" | "30" | "90";

interface Filters {
  search: string;
  minFunding: number;
  maxFunding: number;
  deadline: DeadlineBucket;
  status: GrantStatus | "ALL";
  categories: string[];
  orgId: string | "ALL";
}

const DEFAULTS: Filters = {
  search: "",
  minFunding: 0,
  maxFunding: 10_000_000,
  deadline: "any",
  status: "OPEN",
  categories: [],
  orgId: "ALL",
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function AllGrantsList({ grants, orgs, categories }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return grants.filter((g) => {
      if (filters.status !== "ALL" && g.status !== filters.status) return false;
      if (filters.orgId !== "ALL" && g.organizationId !== filters.orgId) return false;
      if (filters.minFunding > 0 && (g.fundingPool ?? 0) < filters.minFunding) return false;
      if (filters.maxFunding > 0 && (g.fundingPool ?? 0) > filters.maxFunding) return false;
      if (filters.deadline !== "any") {
        const d = daysUntil(g.deadline);
        const max = Number(filters.deadline);
        if (d === null || d < 0 || d > max) return false;
      }
      if (q) {
        const hay = `${g.title} ${g.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [grants, filters]);

  const orgById = useMemo(
    () => Object.fromEntries(orgs.map((o) => [o.id, o])),
    [orgs],
  );

  const hasFilters =
    filters.search !== "" ||
    filters.minFunding !== DEFAULTS.minFunding ||
    filters.maxFunding !== DEFAULTS.maxFunding ||
    filters.deadline !== DEFAULTS.deadline ||
    filters.status !== DEFAULTS.status ||
    filters.orgId !== DEFAULTS.orgId ||
    filters.categories.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 border border-[var(--color-border-muted)] p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Search"
            placeholder="Title or description"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))
            }
            options={[
              { value: "OPEN", label: "Open" },
              { value: "CLOSED", label: "Closed" },
              { value: "ARCHIVED", label: "Archived" },
              { value: "ALL", label: "All statuses" },
            ]}
          />
          <Select
            label="Time left"
            value={filters.deadline}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                deadline: e.target.value as DeadlineBucket,
              }))
            }
            options={[
              { value: "any", label: "Any deadline" },
              { value: "7", label: "Closing in 7 days" },
              { value: "30", label: "Closing in 30 days" },
              { value: "90", label: "Closing in 90 days" },
            ]}
          />
          <Select
            label="Organization"
            value={filters.orgId}
            onChange={(e) => setFilters((f) => ({ ...f, orgId: e.target.value }))}
            options={[
              { value: "ALL", label: "All organizations" },
              ...orgs.map((o) => ({ value: o.id, label: o.name })),
            ]}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Min funding (USD)"
            type="number"
            min={0}
            value={filters.minFunding}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                minFunding: Number(e.target.value) || 0,
              }))
            }
          />
          <Input
            label="Max funding (USD)"
            type="number"
            min={0}
            value={filters.maxFunding}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                maxFunding: Number(e.target.value) || 0,
              }))
            }
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
          title="No grants match your filters"
          description="Try widening the funding range, clearing categories, or resetting the deadline filter."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <GrantRowCard key={g.id} grant={g} org={orgById[g.organizationId]} />
          ))}
        </div>
      )}

      {/* category-filter chip tag in filters above is currently visual only because grant categories are not a schema field yet */}
      {filters.categories.length > 0 ? (
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          <Badge variant="outline">Note</Badge>
          <span>
            Category filter is placeholder — grants need a <code>categories</code> column on the
            backend (see docs/api/API_TO_BUILD.md).
          </span>
        </div>
      ) : null}
    </div>
  );
}
