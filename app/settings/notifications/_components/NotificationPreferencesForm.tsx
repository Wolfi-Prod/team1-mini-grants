"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";

interface EventDef {
  id: string;
  label: string;
  description: string;
  groupLabel: "Applicant" | "Reviewer" | "Org Admin" | "Account";
}

const EVENTS: EventDef[] = [
  {
    id: "application_status_changed",
    label: "My application status changes",
    description: "Submitted → In review → Accepted / Rejected / Changes requested",
    groupLabel: "Applicant",
  },
  {
    id: "grant_deadline_soon",
    label: "Grant deadlines I'm watching",
    description: "48h before a grant with a draft application closes",
    groupLabel: "Applicant",
  },
  {
    id: "funding_disbursed",
    label: "Funding disbursed",
    description: "A milestone payment was recorded against one of my applications",
    groupLabel: "Applicant",
  },
  {
    id: "reviewer_assigned",
    label: "Review assignments",
    description: "Someone assigned me to a new application",
    groupLabel: "Reviewer",
  },
  {
    id: "reviewer_due_soon",
    label: "Review due soon",
    description: "A review I'm assigned to is due within 48h",
    groupLabel: "Reviewer",
  },
  {
    id: "application_submitted",
    label: "New applications on our grants",
    description: "Someone submitted an application to a grant I admin",
    groupLabel: "Org Admin",
  },
  {
    id: "review_completed",
    label: "Reviewer completed a review",
    description: "A reviewer on one of my grants submitted their review",
    groupLabel: "Org Admin",
  },
  {
    id: "invitation_received",
    label: "I received an invitation",
    description: "Someone invited me to an org or to review a grant",
    groupLabel: "Account",
  },
];

const GROUP_ORDER: EventDef["groupLabel"][] = [
  "Applicant",
  "Reviewer",
  "Org Admin",
  "Account",
];

type Prefs = Record<string, { email: boolean; inApp: boolean }>;

function defaults(): Prefs {
  // Email on by default for the most consequential events; in-app always on by default.
  const EMAIL_ON_BY_DEFAULT = new Set([
    "application_status_changed",
    "reviewer_assigned",
    "invitation_received",
    "funding_disbursed",
  ]);
  const prefs: Prefs = {};
  for (const e of EVENTS) {
    prefs[e.id] = { email: EMAIL_ON_BY_DEFAULT.has(e.id), inApp: true };
  }
  return prefs;
}

export function NotificationPreferencesForm() {
  const [prefs, setPrefs] = useState<Prefs>(defaults());
  const [submitting, setSubmitting] = useState(false);

  function toggle(id: string, channel: "email" | "inApp") {
    setPrefs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [channel]: !prev[id][channel] },
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // API: PUT /api/me/notification-preferences  body: { preferences: Prefs }
    toast.success("Notification preferences saved (mock)");
    setSubmitting(false);
  }

  function mute(channel: "email" | "inApp") {
    setPrefs((prev) => {
      const next: Prefs = {};
      for (const [id, p] of Object.entries(prev)) next[id] = { ...p, [channel]: false };
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card
        title="Channels"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => mute("email")}
            >
              Mute email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => mute("inApp")}
            >
              Mute in-app
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[var(--color-fg-muted)]">
          In-app notifications always appear at <code>/notifications</code>. Email delivers
          to the address on your account. Toggle what you want per channel per event.
        </p>
      </Card>

      {GROUP_ORDER.map((group) => {
        const groupEvents = EVENTS.filter((e) => e.groupLabel === group);
        if (groupEvents.length === 0) return null;
        return (
          <Card key={group} title={group}>
            <div className="flex flex-col divide-y divide-black">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                <span>Event</span>
                <span>Email</span>
                <span>In-app</span>
              </div>
              {groupEvents.map((e) => (
                <div
                  key={e.id}
                  className="grid grid-cols-[1fr_auto_auto] items-start gap-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{e.label}</span>
                    <span className="text-xs text-[var(--color-fg-muted)]">{e.description}</span>
                  </div>
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={prefs[e.id].email}
                      onChange={() => toggle(e.id, "email")}
                      aria-label={`Email me when ${e.label.toLowerCase()}`}
                    />
                  </label>
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={prefs[e.id].inApp}
                      onChange={() => toggle(e.id, "inApp")}
                      aria-label={`Show in-app when ${e.label.toLowerCase()}`}
                    />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <div className="flex items-center justify-end border-t border-[var(--color-border-muted)] pt-4">
        <Button type="submit" variant="primary" disabled={submitting}>
          Save preferences
        </Button>
      </div>
    </form>
  );
}
