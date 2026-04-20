"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";

interface Props {
  token: string;
  needsLogin: boolean;
  destination: string;
}

export function InviteActions({ token, needsLogin, destination }: Props) {
  const router = useRouter();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function handleAccept() {
    if (needsLogin) {
      router.push(`/login?returnTo=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }
    setBusy(true);
    // API: POST /api/invites/:token/accept
    toast.success("Invitation accepted (mock)");
    router.push(destination);
  }

  function handleDecline() {
    setDeclineOpen(false);
    setBusy(true);
    // API: POST /api/invites/:token/decline
    toast.success("Invitation declined (mock)");
    router.push("/");
  }

  return (
    <>
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setDeclineOpen(true)}
          disabled={busy}
        >
          Decline
        </Button>
        <Button type="button" variant="primary" onClick={handleAccept} disabled={busy}>
          {needsLogin ? "Sign in to accept" : "Accept"}
        </Button>
      </div>

      <ConfirmDialog
        open={declineOpen}
        title="Decline this invitation?"
        message={
          <>
            If you decline, the sender can still send a new invitation later. You can also
            ignore the email and let it expire on its own.
          </>
        }
        confirmLabel="Decline invitation"
        destructive
        onConfirm={handleDecline}
        onClose={() => setDeclineOpen(false)}
      />
    </>
  );
}
