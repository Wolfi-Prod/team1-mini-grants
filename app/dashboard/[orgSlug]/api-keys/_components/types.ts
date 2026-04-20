export interface ApiKeyRow {
  id: string;
  name: string;
  /** First 10 chars of the key; rest is masked. Shown in lists. */
  prefix: string;
  scope: "read" | "read-write";
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}
