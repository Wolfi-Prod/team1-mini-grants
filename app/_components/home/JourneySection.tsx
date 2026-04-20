"use client";

import { useState } from "react";

const STEPS = [
  {
    number: "01",
    title: "Ideate",
    body: "Start with a problem worth solving. Share your idea, get early feedback, and find teammates who fill your gaps.",
    placeholder: "BRAINSTORM · VALIDATE · TEAM UP",
  },
  {
    number: "02",
    title: "Build",
    body: "Work in public. Hit milestones. Get reviewed by people who read your code, not your pitch deck.",
    placeholder: "CODE · SHIP · ITERATE",
  },
  {
    number: "03",
    title: "Launch",
    body: "Ship your project publicly. Showcase your work. Let the community and reviewers see what you made.",
    placeholder: "DEPLOY · SHOWCASE · ANNOUNCE",
  },
  {
    number: "04",
    title: "Raise",
    body: "Apply for grant funding with a shipped product, not a slide deck. Organizations fund projects with proof, not promises.",
    placeholder: "APPLY · FUND · GROW",
  },
];

export function JourneySection() {
  const [active, setActive] = useState(0);

  return (
    <div
      className="grid min-h-[calc(100vh-49px)]"
      style={{
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--line-w)",
        background: "var(--line)",
      }}
    >
      {/* Left — steps */}
      <div
        className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16"
        style={{ background: "var(--ink)" }}
      >
        <p
          className="mb-10 text-[9px] uppercase tracking-[0.14em]"
          style={{ color: "var(--text-dim)", fontFamily: "var(--font-pixel)" }}
        >
          YOUR PROJECT, EVERY STEP
        </p>

        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => {
            const isActive = i === active;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className="group flex gap-4 border-l-2 px-4 py-5 text-left transition-all duration-200"
                style={{
                  borderColor: isActive ? "var(--line)" : "var(--subtle-border)",
                  background: isActive ? "var(--subtle-bg)" : "transparent",
                }}
              >
                <span
                  className="mt-1 shrink-0 text-[9px] uppercase tracking-[0.14em]"
                  style={{
                    color: isActive ? "var(--text)" : "var(--text-dim)",
                    fontFamily: "var(--font-pixel)",
                    transition: "color 0.2s",
                  }}
                >
                  {step.number}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(24px, 3vw, 34px)",
                      fontWeight: 400,
                      lineHeight: 1.1,
                      color: isActive ? "var(--text)" : "var(--text-muted)",
                      transition: "color 0.2s",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="max-w-md overflow-hidden transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: "var(--text-muted)",
                      maxHeight: isActive ? "100px" : "0",
                      opacity: isActive ? 1 : 0,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — image placeholder */}
      <div
        className="relative hidden items-center justify-center overflow-hidden md:flex"
        style={{ background: "var(--ink)" }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300"
            style={{
              opacity: i === active ? 1 : 0,
              transform: i === active ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* Placeholder visual — large step number */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(120px, 15vw, 200px)",
                fontWeight: 400,
                lineHeight: 0.85,
                color: "var(--subtle-border)",
                fontStyle: "italic",
              }}
            >
              {step.number}
            </span>
            <span
              className="mt-4 text-[9px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--text-dim)",
                fontFamily: "var(--font-pixel)",
              }}
            >
              {step.placeholder}
            </span>
            {/* Placeholder box for future image */}
            <div
              className="mx-8 mt-8 flex aspect-video w-3/4 items-center justify-center border border-dashed"
              style={{ borderColor: "var(--subtle-border)" }}
            >
              <span
                className="text-[9px] uppercase tracking-[0.14em]"
                style={{
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-pixel)",
                }}
              >
                IMAGE PLACEHOLDER
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
