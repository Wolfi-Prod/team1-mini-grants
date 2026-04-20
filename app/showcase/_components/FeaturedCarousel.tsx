"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
  acceptedCountByProject: Record<string, number>;
}

export function FeaturedCarousel({ projects, acceptedCountByProject }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const speedRef = useRef(0.5); // px per frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = 0;
    const half = track.scrollWidth / 2;

    function tick() {
      pos += speedRef.current;
      if (pos >= half) pos -= half;
      track!.style.transform = `translateX(-${pos}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Duplicate projects for seamless loop
  const items = [...projects, ...projects];

  return (
    <div
      className="overflow-hidden"
      style={{ borderBottom: "1px solid var(--line)" }}
      onMouseEnter={() => { speedRef.current = 0; }}
      onMouseLeave={() => { speedRef.current = 0.5; }}
    >
      <div
        ref={trackRef}
        className="flex"
        style={{ width: "max-content" }}
      >
        {items.map((p, i) => {
          const accepted = acceptedCountByProject[p.id] ?? 0;
          return (
            <Link
              key={`${p.id}-${i}`}
              href={`/discover/projects/${p.id}`}
              className="flex shrink-0 flex-col justify-between p-5 transition-colors duration-150"
              style={{
                background: "var(--bg)",
                width: "clamp(220px, 20vw, 300px)",
                minHeight: "200px",
                borderRight: "1px solid var(--line)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--soft)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg)"; }}
            >
              {/* Image placeholder */}
              <div
                className="mb-3 flex aspect-[4/3] w-full items-center justify-center border"
                style={{ borderColor: "var(--line)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "36px",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: "var(--muted)",
                  }}
                >
                  {p.name.charAt(0)}
                </span>
              </div>

              {/* Title */}
              <h3
                className="mb-1 line-clamp-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--ink)",
                }}
              >
                {p.name}
              </h3>

              {/* Categories */}
              <div className="mt-auto flex items-center gap-2">
                {p.categories.slice(0, 2).map((c) => (
                  <span
                    key={c}
                    className="text-[8px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-mono-display)" }}
                  >
                    {c}
                  </span>
                ))}
                {accepted > 0 && (
                  <span
                    className="text-[8px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-mono-display)" }}
                  >
                    Funded
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
