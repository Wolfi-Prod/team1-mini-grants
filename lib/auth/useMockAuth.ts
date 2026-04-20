"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Organization } from "@/lib/types";
import {
  type MockRole,
  type Module,
  DEFAULT_ADMIN_PRESET,
  DEFAULT_ORG_PRESET,
  getAdminPreset,
  getOrgPreset,
} from "./roles";
import { MOCK_USERS_BY_ROLE, MOCK_PRIMARY_ORG_BY_ROLE } from "@/lib/mock/roleBindings";
import { MOCK_AUTH_COOKIE, MOCK_PROFILE_INCOMPLETE_COOKIE } from "./constants";

interface MockAuthState {
  currentRole: MockRole;
  adminPreset: string;
  orgPreset: string;
  /** Dev toggle — when true, server treats the applicant's profile as not-yet-complete. */
  profileIncomplete: boolean;
  setRole: (role: MockRole) => void;
  setAdminPreset: (key: string) => void;
  setOrgPreset: (key: string) => void;
  setProfileIncomplete: (value: boolean) => void;
  signOut: () => void;
}

function writeRoleCookie(role: MockRole) {
  if (typeof document === "undefined") return;
  document.cookie = `${MOCK_AUTH_COOKIE}=${role}; path=/; max-age=31536000; samesite=lax`;
}

function writeProfileIncompleteCookie(value: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = `${MOCK_PROFILE_INCOMPLETE_COOKIE}=${value ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
}

export const useMockAuth = create<MockAuthState>()(
  persist(
    (set) => ({
      currentRole: "visitor",
      adminPreset: DEFAULT_ADMIN_PRESET,
      orgPreset: DEFAULT_ORG_PRESET,
      profileIncomplete: false,
      setRole: (role) => {
        writeRoleCookie(role);
        set({ currentRole: role });
      },
      setAdminPreset: (key) => set({ adminPreset: key }),
      setOrgPreset: (key) => set({ orgPreset: key }),
      setProfileIncomplete: (value) => {
        writeProfileIncompleteCookie(value);
        set({ profileIncomplete: value });
      },
      signOut: () => {
        writeRoleCookie("visitor");
        set({ currentRole: "visitor" });
      },
    }),
    {
      name: "mock-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          writeRoleCookie(state.currentRole);
          writeProfileIncompleteCookie(state.profileIncomplete);
        }
      },
    },
  ),
);

export function useCurrentUser(): User | null {
  const role = useMockAuth((s) => s.currentRole);
  return MOCK_USERS_BY_ROLE[role] ?? null;
}

export function useCurrentOrg(): Organization | null {
  const role = useMockAuth((s) => s.currentRole);
  return MOCK_PRIMARY_ORG_BY_ROLE[role] ?? null;
}

export function useCurrentModules(): Module[] {
  const role = useMockAuth((s) => s.currentRole);
  const adminKey = useMockAuth((s) => s.adminPreset);
  const orgKey = useMockAuth((s) => s.orgPreset);
  if (role === "admin") return [...getAdminPreset(adminKey).modules];
  if (role === "org") return [...getOrgPreset(orgKey).modules];
  return [];
}

export function useHasModule(module: Module): boolean {
  const modules = useCurrentModules();
  return modules.includes(module);
}
