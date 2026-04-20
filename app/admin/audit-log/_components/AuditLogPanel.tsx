"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { Table } from "@/app/_components/ui/Table";
import type { AuditLogRow } from "./types";

interface Props {
  initialRows: AuditLogRow[];
}

export function AuditLogPanel({ initialRows }: Props) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of initialRows) set.add(r.entry.action);
    return [...set].sort();
  }, [initialRows]);

  const resourceOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of initialRows) set.add(r.entry.resourceType);
    return [...set].sort();
  }, [initialRows]);

  const actorOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of initialRows) {
      if (r.actor) map.set(r.actor.id, r.actor.name);
    }
    return [...map.entries()]
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [initialRows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    // Push to end of day for inclusive `to` filtering.
    const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

    return initialRows.filter((r) => {
      if (actionFilter && r.entry.action !== actionFilter) return false;
      if (resourceFilter && r.entry.resourceType !== resourceFilter) return false;
      if (actorFilter && r.entry.actorId !== actorFilter) return false;
      const ts = new Date(r.entry.createdAt).getTime();
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      if (q) {
        const haystack = `${r.entry.action} ${r.entry.resourceType} ${r.entry.resourceId} ${JSON.stringify(r.entry.metadata ?? {})} ${r.actor?.name ?? ""} ${r.actor?.handle ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [initialRows, search, actionFilter, resourceFilter, actorFilter, fromDate, toDate]);

  function clearFilters() {
    setSearch("");
    setActionFilter("");
    setResourceFilter("");
    setActorFilter("");
    setFromDate("");
    setToDate("");
  }

  function handleExport() {
    // API: GET /api/admin/audit-log.csv  (server streams CSV with current filters)
    toast.success(`Exporting ${visible.length} entries (mock)`);
  }

  const anyFilterActive =
    !!search || !!actionFilter || !!resourceFilter || !!actorFilter || !!fromDate || !!toDate;

  return (
    <>
      <Card
        title={`Filters${anyFilterActive ? " · active" : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={clearFilters}
              disabled={!anyFilterActive}
            >
              Clear
            </Button>
            <Button size="sm" variant="primary" onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Search"
            placeholder="Action, resource id, metadata, actor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={[
              { value: "", label: "All actions" },
              ...actionOptions.map((a) => ({ value: a, label: a })),
            ]}
          />
          <Select
            label="Resource type"
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            options={[
              { value: "", label: "All resources" },
              ...resourceOptions.map((r) => ({ value: r, label: r })),
            ]}
          />
          <Select
            label="Actor"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            options={[
              { value: "", label: "All actors" },
              ...actorOptions,
            ]}
          />
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </Card>

      <Card title={`${visible.length} entr${visible.length === 1 ? "y" : "ies"} · newest first`}>
        <div className="max-h-[70vh] overflow-y-auto">
          <Table
            dense
            sticky
            rows={visible}
            getRowKey={(r) => r.entry.id}
            empty="No matching entries — clear a filter or widen the date range"
            columns={[
              {
                key: "action",
                header: "Action",
                render: (r) => (
                  <Badge variant="inverted">{r.entry.action}</Badge>
                ),
              },
              {
                key: "resource",
                header: "Resource",
                render: (r) => (
                  <span className="break-all font-mono text-xs">
                    {r.entry.resourceType}/{r.entry.resourceId}
                  </span>
                ),
              },
              {
                key: "actor",
                header: "Actor",
                render: (r) =>
                  r.actor ? (
                    <Link
                      href={`/u/${r.actor.handle}`}
                      className="whitespace-nowrap underline underline-offset-2"
                    >
                      {r.actor.name}
                    </Link>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                      deleted
                    </span>
                  ),
              },
              {
                key: "when",
                header: "When",
                render: (r) => (
                  <span className="whitespace-nowrap text-xs">
                    {new Date(r.entry.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                key: "ip",
                header: "IP",
                render: (r) =>
                  r.entry.ipAddress ? (
                    <span className="font-mono text-[11px] text-[var(--color-fg-muted)]">
                      {r.entry.ipAddress}
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                      —
                    </span>
                  ),
              },
              {
                key: "metadata",
                header: "Metadata",
                render: (r) =>
                  r.entry.metadata && Object.keys(r.entry.metadata).length > 0 ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-semibold uppercase tracking-widest">
                        View
                      </summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-2 font-mono text-[11px] leading-relaxed">
{JSON.stringify(r.entry.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-subtle)]">
                      —
                    </span>
                  ),
              },
            ]}
          />
        </div>
      </Card>
    </>
  );
}
