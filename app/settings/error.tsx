"use client";

import { useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire to Sentry / telemetry when monitoring-agent is set up
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-bold uppercase tracking-wide">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          An unexpected error occurred. Try refreshing or going back.
        </p>
        {error.digest ? (
          <p className="font-mono text-[10px] text-[var(--color-fg-subtle)]">
            Digest: {error.digest}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
