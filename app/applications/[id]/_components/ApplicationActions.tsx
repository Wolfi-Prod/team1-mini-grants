"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { ApplicationStatus } from "@/lib/types";

interface Props {
  applicationId: string;
  status: ApplicationStatus;
  grantId: string;
}

const CAN_WITHDRAW: ApplicationStatus[] = ["DRAFT", "SUBMITTED", "IN_REVIEW"];

export function ApplicationActions({ applicationId, status, grantId }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canWithdraw = CAN_WITHDRAW.includes(status);

  function handleWithdraw() {
    // API: PATCH /api/applications/:id  body: { status: "WITHDRAWN" }
    toast.success(`Application ${applicationId} withdrawn (mock)`);
    router.push("/applications");
  }

  if (!canWithdraw) {
    return (
      <>
        <Link href={`/applications/${applicationId}/versions`}>
          <Button size="sm" variant="secondary">
            Versions
          </Button>
        </Link>
        <Link href={`/discover/grants/${grantId}`}>
          <Button size="sm" variant="secondary">
            View grant
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href={`/applications/${applicationId}/versions`}>
        <Button size="sm" variant="secondary">
          Versions
        </Button>
      </Link>
      <Link href={`/discover/grants/${grantId}`}>
        <Button size="sm" variant="secondary">
          View grant
        </Button>
      </Link>
      <Button
        size="sm"
        variant="danger"
        onClick={() => setConfirmOpen(true)}
      >
        Withdraw
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Withdraw application?"
        message={
          <>
            Withdrawing moves this application out of review. You can reapply later,
            but the current submission will be lost.
          </>
        }
        confirmLabel="Withdraw"
        destructive
        onConfirm={handleWithdraw}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
