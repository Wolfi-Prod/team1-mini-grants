"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/ui/Button";
import { Modal } from "@/app/_components/ui/Modal";
import { useMockAuth, useCurrentUser } from "@/lib/auth/useMockAuth";
import { mockProjects } from "@/lib/mock/projects";

interface Props {
  grantId: string;
  isOpen: boolean;
}

export function ApplyCTA({ grantId, isOpen }: Props) {
  const router = useRouter();
  const role = useMockAuth((s) => s.currentRole);
  const user = useCurrentUser();
  const [pickerOpen, setPickerOpen] = useState(false);

  const myProjects = useMemo(() => {
    if (!user) return [];
    return mockProjects.filter((p) => p.userId === user.id && !p.deletedAt);
  }, [user]);

  if (!isOpen) {
    return (
      <p className="text-sm text-[var(--color-fg-muted)]">
        This grant is no longer accepting applications. Browse other open grants on{" "}
        <Link href="/discover" className="underline underline-offset-2">
          Discover
        </Link>
        .
      </p>
    );
  }

  if (role === "visitor") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Sign in to apply with one of your projects.
        </p>
        <div>
          <Button variant="primary" onClick={() => router.push("/login")}>
            Sign in to apply
          </Button>
        </div>
      </div>
    );
  }

  if (role !== "applicant") {
    return (
      <p className="text-sm text-[var(--color-fg-muted)]">
        Switch to the Applicant role (via the dev role switcher) to apply to this grant.
      </p>
    );
  }

  // Build a return URL that points back to the grant detail page so /projects/new knows
  // where to bounce the user after they create a project. The grant apply form will still
  // need to be entered manually — mock mode can't attach a not-yet-persisted proj_new to
  // the new application inline.
  const returnTo = `/discover/grants/${grantId}`;
  const newProjectHref = `/projects/new?returnTo=${encodeURIComponent(returnTo)}`;

  if (myProjects.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-fg-muted)]">
          You don&apos;t have any projects yet. Create one first, then come back to apply.
        </p>
        <div>
          <Button variant="primary" onClick={() => router.push(newProjectHref)}>
            Create a project
          </Button>
        </div>
      </div>
    );
  }

  if (myProjects.length === 1) {
    const p = myProjects[0];
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-fg-muted)]">
          Apply with <span className="font-semibold">{p.name}</span>, or create a new
          project instead.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() =>
              router.push(`/projects/${p.id}/apply?grant=${grantId}`)
            }
          >
            Apply with {p.name}
          </Button>
          <Button variant="secondary" onClick={() => router.push(newProjectHref)}>
            + Create new project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-fg-muted)]">
          You have {myProjects.length} projects. Pick one to apply with, or create a
          new one.
        </p>
        <div>
          <Button variant="primary" onClick={() => setPickerOpen(true)}>
            Pick a project
          </Button>
        </div>
      </div>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pick a project to apply with"
      >
        <ul className="flex flex-col divide-y divide-black">
          {myProjects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}/apply?grant=${grantId}`}
                className="flex items-start justify-between gap-4 py-3 hover:bg-[var(--color-bg-muted)]"
                onClick={() => setPickerOpen(false)}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="line-clamp-1 text-xs text-[var(--color-fg-muted)]">
                    {p.description}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-widest underline underline-offset-2">
                  Apply →
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={newProjectHref}
              onClick={() => setPickerOpen(false)}
              className="flex items-center justify-between gap-4 border-t border-dashed border-[var(--color-border-muted)] py-3 text-sm font-semibold uppercase tracking-wide hover:bg-[var(--color-bg-muted)]"
            >
              + Create a new project
              <span className="text-[10px] tracking-widest text-[var(--color-fg-muted)]">
                Opens the full form
              </span>
            </Link>
          </li>
        </ul>
      </Modal>
    </>
  );
}
