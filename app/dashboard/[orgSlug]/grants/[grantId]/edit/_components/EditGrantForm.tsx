"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Select } from "@/app/_components/ui/Select";
import type { Grant, GrantStatus } from "@/lib/types";

interface Props {
  orgSlug: string;
  grant: Grant;
}

const STATUS_OPTIONS: { value: GrantStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft — not visible to applicants" },
  { value: "OPEN", label: "Open — accepting applications" },
  { value: "CLOSED", label: "Closed — not accepting new applications" },
  { value: "ARCHIVED", label: "Archived — hidden from org dashboards" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "USDC", label: "USDC" },
  { value: "AVAX", label: "AVAX" },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Format an ISO date into the yyyy-mm-dd string an <input type="date"> expects.
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

export function EditGrantForm({ orgSlug, grant }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(grant.title);
  const [slug, setSlug] = useState(grant.slug);
  const [slugTouched, setSlugTouched] = useState(true);
  const [description, setDescription] = useState(grant.description);
  const [requirements, setRequirements] = useState(grant.requirements ?? "");
  const [fundingPool, setFundingPool] = useState(
    grant.fundingPool !== null ? String(grant.fundingPool) : "",
  );
  const [currency, setCurrency] = useState(grant.currency);
  const [deadline, setDeadline] = useState(toDateInput(grant.deadline));
  const [status, setStatus] = useState<GrantStatus>(grant.status);
  const [isPublic, setIsPublic] = useState(grant.isPublic);
  const [isFlagship, setIsFlagship] = useState(grant.isFlagship);
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const poolNumber = fundingPool.trim() === "" ? null : Number(fundingPool);
  const poolValid = poolNumber === null || (Number.isFinite(poolNumber) && poolNumber >= 0);
  const slugValid = slug.trim().length > 0 && /^[a-z0-9-]+$/.test(slug);
  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    slugValid &&
    poolValid;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: PATCH /api/organizations/:orgId/grants/:grantId
    // body: partial grant fields (title, slug, description, requirements, fundingPool,
    //       currency, deadline, status, isPublic, isFlagship)
    toast.success(`Saved "${title.trim()}" (mock).`);
    router.push(`/dashboard/${orgSlug}/grants/${grant.id}`);
  }

  function handleArchive() {
    // API: PATCH /api/organizations/:orgId/grants/:grantId  body: { status: "ARCHIVED" }
    toast.success(`Archived "${grant.title}" (mock)`);
    router.push(`/dashboard/${orgSlug}/grants`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card title="Grant details">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            hint="Lowercase letters, numbers, and dashes only."
            error={!slugValid ? "Invalid slug format" : undefined}
            required
          />
          <Textarea
            label="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Textarea
            label="Requirements"
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            hint="Optional — eligibility, deliverables, fit criteria."
          />
        </div>
      </Card>

      <Card title="Funding">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Funding pool"
            type="number"
            min={0}
            value={fundingPool}
            onChange={(e) => setFundingPool(e.target.value)}
            hint="Total funding available. Leave blank for unspecified."
            error={!poolValid ? "Enter a non-negative number" : undefined}
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={CURRENCY_OPTIONS}
          />
        </div>
      </Card>

      <Card title="Timing + visibility">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              hint="Leave blank for rolling acceptance."
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as GrantStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>
              <span className="font-semibold">Public.</span> Visible on `/discover` and
              accepts applications from non-members.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={isFlagship}
              onChange={(e) => setIsFlagship(e.target.checked)}
            />
            <span>
              <span className="font-semibold">Flagship.</span> Promotes this grant to the
              top of Discover and the landing page hero.
            </span>
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-muted)] pt-4">
        {status !== "ARCHIVED" ? (
          <Button type="button" variant="danger" onClick={handleArchive}>
            Archive grant
          </Button>
        ) : (
          <span className="text-xs uppercase tracking-widest text-[var(--color-fg-muted)]">
            Archived · Edit status above to restore
          </span>
        )}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/dashboard/${orgSlug}/grants/${grant.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!valid || submitting}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
