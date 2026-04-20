export interface AdminUserRow {
  user: {
    id: string;
    name: string;
    email: string;
    handle: string;
    isPlatformAdmin: boolean;
    onboardingCompletedAt: string | null;
    deletedAt: string | null;
    createdAt: string;
  };
  orgMemberships: number;
  applicationCount: number;
}
