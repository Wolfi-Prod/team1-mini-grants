"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
import { Badge } from "@/app/_components/ui/Badge";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import type { Project, ProjectSectionKey, ProjectVisibility } from "@/lib/types";
import {
  CATEGORY_OPTIONS,
  FieldLabelRow,
} from "@/app/projects/_components/ProjectFormShared";

interface AssetState {
  /** Existing mock URL (string) when editing; null if the user removed or replaced it. */
  existingUrl: string | null;
  /** Newly picked file from disk (takes precedence over existingUrl). */
  file: File | null;
  previewUrl: string | null;
}

interface PictureState {
  id: string;
  existingUrl: string | null;
  file: File | null;
  previewUrl: string;
}

interface Props {
  project: Project;
}

export function EditProjectForm({ project }: Props) {
  const router = useRouter();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [problemStatement, setProblemStatement] = useState(
    project.problemStatement ?? "",
  );
  const [categories, setCategories] = useState<string[]>(project.categories);
  const [logo, setLogo] = useState<AssetState>({
    existingUrl: project.logoUrl,
    file: null,
    previewUrl: project.logoUrl,
  });
  const [banner, setBanner] = useState<AssetState>({
    existingUrl: project.bannerUrl,
    file: null,
    previewUrl: project.bannerUrl,
  });
  const [pictures, setPictures] = useState<PictureState[]>(
    project.imageUrls.map((url) => ({
      id: url,
      existingUrl: url,
      file: null,
      previewUrl: url,
    })),
  );
  const [websiteUrl, setWebsiteUrl] = useState(project.websiteUrl ?? "");
  const [projectUrl, setProjectUrl] = useState(project.projectUrl ?? "");
  const [otherLinks, setOtherLinks] = useState<string[]>(project.otherLinks);
  const [pendingLink, setPendingLink] = useState("");
  const [contractAddresses, setContractAddresses] = useState<string[]>(
    project.contractAddresses,
  );
  const [pendingContract, setPendingContract] = useState("");
  const [visibility, setVisibility] = useState<ProjectVisibility>(project.visibility);
  const [hiddenSections, setHiddenSections] = useState<ProjectSectionKey[]>(
    project.hiddenSections,
  );
  const [submitting, setSubmitting] = useState(false);

  function toggleHidden(section: ProjectSectionKey) {
    setHiddenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  }

  const isCustom = visibility === "CUSTOM";
  const archived = project.archivedAt !== null;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const picturesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (logo.file && logo.previewUrl && logo.previewUrl !== logo.existingUrl) {
        URL.revokeObjectURL(logo.previewUrl);
      }
      if (banner.file && banner.previewUrl && banner.previewUrl !== banner.existingUrl) {
        URL.revokeObjectURL(banner.previewUrl);
      }
      for (const p of pictures) {
        if (p.file && p.previewUrl && p.previewUrl !== p.existingUrl) {
          URL.revokeObjectURL(p.previewUrl);
        }
      }
    };
    // Cleanup on unmount with latest values — acceptable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    categories.length > 0 &&
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
    if (logo.file && logo.previewUrl && logo.previewUrl !== logo.existingUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo({ existingUrl: logo.existingUrl, file, previewUrl: URL.createObjectURL(file) });
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function clearLogo() {
    if (logo.file && logo.previewUrl && logo.previewUrl !== logo.existingUrl) {
      URL.revokeObjectURL(logo.previewUrl);
    }
    setLogo({ existingUrl: null, file: null, previewUrl: null });
  }

  function handleBannerChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (banner.file && banner.previewUrl && banner.previewUrl !== banner.existingUrl) {
      URL.revokeObjectURL(banner.previewUrl);
    }
    setBanner({
      existingUrl: banner.existingUrl,
      file,
      previewUrl: URL.createObjectURL(file),
    });
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function clearBanner() {
    if (banner.file && banner.previewUrl && banner.previewUrl !== banner.existingUrl) {
      URL.revokeObjectURL(banner.previewUrl);
    }
    setBanner({ existingUrl: null, file: null, previewUrl: null });
  }

  function handlePicturesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: PictureState[] = [];
    for (const file of Array.from(files)) {
      added.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        existingUrl: null,
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
      if (target?.file && target.previewUrl !== target.existingUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
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
    // API: POST /api/upload (only for newly-picked logo / banner / pictures → Cloudinary URLs)
    // API: PATCH /api/projects/:id
    // body: {
    //   name, description, problemStatement?,
    //   categories, logoUrl?, bannerUrl?, imageUrls,
    //   websiteUrl, projectUrl, otherLinks, contractAddresses,
    //   visibility, hiddenSections,
    // }
    // The backend auto-writes a new ProjectVersion snapshot on every successful PATCH
    // (see IMPLEMENTATION_PHASES.md §2A).
    // response: { project: Project, version: ProjectVersion }
    const effectiveHidden = visibility === "CUSTOM" ? hiddenSections : [];
    const newPicturesCount = pictures.filter((p) => p.file !== null).length;
    const changedLogo = logo.file !== null || logo.existingUrl !== project.logoUrl;
    const changedBanner = banner.file !== null || banner.existingUrl !== project.bannerUrl;
    toast.success(
      `Saved "${name.trim()}" (mock). Visibility: ${visibility}${
        effectiveHidden.length > 0 ? ` · ${effectiveHidden.length} hidden` : ""
      }${changedLogo ? " · logo updated" : ""}${changedBanner ? " · banner updated" : ""}${
        newPicturesCount > 0 ? ` · ${newPicturesCount} new picture${newPicturesCount === 1 ? "" : "s"}` : ""
      }.`,
    );
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`Edit ${project.name}`}
        description="Changes here create a new version. Team, files, and updates are edited on their own pages."
        breadcrumbs={
          <Link href={`/projects/${project.id}`} className="underline underline-offset-2">
            ← Back to project
          </Link>
        }
      />

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "POST  /api/upload        (only for newly-picked logo / banner / pictures)",
              "PATCH /api/projects/:id  (updates project; backend writes ProjectVersion snapshot)",
            ]}
          />

          {archived ? (
            <Card title="Archived">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-md text-xs text-[var(--color-fg-muted)]">
                  This project is archived — it doesn&apos;t appear in Discover or public listings.
                  You can still edit it. Unarchive from the project detail page to make it visible
                  again.
                </p>
                <Badge variant="inverted">ARCHIVED</Badge>
              </div>
            </Card>
          ) : null}

          <Card title="Project details">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-xs font-medium uppercase tracking-wide">Logo</label>
                  {logo.previewUrl ? (
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
                        <span className="truncate">
                          {logo.file ? logo.file.name : "Current logo"}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={clearLogo}
                            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          >
                            Remove
                          </button>
                        </div>
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
                  <label className="text-xs font-medium uppercase tracking-wide">Banner</label>
                  {banner.previewUrl ? (
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
                        <span className="truncate">
                          {banner.file ? banner.file.name : "Current banner"}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={clearBanner}
                            className="text-[10px] font-semibold uppercase tracking-widest underline underline-offset-2"
                          >
                            Remove
                          </button>
                        </div>
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
                <label className="text-xs font-medium uppercase tracking-wide">Pictures</label>
                {pictures.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {pictures.map((p) => (
                      <div key={p.id} className="relative border border-[var(--color-border-muted)]">
                        <div className="aspect-square w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.previewUrl}
                            alt={p.file ? p.file.name : "Project picture"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePicture(p.id)}
                          aria-label={`Remove picture`}
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
                  Optional. Deployed contract addresses across any chain.
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
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={!valid || submitting}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
