"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";

interface Props {
  initialName: string;
  initialHandle: string;
  initialBio: string;
  initialCountry: string;
  initialState: string;
  initialTelegram: string;
  /** Path to return to after saving — set when a gated action bounced the user here. */
  nextUrl: string;
  /** Banner variant when the profile isn't yet complete. null = voluntary visit. */
  bannerReason: "apply" | "gated-generic" | null;
}

const INTEREST_OPTIONS = [
  "DeFi",
  "NFT",
  "Infra",
  "Tooling",
  "Bridge",
  "Lending",
  "Gaming",
  "Education",
  "Social",
  "Security",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OnboardingForm({
  initialName,
  initialHandle,
  initialBio,
  initialCountry,
  initialState,
  initialTelegram,
  nextUrl,
  bannerReason,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [handleTouched, setHandleTouched] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [country, setCountry] = useState(initialCountry);
  const [stateRegion, setStateRegion] = useState(initialState);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const derivedHandle = useMemo(
    () => (handleTouched ? handle : slugify(name) || handle),
    [handle, handleTouched, name],
  );

  const valid =
    name.trim().length > 0 &&
    derivedHandle.trim().length >= 2 &&
    bio.trim().length >= 10;

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: PATCH /api/users/me
    // body: { name, handle, bio, country, state, telegram, interests, onboardingCompletedAt: now }
    toast.success(`Welcome, ${name.trim()} (mock). Profile saved.`);
    // If a gated action sent the user here, bounce them back to where they were heading.
    // Otherwise the default applicant landing is /projects.
    router.push(nextUrl || "/projects");
  }

  return (
    <div className="flex flex-col">
      {bannerReason ? (
        <div className="border-b border-[var(--color-border-muted)] bg-yellow-200 px-6 py-3">
          <div className="mx-auto max-w-2xl text-sm font-semibold">
            {bannerReason === "apply"
              ? "Complete your profile to apply for a grant. Orgs reviewing your application see what you fill in here."
              : "Complete your profile to continue. Name, handle, and bio are required."}
          </div>
        </div>
      ) : null}
      <section className="border-b border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-6 py-12 text-[var(--color-fg-on-inverted)]">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Step 1 of 1 · Complete your profile
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
            Welcome to Backyard
          </h1>
          <p className="text-sm leading-relaxed opacity-90">
            Before you create your first project or apply to a grant, tell us who you are.
            This is the profile grant orgs see when they receive your applications.
          </p>
        </div>
      </section>

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/users/me",
              "PATCH /api/users/me  (profile + interests)",
            ]}
          />

          <Card title="Your profile">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Display name"
                placeholder="Alice Applicant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <Input
                label="Handle"
                placeholder="alice"
                hint="Your public URL at /u/[handle]. Auto-derived from name — click to override."
                value={derivedHandle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setHandleTouched(true);
                }}
                onFocus={() => {
                  if (!handleTouched) {
                    setHandle(derivedHandle);
                    setHandleTouched(true);
                  }
                }}
                required
                error={
                  derivedHandle.length > 0 && derivedHandle.length < 2
                    ? "Handle must be at least 2 characters."
                    : undefined
                }
              />
              <Textarea
                label="Bio"
                rows={4}
                placeholder="One-paragraph intro: what you build, what you care about, what you're looking for. Min 10 characters."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Country"
                  placeholder="US"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  hint="Two-letter code."
                />
                <Input
                  label="State / region"
                  placeholder="CA"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value.toUpperCase())}
                />
              </div>
              <Input
                label="Telegram"
                placeholder="@yourhandle"
                hint="Optional. Orgs may DM you about your applications."
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide">
                  Areas of interest
                </label>
                <p className="text-xs text-[var(--color-fg-subtle)]">
                  Optional. Helps us recommend relevant grants on Discover.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((i) => {
                    const active = interests.includes(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleInterest(i)}
                        className={
                          active
                            ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                            : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                        }
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border-muted)] pt-4">
                {bannerReason ? (
                  <span className="text-xs text-[var(--color-fg-muted)]">
                    Profile required — skip is disabled until you finish.
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(nextUrl || "/projects")}
                  >
                    Skip for now
                  </Button>
                )}
                <Button type="submit" variant="primary" disabled={!valid || submitting}>
                  {bannerReason === "apply"
                    ? "Save and continue to apply"
                    : "Save and continue"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
