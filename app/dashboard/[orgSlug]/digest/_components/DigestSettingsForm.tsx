"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Select } from "@/app/_components/ui/Select";
import { EmptyState } from "@/app/_components/ui/EmptyState";

type Cadence = "off" | "daily" | "weekly";
type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

interface Preview {
  newApplications: number;
  pendingReviews: number;
  deadlinesSoon: { id: string; title: string; deadline: string }[];
}

interface Props {
  orgName: string;
  preview: Preview;
}

export function DigestSettingsForm({ orgName, preview }: Props) {
  const [cadence, setCadence] = useState<Cadence>("weekly");
  const [day, setDay] = useState<Day>("monday");
  const [timeUtc, setTimeUtc] = useState("09:00");
  const [recipients, setRecipients] = useState("owners"); // "owners" | "all"
  const [includeNewApps, setIncludeNewApps] = useState(true);
  const [includePendingReviews, setIncludePendingReviews] = useState(true);
  const [includeDeadlines, setIncludeDeadlines] = useState(true);
  const [includeStats, setIncludeStats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // API: PUT /api/organizations/:orgId/digest/settings
    toast.success("Digest settings saved (mock)");
    setSubmitting(false);
  }

  function handleSendNow() {
    // API: POST /api/organizations/:orgId/digest/send-now
    toast.success(`Digest queued for ${orgName} (mock)`);
  }

  const disabled = cadence === "off";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card title="Cadence">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Frequency"
            value={cadence}
            onChange={(e) => setCadence(e.target.value as Cadence)}
            options={[
              { value: "off", label: "Off — no digest" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ]}
          />
          {cadence === "weekly" ? (
            <Select
              label="Day"
              value={day}
              onChange={(e) => setDay(e.target.value as Day)}
              options={[
                { value: "monday", label: "Monday" },
                { value: "tuesday", label: "Tuesday" },
                { value: "wednesday", label: "Wednesday" },
                { value: "thursday", label: "Thursday" },
                { value: "friday", label: "Friday" },
              ]}
            />
          ) : null}
          {cadence !== "off" ? (
            <Input
              label="Time (UTC)"
              type="time"
              value={timeUtc}
              onChange={(e) => setTimeUtc(e.target.value)}
            />
          ) : null}
        </div>
      </Card>

      <Card title="Recipients">
        <Select
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          options={[
            { value: "owners", label: "Owners only (recommended)" },
            { value: "all", label: "Every member of this org" },
          ]}
          disabled={disabled}
        />
        <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
          Individual users can still mute their personal digest under{" "}
          <code>/settings/notifications</code> — org-level toggle is a baseline.
        </p>
      </Card>

      <Card title="Sections">
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={includeNewApps}
              onChange={(e) => setIncludeNewApps(e.target.checked)}
              disabled={disabled}
            />
            <span>
              New applications this week (<strong>{preview.newApplications}</strong> in the
              preview window)
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={includePendingReviews}
              onChange={(e) => setIncludePendingReviews(e.target.checked)}
              disabled={disabled}
            />
            <span>
              Pending reviews (<strong>{preview.pendingReviews}</strong> currently)
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={includeDeadlines}
              onChange={(e) => setIncludeDeadlines(e.target.checked)}
              disabled={disabled}
            />
            <span>
              Grants closing within 7 days (
              <strong>{preview.deadlinesSoon.length}</strong>)
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={includeStats}
              onChange={(e) => setIncludeStats(e.target.checked)}
              disabled={disabled}
            />
            <span>Weekly stats snapshot (funnel + accept rate)</span>
          </label>
        </div>
      </Card>

      <Card title="Preview">
        {cadence === "off" ? (
          <EmptyState
            title="Digest is off"
            description="Turn it on above to see what would go out."
          />
        ) : (
          <div className="flex flex-col gap-3 border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                From
              </p>
              <p className="text-sm">Backyard &lt;digest@backyard.dev&gt;</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                Subject
              </p>
              <p className="text-sm font-semibold">
                {cadence === "weekly"
                  ? `Your ${orgName} week in grants`
                  : `Today at ${orgName}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                Body
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {includeNewApps ? (
                  <li>
                    <strong>{preview.newApplications}</strong> new application
                    {preview.newApplications === 1 ? "" : "s"}
                  </li>
                ) : null}
                {includePendingReviews ? (
                  <li>
                    <strong>{preview.pendingReviews}</strong> review
                    {preview.pendingReviews === 1 ? "" : "s"} still pending
                  </li>
                ) : null}
                {includeDeadlines && preview.deadlinesSoon.length > 0 ? (
                  <li>
                    Closing within 7 days:{" "}
                    {preview.deadlinesSoon.map((g) => g.title).join(", ")}
                  </li>
                ) : null}
                {includeStats ? (
                  <li>Weekly stats snapshot (funnel + accept rate)</li>
                ) : null}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between border-t border-[var(--color-border-muted)] pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleSendNow}
          disabled={disabled || submitting}
        >
          Send test now
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
