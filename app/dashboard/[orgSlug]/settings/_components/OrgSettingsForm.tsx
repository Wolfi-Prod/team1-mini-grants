"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { Organization } from "@/lib/types";

interface Props {
  org: Organization;
  liveGrantCount: number;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OrgSettingsForm({ org, liveGrantCount }: Props) {
  const router = useRouter();
  const [name, setName] = useState(org.name);
  const [slug, setSlug] = useState(org.slug);
  const [description, setDescription] = useState(org.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(org.websiteUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(org.logoUrl ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slugValid = /^[a-z0-9-]{3,48}$/.test(slug);
  const nameValid = name.trim().length > 0;
  const valid = nameValid && slugValid;
  const deleteBlocked = liveGrantCount > 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: PATCH /api/organizations/:orgId
    // body: Partial<{ name, slug, description, websiteUrl, logoUrl }>
    // Slug changes break /dashboard/<old-slug> links — backend should emit an audit log.
    toast.success(`Saved "${name.trim()}" (mock)`);
    if (slug !== org.slug) {
      router.push(`/dashboard/${slug}/settings`);
    } else {
      router.refresh();
    }
    setSubmitting(false);
  }

  function handleDelete() {
    if (deleteBlocked || deleteConfirm !== org.slug) return;
    // API: DELETE /api/organizations/:orgId
    // Soft-delete; blocked if live grants exist (backend + frontend both enforce).
    toast.success(`Deleted "${org.name}" (mock)`);
    router.push("/organizations");
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card title="Profile">
          <div className="flex flex-col gap-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              hint={`Dashboard URL: /dashboard/${slug}. Changing the slug breaks old links — we redirect for 30 days.`}
              error={!slugValid ? "3–48 chars, a-z / 0-9 / dashes" : undefined}
              required
            />
            <Textarea
              label="Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              hint="Shown on /organizations row + any public org pages."
            />
          </div>
        </Card>

        <Card title="Branding + links">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Website"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="Logo URL"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://cdn..."
              hint="Paste a public URL for now — full upload lands in a later phase."
            />
          </div>
        </Card>

        <div className="flex items-center justify-end border-t border-[var(--color-border-muted)] pt-4">
          <Button type="submit" variant="primary" disabled={!valid || submitting}>
            Save settings
          </Button>
        </div>
      </form>

      <Card title="Danger zone">
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Deleting an org soft-deletes the org record, all its grants, and all its
            reviewer assignments. Submitted applications stay (applicant-owned), but stop
            showing this org as the recipient.
          </p>
          {deleteBlocked ? (
            <p className="border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3 text-xs">
              <strong>Delete blocked.</strong> {liveGrantCount} grant
              {liveGrantCount === 1 ? "" : "s"} {liveGrantCount === 1 ? "is" : "are"} still
              live. Archive them first, then come back.
            </p>
          ) : null}
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setDeleteConfirm("");
                setDeleteOpen(true);
              }}
              disabled={deleteBlocked}
            >
              Delete organization
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete organization?"
        message={
          <div className="flex flex-col gap-2">
            <p>
              Type <code>{org.slug}</code> to confirm. This cannot be undone.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              aria-label={`Type ${org.slug} to confirm deletion`}
              placeholder={org.slug}
            />
          </div>
        }
        confirmLabel="Delete organization"
        destructive
        onConfirm={() => {
          if (deleteConfirm === org.slug) {
            setDeleteOpen(false);
            handleDelete();
          }
        }}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConfirm("");
        }}
      />
    </>
  );
}
