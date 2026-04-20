import type { Notification } from "@/lib/types";

export const mockNotifications: Notification[] = [
  {
    id: "notif_01",
    userId: "user_applicant",
    title: "Your application moved to In Review",
    body: "AvaSwap DEX → DeFi Builders Grant is now being reviewed.",
    link: "/applications/app_01",
    isRead: false,
    readAt: null,
    createdAt: "2026-03-20T09:00:00Z",
  },
  {
    id: "notif_02",
    userId: "user_applicant",
    title: "Grant deadline in 48h",
    body: "Infra & Tooling Grant closes in 48 hours. You have 1 draft.",
    link: "/applications",
    isRead: false,
    readAt: null,
    createdAt: "2026-04-13T09:00:00Z",
  },
  {
    id: "notif_03",
    userId: "user_reviewer",
    title: "New review assignment",
    body: "You've been assigned to review AvaSwap DEX.",
    link: "/reviews/app_01",
    isRead: true,
    readAt: "2026-03-18T09:00:00Z",
    createdAt: "2026-03-17T09:00:00Z",
  },
  {
    id: "notif_04",
    userId: "user_owner",
    title: "New application received",
    body: "GlacierNFT applied to NFT Creators Grant.",
    link: "/dashboard/avalanche-foundation/grants/nft-creators/applications/app_02",
    isRead: false,
    readAt: null,
    createdAt: "2026-04-01T09:00:00Z",
  },
];

export function findNotificationsForUser(userId: string): Notification[] {
  return mockNotifications
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
