"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMockAuth, useCurrentUser, useCurrentOrg } from "@/lib/auth/useMockAuth";
import { isAuthenticated, isAdmin, isOrg } from "@/lib/auth/roles";
import type { MockRole } from "@/lib/auth/roles";
import { hasReviewerAssignments } from "@/lib/mock/reviews";

/* ── Nav links ── */

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/challenges", label: "Challenges" },
  { href: "/discover", label: "Grants" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Profile dropdown ── */

interface DropdownItem {
  href?: string;
  label: string;
  onClick?: () => void;
  separator?: boolean;
}

function buildProfileItems(
  role: MockRole,
  orgSlug: string | undefined,
  userId: string | undefined,
  userHandle: string | undefined,
  signOut: () => void,
): DropdownItem[] {
  const items: DropdownItem[] = [];
  if (userHandle) items.push({ href: `/u/${userHandle}`, label: "Profile" });
  if (role === "applicant") {
    items.push({ href: "/projects", label: "My Projects" });
    items.push({ href: "/applications", label: "My Applications" });
  }
  if (isOrg(role) && orgSlug) items.push({ href: `/dashboard/${orgSlug}`, label: "Dashboard" });
  if (isAdmin(role)) items.push({ href: "/admin", label: "Admin" });
  if (isAuthenticated(role) && userId && hasReviewerAssignments(userId)) items.push({ href: "/reviews", label: "Reviews" });
  if (isAuthenticated(role)) {
    items.push({ href: "/organizations", label: "Organizations" });
    items.push({ href: "/notifications", label: "Notifications" });
    items.push({ separator: true, label: "" });
    items.push({ href: "/settings/profile", label: "Settings" });
  }
  items.push({ separator: true, label: "" });
  items.push({ label: "Sign out", onClick: signOut });
  return items;
}

/* ── Theme ── */

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.body.classList.contains("dark")); }, []);
  const toggle = (mode: "dark" | "light") => {
    const isDark = mode === "dark";
    setDark(isDark);
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", mode);
  };
  return { dark, toggle };
}

/* ── Navbar ── */

export function Navbar() {
  const pathname = usePathname();
  const role = useMockAuth((s) => s.currentRole);
  const user = useCurrentUser();
  const org = useCurrentOrg();
  const signOut = useMockAuth((s) => s.signOut);
  const { dark, toggle } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setProfileOpen(false); }, [pathname]);

  const profileItems = user ? buildProfileItems(role, org?.slug, user.id, user.handle, signOut) : [];

  return (
    <nav className="nav">
      {/* Left: brand + links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/" className="nav__brand">
          <span className="nav__mark" />
          <span className="nav__brand-text">Backyard</span>
        </Link>

        <ul className="nav__links">
          {PUBLIC_LINKS.map((l) => {
            const active = isActivePath(pathname ?? "", l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`nav__link ${active ? "nav__link--active" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: search, profile, theme */}
      <div className="nav__right">
        {/* Search */}
        <Link href="/search" className="icon-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="9" cy="9" r="5.5" />
            <line x1="13.2" y1="13.2" x2="17" y2="17" />
          </svg>
        </Link>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Profile"
            onClick={() => user ? setProfileOpen(!profileOpen) : (window.location.href = "/login")}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="10" cy="7" r="3.2" />
              <path d="M3.8 17.5C4.8 13.6 7.3 12 10 12s5.2 1.6 6.2 5.5" />
            </svg>
          </button>

          {profileOpen && user && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 50,
              minWidth: 200, border: "1px solid var(--line)", background: "var(--bg)", padding: "4px 0"
            }}>
              {profileItems.map((item, i) => {
                if (item.separator) return <div key={`sep-${i}`} style={{ height: 1, background: "var(--color-border-muted)", margin: "4px 0" }} />;
                if (item.onClick) return (
                  <button key={item.label} type="button" onClick={() => { setProfileOpen(false); item.onClick?.(); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 16px", background: "transparent", border: "none",
                      fontFamily: "var(--font-mono-display)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.background = "var(--soft)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                  >{item.label}</button>
                );
                return (
                  <Link key={item.label} href={item.href!} onClick={() => setProfileOpen(false)}
                    style={{ display: "block", padding: "8px 16px",
                      fontFamily: "var(--font-mono-display)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; e.currentTarget.style.background = "var(--soft)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                  >{item.label}</Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <div className="theme">
          <button type="button" className={!dark ? "active" : ""} onClick={() => toggle("light")}>Light</button>
          <button type="button" className={dark ? "active" : ""} onClick={() => toggle("dark")}>Dark</button>
        </div>
      </div>
    </nav>
  );
}
