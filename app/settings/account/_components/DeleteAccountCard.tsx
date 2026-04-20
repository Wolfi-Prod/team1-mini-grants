"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import { Input } from "@/app/_components/ui/Input";

interface Props {
  userName: string;
  projectCount: number;
  liveApplicationCount: number;
}

export function DeleteAccountCard({
  userName,
  projectCount,
  liveApplicationCount,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const blocked = liveApplicationCount > 0;
  const typedValid = typed === "DELETE";

  function handleDelete() {
    // API: DELETE /api/me
    // Server scrubs PII, soft-deletes user (sets deletedAt). Blocks if liveApplicationCount>0
    // with error code "HAS_LIVE_APPLICATIONS". Frontend pre-checks so the API rejection is
    // a fallback.
    toast.success("Account deletion queued (mock)");
    router.push("/");
  }

  return (
    <Card title="Danger zone">
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Deleting your account scrubs personal info (name, telegram, wallet, bio) and
          soft-deletes your user record. Projects you own get hidden from public pages but
          are preserved so existing applications and disbursements stay auditable.
        </p>

        <ul className="list-disc pl-5 text-xs text-[var(--color-fg-muted)]">
          <li>
            You own <strong>{projectCount}</strong> project
            {projectCount === 1 ? "" : "s"}.
          </li>
          <li>
            <strong>{liveApplicationCount}</strong> of your application
            {liveApplicationCount === 1 ? "" : "s"} {liveApplicationCount === 1 ? "is" : "are"}{" "}
            still live (not withdrawn or rejected).
          </li>
        </ul>

        {blocked ? (
          <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
            <strong>Deletion is blocked</strong> while you have live applications. Withdraw
            or wait for a decision on each one, then come back here.
          </p>
        ) : null}

        <div className="flex items-center justify-end border-t border-[var(--color-border-muted)] pt-3">
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmOpen(true)}
            disabled={blocked}
          >
            Delete my account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete account?"
        message={
          <div className="flex flex-col gap-2">
            <p>
              This deletes <strong>{userName}</strong>. Final step — type{" "}
              <code>DELETE</code> to confirm.
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              aria-label="Type DELETE to confirm"
            />
          </div>
        }
        confirmLabel="Delete account"
        destructive
        onConfirm={() => {
          if (!typedValid) return;
          setConfirmOpen(false);
          handleDelete();
        }}
        onClose={() => {
          setConfirmOpen(false);
          setTyped("");
        }}
      />
    </Card>
  );
}
