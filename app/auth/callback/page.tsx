import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { resolvePostLoginTarget } from "@/lib/auth/returnTo";

interface PageProps {
  searchParams: Promise<{
    code?: string;
    state?: string;
    returnTo?: string;
    error?: string;
    error_description?: string;
  }>;
}

export default async function AuthCallbackPage({ searchParams }: PageProps) {
  const { code, state, returnTo, error, error_description } = await searchParams;

  // Already signed in and the callback fired again — likely a stale link. Send them home.
  const role = await getServerRole();
  if (isAuthenticated(role)) {
    const user = await getServerUser();
    if (user) {
      // API: GET /api/auth/builderhub/callback sets session cookie on the server side
      // before redirecting here. If we got here while already authenticated, the exchange
      // already happened — honor returnTo (or default) and redirect out of this shell.
      const fallback = user.onboardingCompletedAt ? "/projects" : "/onboarding";
      redirect(resolvePostLoginTarget(returnTo, fallback));
    }
  }

  // If BuilderHub sent us an error (user denied, state mismatch, expired code), surface it
  // instead of redirecting silently.
  if (error) {
    return (
      <section className="px-6 py-10">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <Card title="Sign-in failed">
            <MockApiBadge endpoints={["GET /api/auth/builderhub/callback"]} />
            <p className="mt-3 text-sm">
              BuilderHub returned an error:{" "}
              <span className="font-mono text-xs">
                {(error ?? "").slice(0, 80)}
              </span>
              {error_description
                ? ` — ${(error_description ?? "").slice(0, 200)}`
                : ""}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/login">
                <Button variant="primary">Try again</Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">Back home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // Missing code or state — either someone hit the URL directly, or the exchange was
  // interrupted. In production the server would've redirected already; this is the
  // fallback surface.
  if (!code || !state) {
    return (
      <section className="px-6 py-10">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <Card title="Awaiting BuilderHub…">
            <MockApiBadge endpoints={["GET /api/auth/builderhub/callback"]} />
            <p className="mt-3 text-sm">
              This page completes the BuilderHub sign-in handshake. If nothing happens
              within a few seconds, the session cookie wasn&apos;t set — start over from
              the login page.
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-[var(--color-fg-muted)]">
              <li>Browser hits <code>/auth/callback?code=…&amp;state=…</code> after BuilderHub redirects.</li>
              <li>The real backend swaps the code for a session and sets a cookie.</li>
              <li>This page redirects to <code>returnTo</code> or (first login) <code>/onboarding</code>.</li>
            </ol>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/login">
                <Button variant="primary">Back to login</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // Happy-path preview — in real usage the handler sets the cookie then 302s, so this JSX
  // is never rendered. We show it for manual QA + so devs can eyeball the params.
  return (
    <section className="px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Card title="Exchanging code with BuilderHub…">
          <MockApiBadge endpoints={["GET /api/auth/builderhub/callback"]} />
          <p className="mt-3 text-sm">
            Code received. The server is swapping it for a session and will redirect you
            in a moment.
          </p>
          <dl className="mt-3 grid gap-2 text-xs">
            <div>
              <dt className="font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                Code
              </dt>
              <dd className="mt-0.5 break-all font-mono">{code}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                State
              </dt>
              <dd className="mt-0.5 break-all font-mono">{state}</dd>
            </div>
            {returnTo ? (
              <div>
                <dt className="font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
                  returnTo
                </dt>
                <dd className="mt-0.5 break-all font-mono">{returnTo}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
            Mock page — real backend sets cookie + 302s. No session created here.
          </p>
        </Card>
      </div>
    </section>
  );
}
