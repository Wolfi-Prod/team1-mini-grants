export const WEBHOOK_EVENT_OPTIONS = [
  "application.submitted",
  "application.status.changed",
  "review.completed",
  "disbursement.completed",
  "grant.published",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENT_OPTIONS)[number];

export interface WebhookRow {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  lastDeliveredAt: string | null;
  lastStatus: "OK" | "FAILED" | null;
  createdAt: string;
}
