"use client";

import { toast } from "sonner";
import type { ProjectSectionKey, ProjectVisibility } from "@/lib/types";
import { PROJECT_SECTION_LABELS } from "@/lib/types";

interface Props {
  projectId: string;
  section: ProjectSectionKey;
  visibility: ProjectVisibility;
  hidden: boolean;
}

/**
 * Small inline toggle that sits in each Card's actions slot on /projects/[id].
 * Owner-only. Mock-only: clicking fires a toast, no real state mutation.
 * When visibility === "PUBLIC" the toggle is disabled with a hint that the project is Public.
 * When visibility === "PRIVATE" the toggle is disabled and shows "Private".
 * When visibility === "CUSTOM" the toggle flips the section in/out of hiddenSections.
 */
export function SectionVisibilityToggle({
  projectId,
  section,
  visibility,
  hidden,
}: Props) {
  const label = PROJECT_SECTION_LABELS[section];

  if (visibility === "PRIVATE") {
    return (
      <span
        className="border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
        title="Project is Private — nothing is public."
      >
        Private
      </span>
    );
  }

  if (visibility === "PUBLIC") {
    return (
      <button
        type="button"
        title="Project is Public — switch to Custom to hide individual sections."
        onClick={() =>
          toast(
            `Switch visibility to "Custom" to hide ${label.toLowerCase()} from the public.`,
          )
        }
        className="border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-subtle)]"
      >
        Public
      </button>
    );
  }

  // CUSTOM
  return (
    <button
      type="button"
      aria-pressed={hidden}
      onClick={() => {
        // API: PATCH /api/projects/:id  body: { hiddenSections: [...] }
        toast.success(
          hidden
            ? `${label} is now public (mock).`
            : `${label} is now hidden from public (mock).`,
        );
        void projectId;
      }}
      className={
        hidden
          ? "border border-[var(--color-border-muted)] bg-[var(--color-bg-inverted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-on-inverted)]"
          : "border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg)]"
      }
    >
      {hidden ? "Hidden" : "Public"}
    </button>
  );
}
