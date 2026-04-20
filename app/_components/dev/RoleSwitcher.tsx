"use client";

import { useEffect, useState } from "react";
import { useMockAuth } from "@/lib/auth/useMockAuth";
import {
  MOCK_ROLES,
  ROLE_LABELS,
  ADMIN_PRESETS,
  ORG_PRESETS,
  type MockRole,
} from "@/lib/auth/roles";

export function RoleSwitcher() {
  const role = useMockAuth((s) => s.currentRole);
  const adminPreset = useMockAuth((s) => s.adminPreset);
  const orgPreset = useMockAuth((s) => s.orgPreset);
  const profileIncomplete = useMockAuth((s) => s.profileIncomplete);
  const setRole = useMockAuth((s) => s.setRole);
  const setAdminPreset = useMockAuth((s) => s.setAdminPreset);
  const setOrgPreset = useMockAuth((s) => s.setOrgPreset);
  const setProfileIncomplete = useMockAuth((s) => s.setProfileIncomplete);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRole: MockRole = mounted ? role : "visitor";

  return (
    <div className="fixed right-4 top-[68px] z-40 flex w-60 flex-col gap-2 border border-black bg-white px-3 py-2 shadow-[4px_4px_0_0_#000]">
      <p className="text-[10px] font-bold uppercase tracking-wide">Mock Role (dev)</p>
      <select
        aria-label="Mock role"
        className="h-8 border border-black bg-white px-2 text-xs"
        value={currentRole}
        onChange={(e) => setRole(e.target.value as MockRole)}
      >
        {MOCK_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>

      {currentRole === "applicant" ? (
        <label className="mt-1 flex cursor-pointer items-center gap-2 border border-dashed border-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <input
            type="checkbox"
            checked={mounted ? profileIncomplete : false}
            onChange={(e) => setProfileIncomplete(e.target.checked)}
            className="h-3 w-3 accent-black"
          />
          Simulate new user
        </label>
      ) : null}

      {currentRole === "admin" ? (
        <>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide">Admin Modules</p>
          <select
            aria-label="Admin module preset"
            className="h-8 border border-black bg-white px-2 text-xs"
            value={mounted ? adminPreset : "full"}
            onChange={(e) => setAdminPreset(e.target.value)}
          >
            {ADMIN_PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </>
      ) : null}

      {currentRole === "org" ? (
        <>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide">Org Modules</p>
          <select
            aria-label="Org module preset"
            className="h-8 border border-black bg-white px-2 text-xs"
            value={mounted ? orgPreset : "full"}
            onChange={(e) => setOrgPreset(e.target.value)}
          >
            {ORG_PRESETS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
    </div>
  );
}
