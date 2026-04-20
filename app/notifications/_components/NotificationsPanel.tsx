"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState } from "@/app/_components/ui/EmptyState";
import type { Notification } from "@/lib/types";

type Filter = "all" | "unread" | "read";

interface Props {
  initial: Notification[];
}

export function NotificationsPanel({ initial }: Props) {
  const [items, setItems] = useState<Notification[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = items.filter((n) => !n.isRead).length;

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.isRead);
    if (filter === "read") return items.filter((n) => n.isRead);
    return items;
  }, [items, filter]);

  function markOne(id: string) {
    // API: PATCH /api/me/notifications/:id  body: { isRead: true }
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      ),
    );
  }

  function markAll() {
    if (unreadCount === 0) return;
    // API: POST /api/me/notifications/read-all
    setItems((prev) =>
      prev.map((n) =>
        n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() },
      ),
    );
    toast.success("All notifications marked read (mock)");
  }

  return (
    <Card
      title={`Notifications · ${items.length}${unreadCount > 0 ? ` · ${unreadCount} unread` : ""}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={markAll}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "unread", "read"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
            }
          >
            {f}
            {f === "unread" && unreadCount > 0 ? ` · ${unreadCount}` : ""}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={filter === "unread" ? "All caught up" : "No notifications"}
          description="You'll see status changes, deadlines, and new assignments here."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-black">
          {visible.map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-3">
              <span
                aria-hidden
                className={
                  n.isRead
                    ? "mt-1.5 h-2 w-2 shrink-0 rounded-full border border-[var(--color-border-muted)]"
                    : "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-bg-inverted)]"
                }
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold">{n.title}</span>
                  {!n.isRead ? <Badge variant="inverted">NEW</Badge> : null}
                </div>
                <p className="text-xs text-[var(--color-fg-muted)]">{n.body}</p>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {n.link ? (
                  <Link href={n.link} onClick={() => markOne(n.id)}>
                    <Button size="sm" variant="secondary">
                      Open
                    </Button>
                  </Link>
                ) : null}
                {!n.isRead ? (
                  <button
                    type="button"
                    onClick={() => markOne(n.id)}
                    className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
