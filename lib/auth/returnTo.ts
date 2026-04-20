/**
 * returnTo helpers for the login redirect flow.
 *
 * When an unauthenticated user hits a protected page, we redirect them to
 * `/login?returnTo=<originalPath>` so the login page can send them back after
 * signing in. Both construction (from the protected page) and consumption
 * (on the login page) must refuse anything that could be an open-redirect —
 * i.e., only same-origin, absolute-path values are allowed.
 */

/** Build the /login URL with an optional returnTo query param, validated. */
export function loginRedirectUrl(returnTo?: string | null): string {
  const safe = sanitizeReturnTo(returnTo, null);
  if (safe === null) return "/login";
  return `/login?returnTo=${encodeURIComponent(safe)}`;
}

/**
 * Resolve the post-login destination.
 * - Returns `returnTo` if it's a same-origin absolute path.
 * - Returns `fallback` (e.g., "/projects") otherwise.
 */
export function resolvePostLoginTarget(
  returnTo: string | null | undefined,
  fallback: string,
): string {
  return sanitizeReturnTo(returnTo, fallback) ?? fallback;
}

function sanitizeReturnTo<T extends string | null>(
  value: string | null | undefined,
  fallback: T,
): string | T {
  if (!value) return fallback;
  // Only accept paths starting with a single slash. Reject protocol-relative (`//`)
  // and path-traversal-ish values (`/\`, schemes like `javascript:`).
  if (value.length < 1 || value[0] !== "/") return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
