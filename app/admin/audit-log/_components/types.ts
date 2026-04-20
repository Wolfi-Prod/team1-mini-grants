import type { AuditLog } from "@/lib/types";

export interface AuditLogRow {
  entry: AuditLog;
  actor: { id: string; name: string; handle: string } | null;
}
