import { redirect } from "next/navigation";
import { getServerRole, getServerUser } from "@/lib/auth/serverAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import { loginRedirectUrl } from "@/lib/auth/returnTo";
import { resolvePostLoginTarget } from "@/lib/auth/returnTo";
import { isProfileComplete } from "@/lib/mock/users";
import { OnboardingForm } from "./_components/OnboardingForm";

interface PageProps {
  searchParams: Promise<{ reason?: string; next?: string }>;
}

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { reason, next } = await searchParams;

  const role = await getServerRole();
  if (!isAuthenticated(role)) redirect(loginRedirectUrl("/onboarding"));

  const user = await getServerUser();
  if (!user) redirect(loginRedirectUrl("/onboarding"));

  // Admin and org users don't go through the applicant onboarding flow — send them home.
  if (role === "admin") redirect("/admin");
  if (role === "org") redirect("/");

  // Sanitize next param the same way we sanitize returnTo — no open-redirect leakage.
  const safeNext = next ? resolvePostLoginTarget(next, "") : "";

  // Banner shown at the top of the page explaining why the user landed here.
  // reason=apply is set when /projects/[id]/apply gated an incomplete profile.
  const gated = !isProfileComplete(user);
  const bannerReason: "apply" | "gated-generic" | null = gated
    ? reason === "apply"
      ? "apply"
      : "gated-generic"
    : null;

  return (
    <OnboardingForm
      initialName={user.name ?? ""}
      initialHandle={user.handle}
      initialBio={user.bio ?? ""}
      initialCountry={user.country ?? ""}
      initialState={user.state ?? ""}
      initialTelegram={user.telegram ?? ""}
      nextUrl={safeNext}
      bannerReason={bannerReason}
    />
  );
}
