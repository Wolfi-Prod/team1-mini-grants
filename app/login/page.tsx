"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { useMockAuth } from "@/lib/auth/useMockAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { resolvePostLoginTarget } from "@/lib/auth/returnTo";

export default function LoginPage() {
  // useSearchParams forces client-side bailout — Next 15 requires Suspense around it
  // so the static prerender doesn't fail at build time.
  return (
    <Suspense fallback={null}>
      <LoginCard />
    </Suspense>
  );
}

function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const setRole = useMockAuth((s) => s.setRole);
  // Snapshot the role only once at mount. Reacting to role changes would race with the
  // push() in the click handler.
  const [initialRole] = useState(() => useMockAuth.getState().currentRole);

  // Compute where to send the user after signing in (or bouncing off /login because
  // they're already signed in). Priority:
  //   1. explicit ?returnTo=... passed when a protected page redirected here
  //   2. document.referrer — the page they were on before clicking Log in, if same-origin
  //      and not /login itself
  //   3. fallback (caller-specified)
  function postLoginDestination(fallback: string): string {
    if (returnTo) return resolvePostLoginTarget(returnTo, fallback);
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const url = new URL(document.referrer);
        if (
          url.origin === window.location.origin &&
          !url.pathname.startsWith("/login")
        ) {
          return url.pathname + url.search;
        }
      } catch {
        // malformed referrer — fall through
      }
    }
    return fallback;
  }

  useEffect(() => {
    if (!isAuthenticated(initialRole)) return;
    // Already signed in — bounce away. Fallback here is "/" (visitor landing).
    router.replace(postLoginDestination("/"));
    // postLoginDestination closes over returnTo; effect reruns when that changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRole, router, returnTo]);

  function handleBuilderHubLogin() {
    // API: GET /api/auth/builderhub/start → returns { redirectUrl } to BuilderHub SSO
    // API: GET /api/auth/builderhub/callback?code&state → creates session cookie, redirects
    setRole("applicant");
    toast.success("Signed in as Alice Applicant (mock)");
    // Same priority as the already-authed effect: returnTo → referrer → /projects default.
    router.push(postLoginDestination("/projects"));
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-4">
        <MockApiBadge
          endpoints={[
            "GET /api/auth/builderhub/start",
            "GET /api/auth/builderhub/callback?code&state",
          ]}
        />
        <Card title="Log in to Backyard" description="Apply for grants, manage projects, review submissions.">
          <div className="flex flex-col gap-4 py-2">
            {returnTo ? (
              <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] px-3 py-2 text-xs">
                You&apos;ll be taken back to{" "}
                <span className="font-mono font-semibold">
                  {resolvePostLoginTarget(returnTo, "/projects")}
                </span>{" "}
                after signing in.
              </p>
            ) : null}
            <Button
              variant="primary"
              size="lg"
              onClick={handleBuilderHubLogin}
              className="w-full"
            >
              Continue with BuilderHub
            </Button>
            <p className="text-center text-xs text-[var(--color-fg-muted)]">
              You&apos;ll be redirected to BuilderHub to sign in. We never see your password.
            </p>
          </div>
        </Card>
        <p className="text-center text-xs text-[var(--color-fg-muted)]">
          First time here?{" "}
          <Link href="/onboarding" className="underline underline-offset-2">
            Complete your profile
          </Link>
          {" · "}
          <Link href="/faq" className="underline underline-offset-2">
            FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
