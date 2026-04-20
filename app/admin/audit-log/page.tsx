import { PageHeader } from "@/app/_components/layout/PageHeader";
import { MockApiBadge } from "@/app/_components/dev/MockApiBadge";
import { mockAuditLog } from "@/lib/mock/auditLog";
import { findUserById } from "@/lib/mock/users";
import { AuditLogPanel } from "./_components/AuditLogPanel";
import type { AuditLogRow } from "./_components/types";

export default function AuditLogPage() {
  const rows: AuditLogRow[] = mockAuditLog
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry) => {
      const actor = findUserById(entry.actorId);
      return {
        entry,
        actor: actor
          ? { id: actor.id, name: actor.name ?? actor.handle, handle: actor.handle }
          : null,
      };
    });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Audit log"
        description="Every state-changing operation. Filter by action, resource, actor, or date range. Backed by the AuditLog table; actor FK is onDelete: SetNull so survives user deletion."
      />
      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <MockApiBadge
            endpoints={[
              "GET /api/admin/audit-log  (paged, filterable)",
              "GET /api/admin/audit-log.csv  (export)",
            ]}
          />
          <AuditLogPanel initialRows={rows} />
        </div>
      </section>
    </div>
  );
}
