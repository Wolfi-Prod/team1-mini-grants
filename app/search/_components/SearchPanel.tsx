"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Input } from "@/app/_components/ui/Input";
import type { Scope, SearchCorpus } from "./types";

interface Props {
  corpus: SearchCorpus;
  initialQuery: string;
  initialScope: Scope;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "projects", label: "Projects" },
  { value: "grants", label: "Grants" },
  { value: "applications", label: "Applications" },
  { value: "users", label: "Users" },
  { value: "orgs", label: "Orgs" },
];

function includesIC(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q);
}

export function SearchPanel({ corpus, initialQuery, initialScope }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<Scope>(initialScope);

  const q = query.trim().toLowerCase();
  const hasQuery = q.length >= 2;

  const results = useMemo(() => {
    if (!hasQuery) {
      return { projects: [], grants: [], applications: [], users: [], orgs: [] };
    }
    return {
      projects:
        scope === "all" || scope === "projects"
          ? corpus.projects.filter(
              (p) =>
                includesIC(p.name, q) ||
                includesIC(p.description, q) ||
                p.categories.some((c) => includesIC(c, q)),
            )
          : [],
      grants:
        scope === "all" || scope === "grants"
          ? corpus.grants.filter(
              (g) => includesIC(g.title, q) || includesIC(g.description, q),
            )
          : [],
      applications:
        scope === "all" || scope === "applications"
          ? corpus.applications.filter(
              (a) =>
                includesIC(a.coverNote, q) ||
                includesIC(a.projectId, q) ||
                includesIC(a.grantId, q) ||
                includesIC(a.id, q),
            )
          : [],
      users:
        scope === "all" || scope === "users"
          ? corpus.users.filter(
              (u) =>
                includesIC(u.name, q) ||
                includesIC(u.handle, q) ||
                includesIC(u.email, q) ||
                includesIC(u.bio, q),
            )
          : [],
      orgs:
        scope === "all" || scope === "orgs"
          ? corpus.orgs.filter(
              (o) =>
                includesIC(o.name, q) ||
                includesIC(o.slug, q) ||
                includesIC(o.description, q),
            )
          : [],
    };
  }, [corpus, hasQuery, q, scope]);

  const total =
    results.projects.length +
    results.grants.length +
    results.applications.length +
    results.users.length +
    results.orgs.length;

  // Keep the URL in sync so shareable links work: `/search?q=avaswap&scope=projects`
  function syncUrl(next: { q?: string; scope?: Scope }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.scope !== undefined) {
      if (next.scope && next.scope !== "all") sp.set("scope", next.scope);
      else sp.delete("scope");
    }
    router.replace(`/search${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  function handleQueryChange(v: string) {
    setQuery(v);
    syncUrl({ q: v });
  }

  function handleScopeChange(s: Scope) {
    setScope(s);
    syncUrl({ scope: s });
  }

  return (
    <>
      <Card title="Query">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search projects, grants, applications, users, orgs…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={scope === s.value}
                onClick={() => handleScopeChange(s.value)}
                className={
                  scope === s.value
                    ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                    : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {!hasQuery ? (
        <Card>
          <EmptyState
            title="Start typing to search"
            description="At least 2 characters. Results narrow as you type. Share a URL with ?q= to open a pre-filled search."
          />
        </Card>
      ) : total === 0 ? (
        <Card>
          <EmptyState
            title="No matches"
            description="Nothing in the corpus matches — try a different scope or shorten the query."
          />
        </Card>
      ) : (
        <>
          <p className="text-xs uppercase tracking-widest text-[var(--color-fg-muted)]">
            {total} result{total === 1 ? "" : "s"}
          </p>

          {results.projects.length > 0 ? (
            <Card title={`Projects · ${results.projects.length}`}>
              <ul className="flex flex-col divide-y divide-black">
                {results.projects.map((p) => (
                  <li key={p.id} className="flex flex-col gap-0.5 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/discover/projects/${p.id}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {p.name}
                      </Link>
                      <Badge>{p.visibility}</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-fg-muted)]">{p.description}</p>
                    {p.categories.length > 0 ? (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                        {p.categories.join(" · ")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {results.grants.length > 0 ? (
            <Card title={`Grants · ${results.grants.length}`}>
              <ul className="flex flex-col divide-y divide-black">
                {results.grants.map((g) => (
                  <li key={g.id} className="flex flex-col gap-0.5 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/discover/grants/${g.id}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {g.title}
                      </Link>
                      <Badge variant={g.status === "OPEN" ? "inverted" : "default"}>
                        {g.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--color-fg-muted)]">{g.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {results.applications.length > 0 ? (
            <Card title={`Applications · ${results.applications.length}`}>
              <ul className="flex flex-col divide-y divide-black">
                {results.applications.map((a) => (
                  <li key={a.id} className="flex flex-col gap-0.5 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/applications/${a.id}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {a.id}
                      </Link>
                      <Badge>{a.status.replace("_", " ")}</Badge>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      project: {a.projectId} · grant: {a.grantId}
                    </span>
                    {a.coverNote ? (
                      <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2">{a.coverNote}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {results.users.length > 0 ? (
            <Card title={`Users · ${results.users.length}`}>
              <ul className="flex flex-col divide-y divide-black">
                {results.users.map((u) => (
                  <li key={u.id} className="flex flex-col gap-0.5 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/u/${u.handle}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {u.name}
                      </Link>
                      <Badge>@{u.handle}</Badge>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      {u.email}
                    </span>
                    {u.bio ? (
                      <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2">{u.bio}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {results.orgs.length > 0 ? (
            <Card title={`Organizations · ${results.orgs.length}`}>
              <ul className="flex flex-col divide-y divide-black">
                {results.orgs.map((o) => (
                  <li key={o.id} className="flex flex-col gap-0.5 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/${o.slug}`}
                        className="text-sm font-bold underline underline-offset-2"
                      >
                        {o.name}
                      </Link>
                      <Badge>/{o.slug}</Badge>
                    </div>
                    {o.description ? (
                      <p className="text-xs text-[var(--color-fg-muted)]">{o.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      )}
    </>
  );
}
