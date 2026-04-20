"use client";

import { useState } from "react";
import Link from "next/link";

const WAYS = [
  {
    number: "01",
    title: "Idea Bank",
    body: "Drop your idea before you write a line of code. Get feedback, find collaborators, and validate before you commit.",
    href: "/projects/new",
  },
  {
    number: "02",
    title: "Challenges",
    body: "Short, focused build sprints. One problem, tight deadline, fast results. Test your skills under real constraints.",
    href: "/challenges",
  },
  {
    number: "03",
    title: "Hackathons",
    body: "Time-bound competitions with tracks, teams, and prizes. Register solo or with a crew. Ship under pressure.",
    href: "/hackathons",
  },
  {
    number: "04",
    title: "Grants",
    body: "Organizations post funding for specific problems. Apply with your project, get reviewed, receive support as you hit milestones.",
    href: "/discover",
  },
];

export function WaysToBuildSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div
      className="grid min-h-[calc(100vh-49px)]"
      style={{
        gridTemplateColumns:
          expanded !== null
            ? WAYS.map((_, i) => (i === expanded ? "3fr" : "0.5fr")).join(" ")
            : "repeat(4, 1fr)",
        gap: "var(--line-w)",
        background: "var(--line)",
        transition: "grid-template-columns 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      {WAYS.map((way, i) => {
        const isExpanded = i === expanded;
        return (
          <Link
            key={way.number}
            href={way.href}
            className="group relative flex flex-col justify-between overflow-hidden p-6"
            style={{
              background: "var(--ink)",
              minHeight: "100%",
            }}
            onMouseEnter={() => setExpanded(i)}
            onMouseLeave={() => setExpanded(null)}
          >
            {/* Number + marker */}
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-2 w-2 transition-transform duration-300"
                style={{
                  background: "var(--line)",
                  transform: isExpanded ? "scale(1.5)" : "scale(1)",
                }}
                aria-hidden="true"
              />
              <span
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{
                  color: isExpanded ? "var(--text)" : "var(--text-dim)",
                  fontFamily: "var(--font-pixel)",
                  transition: "color 0.3s",
                }}
              >
                {way.number}
              </span>
            </div>

            {/* Title — always visible, rotated when collapsed */}
            <div className="flex flex-1 flex-col justify-center">
              <h3
                className="transition-all duration-300"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isExpanded ? "clamp(36px, 4vw, 48px)" : "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  color: "var(--text)",
                  writingMode: !isExpanded && expanded !== null ? "vertical-rl" : "horizontal-tb",
                  transform: !isExpanded && expanded !== null ? "rotate(180deg)" : "none",
                  transition: "font-size 0.3s, color 0.3s",
                }}
              >
                {way.title}
              </h3>

              {/* Body — only visible when expanded */}
              <p
                className="mt-4 max-w-md transition-all duration-300"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                  opacity: isExpanded ? 1 : 0,
                  maxHeight: isExpanded ? "200px" : "0",
                  overflow: "hidden",
                }}
              >
                {way.body}
              </p>
            </div>

            {/* Bottom — explore label */}
            <div
              className="transition-all duration-300"
              style={{
                opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.08em]"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono-display)",
                }}
              >
                Explore →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
