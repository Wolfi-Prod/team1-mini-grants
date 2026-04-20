import type { GrantPermission } from "@/lib/types";

export interface GrantPermissionRow {
  permission: GrantPermission;
  user: { id: string; name: string; email: string } | null;
}
