"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { PageHeader } from "@/app/_components/layout/PageHeader";
import { Input } from "@/app/_components/ui/Input";
import { Textarea } from "@/app/_components/ui/Textarea";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { useMockAuth } from "@/lib/auth/useMockAuth";
import { isAuthenticated } from "@/lib/auth/roles";
import type { ProjectSectionKey, ProjectVisibility } from "@/lib/types";
import {
  CATEGORY_OPTIONS,
  FieldLabelRow,
} from "@/app/projects/_components/ProjectFormShared";

interface BannerState {
  file: File;
  previewUrl: string;
}

interface PictureState {
  id: string;
  file: File;
  previewUrl: string;
}

export default function NewProjectPage() {
  // useSearchParams() forces client-side bailout — Next.js 15 requires wrapping it in
  // a Suspense boundary so the rest of the tree can still statically prerender.
  return (
    <Suspense fallback={null}>
      <NewProjectForm />
    </Suspense>
  );
}

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const role = useMockAuth((s) => s.currentRole);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [logo, setLogo] = useState<BannerState | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [pictures, setPictures] = useState<PictureState[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [otherLinks, setOtherLinks] = useState<string[]>([]);
  const [pendingLink, setPendingLink] = useState("");
  const [contractAddresses, setContractAddresses] = useState<string[]>([]);
  const [pendingContract, setPendingContract] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>("CUSTOM");
  // Default: applications (grant history) are hidden from the public. Owners can reveal
  // them later via the inline toggle on /projects/[id]. Orgs that received applications
  // from this project always see them via the `canSeeFullProject` override.
  const [hiddenSections, setHiddenSections] = useState<ProjectSectionKey[]>(["applications"]);
  const [submitting, setSubmitting] = useState(false);

  function toggleHidden(section: ProjectSectionKey) {
    setHiddenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  }

  const isCustom = visibility === "CUSTOM";

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const picturesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated(role)) {
      router.replace("/login");
    } else if (role !== "applicant") {
      router.replace("/");
    }
  }, [role, router]);

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      if (logo) URL.revokeObjectURL(logo.previewUrl);
      if (banner) URL.revokeObjectURL(banner.previewUrl);
      for (const p of pictures) URL.revokeObjectURL(p.previewUrl);
    };
    // We want the cleanup to run on unmount only with the latest values — acceptable tradeoff
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    categories.length > 0 &&
    logo !== null &&
    banner !== null &&
    pictures.length > 0 &&
    websiteUrl.trim().length > 0 &&
    projectUrl.trim().length > 0;

  function toggleCategory(c: string) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logo) URL.revokeObjectURL(logo.previewUrl);
    setLogo({ file, previewUrl: URL.createObjectURL(file) });
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function clearLogo() {
    if (logo) URL.revokeObjectURL(logo.previewUrl);
    setLogo(null);
  }

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (banner) URL.revokeObjectURL(banner.previewUrl);
    setBanner({ file, previewUrl: URL.createObjectURL(file) });
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function clearBanner() {
    if (banner) URL.revokeObjectURL(banner.previewUrl);
    setBanner(null);
  }

  function handlePicturesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: PictureState[] = [];
    for (const file of Array.from(files)) {
      added.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setPictures((prev) => [...prev, ...added]);
    if (picturesInputRef.current) picturesInputRef.current.value = "";
  }

  function removePicture(id: string) {
    setPictures((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function addLink() {
    const trimmed = pendingLink.trim();
    if (!trimmed) return;
    if (otherLinks.includes(trimmed)) {
      toast("Link already added");
      return;
    }
    setOtherLinks((prev) => [...prev, trimmed]);
    setPendingLink("");
  }

  function removeLink(link: string) {
    setOtherLinks((prev) => prev.filter((l) => l !== link));
  }

  function addContract() {
    const trimmed = pendingContract.trim();
    if (!trimmed) return;
    if (contractAddresses.includes(trimmed)) {
      toast("Address already added");
      return;
    }
    setContractAddresses((prev) => [...prev, trimmed]);
    setPendingContract("");
  }

  function removeContract(addr: string) {
    setContractAddresses((prev) => prev.filter((a) => a !== addr));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    // API: POST /api/upload (banner)  → { url } (Cloudinary)
    // API: POST /api/upload (pictures, one per file) → { url }[]
    // API: POST /api/projects
    // body: {
    //   name, description, problemStatement?, categories,
    //   bannerUrl, imageUrls, websiteUrl, projectUrl, otherLinks, contractAddresses,
    //   visibility, hiddenSections,
    // }
    // response: { project: Project }
    const effectiveHidden = visibility === "CUSTOM" ? hiddenSections : [];
    toast.success(
      `Project "${name.trim()}" created (mock). Visibility: ${visibility}${
        effectiveHidden.length > 0 ? ` · ${effectiveHidden.length} hidden` : ""
      }. Would upload logo + banner + ${pictures.length} image${pictures.length === 1 ? "" : "s"}.`,
    );
    // If a caller (competition submit, grant apply) set a returnTo, bounce back to it
    // so the create-then-attach flow doesn't leave the user stranded on /projects/proj_new.
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push("/projects/proj_new");
    }
  }

  if (role !== "applicant") return null;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="New project"
        description="Describe what you're building. You can add team members, files, and updates after creating."
        breadcrumbs={
          <Link href="/projects" className="underline underline-offset-2">
            ← My projects
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "POST /api/upload       (banner + each picture → Cloudinary URLs)",
              "POST /api/projects     (creates project with uploaded URLs)",
            ]}
          />

          <Card title="Project details">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-xs font-medium uppercase tracking-wide">
                    Logo <span aria-hidden>*</span>
                  </label>
                  {logo ? (
                    <div className="flex flex-col border border-[var(--color-border-muted)]">
                      <div className="aspect-square w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logo.previewUrl}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--color-border-muted)] px-3 py-2 text-xs">
                        <span className="truncate">{logo.file.name}</span>
                        <button
                          type="button"
                          onClick={clearLogo}
                          className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-[var(--color-border-muted)] px-3 text-center"
                    >
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        Upload logo
                      </span>
                      <span className="text-[10px] text-[var(--color-fg-muted)]">Square. PNG, JPG, SVG.</span>
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide">
                    Banner <span aria-hidden>*</span>
                  </label>
                  {banner ? (
                    <div className="flex flex-col border border-[var(--color-border-muted)]">
                      <div className="aspect-[3/1] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.previewUrl}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--color-border-muted)] px-3 py-2 text-xs">
                        <span className="truncate">{banner.file.name}</span>
                        <button
                          type="button"
                          onClick={clearBanner}
                          className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex flex-1 flex-col items-center justify-center gap-1 border border-dashed border-[var(--color-border-muted)] px-4 py-6 text-center"
                    >
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        Upload banner
                      </span>
                      <span className="text-[10px] text-[var(--color-fg-muted)]">
                        Recommended 3:1 aspect ratio. PNG, JPG, or WebP.
                      </span>
                    </button>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border border-[var(--color-border-muted)] bg-[var(--color-bg-muted)] p-3">
                <span className="text-xs font-medium uppercase tracking-wide">
                  Visibility <span aria-hidden>*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["PUBLIC", "PRIVATE", "CUSTOM"] as ProjectVisibility[]).map((v) => {
                    const active = visibility === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setVisibility(v)}
                        className={
                          active
                            ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                            : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                        }
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  {visibility === "PUBLIC"
                    ? "Everyone can see the full project on its showcase page."
                    : visibility === "PRIVATE"
                      ? "Only you (and orgs you apply to) can see this project. It won't appear in Discover."
                      : "You choose which sections are visible to the public. Name, description, banner, logo, pictures, and categories are always shown. Toggle the others below."}
                </p>
                {isCustom ? (
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
                    {hiddenSections.length === 0
                      ? "Nothing hidden yet — use the Hide toggles beside each field."
                      : `${hiddenSections.length} section${hiddenSections.length === 1 ? "" : "s"} hidden`}
                  </p>
                ) : null}
              </div>

              <Input
                label="Name"
                placeholder="AvaSwap DEX"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Textarea
                label="Description"
                placeholder="One-liner + short pitch. What does it do, who is it for?"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <FieldLabelRow
                  label="Problem statement"
                  section="problemStatement"
                  isCustom={isCustom}
                  hiddenSections={hiddenSections}
                  toggleHidden={toggleHidden}
                />
                <Textarea
                  placeholder="What problem are you solving? Optional — but helps reviewers."
                  rows={3}
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide">
                  Categories <span aria-hidden>*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((c) => {
                    const active = categories.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleCategory(c)}
                        className={
                          active
                            ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
                            : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
                        }
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-fg-subtle)]">
                  Pick one or more. Shows up on Showcase and helps grants filter applications.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide">
                  Pictures <span aria-hidden>*</span>
                </label>
                {pictures.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {pictures.map((p) => (
                      <div key={p.id} className="relative border border-[var(--color-border-muted)]">
                        <div className="aspect-square w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.previewUrl}
                            alt={p.file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePicture(p.id)}
                          aria-label={`Remove ${p.file.name}`}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center border border-[var(--color-border-muted)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:bg-[var(--color-bg-inverted)] hover:text-[var(--color-fg-on-inverted)]"
                        >
                          <X size={12} aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => picturesInputRef.current?.click()}
                  className="flex min-h-[80px] flex-col items-center justify-center gap-1 border border-dashed border-[var(--color-border-muted)] px-4 py-4 text-center"
                >
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {pictures.length === 0 ? "Click to add pictures" : "Add more pictures"}
                  </span>
                  <span className="text-[10px] text-[var(--color-fg-muted)]">
                    Screenshots, diagrams, demos. Multi-select allowed.
                  </span>
                </button>
                <input
                  ref={picturesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePicturesChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <FieldLabelRow
                    label="Website URL"
                    required
                    section="websiteUrl"
                    isCustom={isCustom}
                    hiddenSections={hiddenSections}
                    toggleHidden={toggleHidden}
                  />
                  <Input
                    placeholder="https://avaswap.example"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabelRow
                    label="Project URL (live demo)"
                    required
                    section="projectUrl"
                    isCustom={isCustom}
                    hiddenSections={hiddenSections}
                    toggleHidden={toggleHidden}
                  />
                  <Input
                    placeholder="https://app.avaswap.example"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabelRow
                  label="Smart contract addresses"
                  section="contractAddresses"
                  isCustom={isCustom}
                  hiddenSections={hiddenSections}
                  toggleHidden={toggleHidden}
                />
                <div className="flex items-stretch gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="0x..."
                      value={pendingContract}
                      onChange={(e) => setPendingContract(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addContract();
                        }
                      }}
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addContract}>
                    Add
                  </Button>
                </div>
                {contractAddresses.length > 0 ? (
                  <ul className="flex flex-col gap-1 pt-1">
                    {contractAddresses.map((addr) => (
                      <li
                        key={addr}
                        className="flex items-center justify-between gap-2 border border-[var(--color-border-muted)] px-3 py-1.5 font-mono text-xs"
                      >
                        <span className="truncate">{addr}</span>
                        <button
                          type="button"
                          onClick={() => removeContract(addr)}
                          className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          aria-label={`Remove ${addr}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-xs text-[var(--color-fg-subtle)]">
                  Optional. Deployed contract addresses across any chain. You can add more later.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabelRow
                  label="Other links"
                  section="otherLinks"
                  isCustom={isCustom}
                  hiddenSections={hiddenSections}
                  toggleHidden={toggleHidden}
                />
                <div className="flex items-stretch gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="https://github.com/..."
                      value={pendingLink}
                      onChange={(e) => setPendingLink(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLink();
                        }
                      }}
                    />
                  </div>
                  <Button type="button" variant="secondary" onClick={addLink}>
                    Add
                  </Button>
                </div>
                {otherLinks.length > 0 ? (
                  <ul className="flex flex-col gap-1 pt-1">
                    {otherLinks.map((link) => (
                      <li
                        key={link}
                        className="flex items-center justify-between gap-2 border border-[var(--color-border-muted)] px-3 py-1.5 text-xs"
                      >
                        <span className="truncate">{link}</span>
                        <button
                          type="button"
                          onClick={() => removeLink(link)}
                          className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          aria-label={`Remove ${link}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border-muted)] pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/projects")}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={!valid || submitting}>
                  Create project
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
