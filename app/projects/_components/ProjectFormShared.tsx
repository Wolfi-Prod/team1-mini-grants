"use client";

import type { ProjectSectionKey, ProjectVisibility } from "@/lib/types";

export const CATEGORY_OPTIONS = [
  "DeFi",
  "NFT",
  "Infra",
  "Tooling",
  "Bridge",
  "Lending",
  "Gaming",
  "Education",
  "Other",
];

export function FieldLabelRow({
  label,
  required,
  section,
  isCustom,
  hiddenSections,
  toggleHidden,
}: {
  label: string;
  required?: boolean;
  section: ProjectSectionKey;
  isCustom: boolean;
  hiddenSections: ProjectSectionKey[];
  toggleHidden: (s: ProjectSectionKey) => void;
}) {
  const hidden = hiddenSections.includes(section);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </span>
      {isCustom ? (
        <button
          type="button"
          aria-pressed={hidden}
          onClick={() => toggleHidden(section)}
          className={
            hidden
              ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
              : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
          }
        >
          {hidden ? "Hidden" : "Hide"}
        </button>
      ) : null}
    </div>
  );
}

export function VisibilitySelector({
  visibility,
  setVisibility,
  hiddenSections,
}: {
  visibility: ProjectVisibility;
  setVisibility: (v: ProjectVisibility) => void;
  hiddenSections: ProjectSectionKey[];
}) {
  const isCustom = visibility === "CUSTOM";
  return (
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
            ? "Only you (and orgs you apply to) can see this project. It won\u2019t appear in Discover."
            : "You choose which sections are visible to the public. Name, description, banner, logo, pictures, and categories are always shown. Toggle the others below."}
      </p>
      {isCustom ? (
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)]">
          {hiddenSections.length === 0
            ? "Nothing hidden yet \u2014 use the Hide toggles beside each field."
            : `${hiddenSections.length} section${hiddenSections.length === 1 ? "" : "s"} hidden`}
        </p>
      ) : null}
    </div>
  );
}

export function CategoryPicker({
  categories,
  toggleCategory,
}: {
  categories: string[];
  toggleCategory: (c: string) => void;
}) {
  return (
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
  );
}
