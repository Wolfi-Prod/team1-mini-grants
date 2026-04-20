"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/_components/ui/Button";
import { ConfirmDialog } from "@/app/_components/ui/ConfirmDialog";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
}

export function ProjectActions({ project }: Props) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);

  const archived = project.archivedAt !== null;

  function handleArchive() {
    // API: PATCH /api/projects/:id  body: { archivedAt: <now> }
    toast.success(`Archived "${project.name}" (mock)`);
    router.push("/projects");
  }

  function handleUnarchive() {
    // API: PATCH /api/projects/:id  body: { archivedAt: null }
    toast.success(`Unarchived "${project.name}" (mock)`);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/discover">
          <Button variant="primary">Apply to grant</Button>
        </Link>
        <Link href={`/projects/${project.id}?preview=1`}>
          <Button variant="secondary">Preview public view</Button>
        </Link>
        <Link href={`/projects/${project.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
        {archived ? (
          <Button variant="secondary" onClick={handleUnarchive}>
            Unarchive
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setArchiveOpen(true)}>
            Archive
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Archive project?"
        message={
          <>
            Archiving <strong>{project.name}</strong> removes it from Discover and hides it
            from the default project list. You can unarchive any time. Archive is not delete —
            existing applications stay intact.
          </>
        }
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchive}
        onClose={() => setArchiveOpen(false)}
      />
    </>
  );
}
