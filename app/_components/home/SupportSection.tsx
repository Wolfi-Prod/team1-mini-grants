"use client";

import { useState } from "react";

const SUPPORTS = [
  { title: "GTM & Tech Calls", body: "One-on-one calls with people who shipped before you. Get advice on your go-to-market strategy or technical architecture.", meta: "1:1 CALLS" },
  { title: "Bootcamps", body: "Structured programs to take your project from raw idea to launch-ready. Learn by building, not watching.", meta: "STRUCTURED" },
  { title: "Distribution", body: "We put your project in front of the right people. Partner networks, showcases, and featured spots on Backyard.", meta: "REACH" },
  { title: "Testing", body: "Real users test your product before launch. Get bug reports, UX feedback, and validation from people outside your bubble.", meta: "VALIDATION" },
  { title: "Design Support", body: "Access design reviews and UI feedback so your project ships polished, not half-baked.", meta: "POLISH" },
  { title: "Community", body: "Connect with other builders shipping in public. Share progress, ask questions, get unstuck fast.", meta: "NETWORK" },
];

export function SupportSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, 1fr)",
        gap: "var(--line-w)",
        background: "var(--line)",
        minHeight: "calc(100vh - 49px)",
      }}
    >
      {SUPPORTS.map((item, i) => {
        const isHovered = i === hovered;
        // Top row cards shift up, bottom row cards shift down
        const isTopRow = i < 3;
        const shiftDir = isTopRow ? -8 : 8;

        return (
          <div
            key={item.title}
            className="flex flex-col justify-between p-6 transition-transform duration-200"
            style={{
              background: "var(--ink)",
              transform: isHovered ? `translateY(${shiftDir}px)` : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div>
              <h3
                className="mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: isHovered ? "var(--text)" : "var(--text-muted)",
                  transition: "color 0.2s",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                {item.body}
              </p>
            </div>

            <div
              className="mt-6 border-t pt-3"
              style={{ borderColor: "var(--subtle-border)" }}
            >
              <span
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{
                  color: isHovered ? "var(--text)" : "var(--text-dim)",
                  fontFamily: "var(--font-pixel)",
                  transition: "color 0.2s",
                }}
              >
                {item.meta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
