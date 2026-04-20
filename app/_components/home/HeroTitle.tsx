"use client";

import { useEffect, useRef, useCallback } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

// No props needed — reads dark mode from body.dark class

// Each word with its style
const WORDS = [
  { text: "You ", style: "normal" },
  { text: "build.", style: "normal" },
  { text: "\n", style: "break" },
  { text: "We back", style: "italic" },
  { text: "\n", style: "break" },
  { text: "you.", style: "normal" },
] as const;

const STAGGER_MS = 200; // delay between each word reveal
const REVEAL_DURATION_MS = 700; // how long each word takes to fully appear
const BLUR_MAX = 14;
const TRANSLATE_Y = 32;

export function HeroTitle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(0);
  const rafId = useRef(0);
  const dpr = useRef(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    if (!startTime.current) startTime.current = now;
    const elapsed = now - startTime.current;

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const ratio = dpr.current;

    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(ratio, ratio);

    // Compute font size to match CSS clamp(72px, 11.2vw, 172px)
    const vw = window.innerWidth;
    const fontSize = Math.max(72, Math.min(11.2 * vw / 100, 172));
    const lineHeight = fontSize * 0.92;

    const isDark = document.body.classList.contains("dark");
    const inkColor = isDark ? "#F5F2E9" : "#12110D";
    const mutedColor = "#8A8472";

    ctx.clearRect(0, 0, w, h);

    // Build lines manually since we have explicit line breaks
    const lines = [
      [WORDS[0], WORDS[1]], // "You build."
      [WORDS[3]],           // "We back"
      [WORDS[5]],           // "you."
    ];

    let wordIndex = 0;
    let y = 0;

    for (const line of lines) {
      let x = 0;

      for (const word of line) {
        const delay = wordIndex * STAGGER_MS;
        const wordElapsed = Math.max(0, elapsed - delay);
        const progress = Math.min(1, wordElapsed / REVEAL_DURATION_MS);

        // Eased progress (cubic ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);

        const opacity = eased;
        const translateY = TRANSLATE_Y * (1 - eased);
        const blur = BLUR_MAX * (1 - eased);

        const isItalic = word.style === "italic";
        const fontWeight = isItalic ? "300" : "400";
        const fontStyle = isItalic ? "italic" : "normal";
        const font = `${fontStyle} ${fontWeight} ${fontSize}px Fraunces`;

        // Use pretext for precise measurement
        const prepared = prepareWithSegments(word.text.trim(), font);
        const layout = layoutWithLines(prepared, w, lineHeight);
        const textWidth =
          layout.lines.length > 0 ? layout.lines[0].width : 0;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.filter = blur > 0.5 ? `blur(${blur}px)` : "none";
        ctx.font = font;
        ctx.fillStyle = isItalic ? mutedColor : inkColor;
        ctx.textBaseline = "top";
        ctx.fillText(word.text.trim(), x, y + translateY);
        ctx.restore();

        x += textWidth + (word.text.endsWith(" ") ? fontSize * 0.28 : 0);
        wordIndex++;
      }

      y += lineHeight;
    }

    // Keep animating until all words are fully revealed
    const totalDuration =
      (wordIndex - 1) * STAGGER_MS + REVEAL_DURATION_MS + 50;
    if (elapsed < totalDuration) {
      rafId.current = requestAnimationFrame(draw);
    } else {
      // Final static frame
      rafId.current = 0;
    }
  }, []);

  useEffect(() => {
    dpr.current = window.devicePixelRatio || 1;
    startTime.current = 0;
    rafId.current = requestAnimationFrame(draw);

    const handleResize = () => {
      if (!rafId.current) {
        startTime.current = performance.now() - 99999; // skip animation on resize
        rafId.current = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", handleResize);

    // Re-draw when theme toggles (body.dark class change)
    const observer = new MutationObserver(() => {
      startTime.current = performance.now() - 99999;
      if (!rafId.current) rafId.current = requestAnimationFrame(draw);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="hero__title-canvas">
      <canvas ref={canvasRef} />
      {/* Hidden h1 for SEO / accessibility */}
      <h1 className="sr-only">You build. We back you.</h1>
    </div>
  );
}
