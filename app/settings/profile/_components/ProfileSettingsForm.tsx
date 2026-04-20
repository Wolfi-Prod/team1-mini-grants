"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import type { User } from "@/lib/types";

interface Props {
  user: User;
}

function slugifyHandle(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function ProfileSettingsForm({ user }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio ?? "");
  const [telegram, setTelegram] = useState(user.telegram ?? "");
  const [country, setCountry] = useState(user.country ?? "");
  const [stateRegion, setStateRegion] = useState(user.state ?? "");
  const [wallet, setWallet] = useState(user.walletAddress ?? "");
  const [isPublic, setIsPublic] = useState(user.isProfilePublic);
  const [submitting, setSubmitting] = useState(false);

  const handleValid = /^[a-z0-9-]{3,32}$/.test(handle);
  const nameValid = name.trim().length > 0;
  const bioValid = bio.length === 0 || bio.trim().length >= 10;
  const valid = nameValid && handleValid && bioValid;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: PUT /api/me/profile
    // body: { name, handle, bio, telegram, country, state, walletAddress, isProfilePublic }
    toast.success("Profile saved (mock)");
    router.refresh();
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card title="Public profile">
        <div className="flex flex-col gap-4">
          <Input
            label="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Handle"
            value={handle}
            onChange={(e) => setHandle(slugifyHandle(e.target.value))}
            hint={`Your profile lives at /u/${handle || "…"} — lowercase letters, numbers, dashes. 3–32 chars.`}
            error={!handleValid ? "3–32 chars, lowercase letters / numbers / dashes only" : undefined}
            required
          />
          <Textarea
            label="Bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            hint="Optional — keep it under a paragraph. Min 10 chars if filled."
            error={!bioValid ? "At least 10 characters" : undefined}
          />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>
              <span className="font-semibold">Public profile.</span> When off, your{" "}
              <code>/u/{handle || "handle"}</code> page shows a &quot;this profile is private&quot;
              placeholder to visitors. Admins + orgs you&apos;ve applied to still see the
              scoped view.
            </span>
          </label>
        </div>
      </Card>

      <Card title="Contact + location">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Telegram"
            placeholder="@handle"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            hint="Private — only shown to orgs that have received an application from you."
          />
          <Input
            label="Wallet address"
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            hint="Used when disbursing funds. Private."
          />
          <Input
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Input
            label="State / region"
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between border-t border-[var(--color-border-muted)] pt-4">
        <Link
          href={`/u/${user.handle}`}
          className="text-xs underline underline-offset-2"
        >
          View public profile →
        </Link>
        <Button type="submit" variant="primary" disabled={!valid || submitting}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
