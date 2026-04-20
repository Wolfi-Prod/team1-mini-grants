"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import { Table } from "@/app/_components/ui/Table";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { TemplateRow } from "./types";

interface Props {
  orgSlug: string;
  rows: TemplateRow[];
}

export function TemplatesPanel({ orgSlug, rows }: Props) {
  const router = useRouter();
  const [cloning, setCloning] = useState<TemplateRow | null>(null);

  function handleClone() {
    if (!cloning) return;
    // API: POST /api/organizations/:orgId/grant-templates/:templateId/clone
    // Server creates a new DRAFT grant copied from this template; returns the new grant.
    toast.success(`Cloned "${cloning.title}" as a new DRAFT (mock)`);
    setCloning(null);
    // In real flow we'd router.push(`/dashboard/[slug]/grants/${clonedId}/edit`).
    // Mock doesn't persist, so route back to the grants list.
    router.push(`/dashboard/${orgSlug}/grants`);
  }

  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No grants to clone yet"
          description="Ship your first grant, then return here to reuse it as a template."
        />
      </Card>
    );
  }

  return (
    <>
      <Card title={`Templates · ${rows.length}`}>
        <p className="mb-3 text-xs text-[var(--color-fg-muted)]">
          Cloning copies description, requirements, funding pool, questions, and flags. It{" "}
          <strong>does not copy</strong> title, slug, deadline, or any applications — those
          start fresh. The new grant lands as DRAFT for you to fine-tune.
        </p>
        <Table
          dense
          rows={rows}
          getRowKey={(r) => r.id}
          empty="No templates"
          columns={[
            {
              key: "title",
              header: "Grant",
              render: (row) => (
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold">{row.title}</span>
                    {row.isFlagship ? <Badge variant="inverted">FLAGSHIP</Badge> : null}
                  </div>
                  {row.requirements ? (
                    <p className="line-clamp-1 text-xs text-[var(--color-fg-muted)]">
                      {row.requirements}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <Badge>{row.status}</Badge>,
            },
            {
              key: "questions",
              header: "Qs",
              numeric: true,
              render: (row) => row.questionCount,
            },
            {
              key: "pool",
              header: "Pool",
              numeric: true,
              render: (row) => (
                <span className="whitespace-nowrap">
                  {row.currency} {(row.fundingPool ?? 0).toLocaleString()}
                </span>
              ),
            },
            {
              key: "created",
              header: "Created",
              render: (row) => (
                <span className="whitespace-nowrap text-xs text-[var(--color-fg-muted)]">
                  {new Date(row.createdAt).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "text-right",
              render: (row) => (
                <Button size="sm" variant="primary" onClick={() => setCloning(row)}>
                  Clone
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <ConfirmDialog
        open={cloning !== null}
        title="Clone as a new grant?"
        message={
          cloning ? (
            <>
              Start a new DRAFT from <strong>{cloning.title}</strong>? You&apos;ll pick a
              fresh title + slug + deadline on the next screen; everything else (
              description, requirements, {cloning.questionCount} question
              {cloning.questionCount === 1 ? "" : "s"}, funding pool) copies over.
            </>
          ) : null
        }
        confirmLabel="Clone"
        onConfirm={handleClone}
        onClose={() => setCloning(null)}
      />
    </>
  );
}
