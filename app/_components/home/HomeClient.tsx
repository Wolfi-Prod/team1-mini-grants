"use client";

import { useEffect, useRef } from "react";

export function HomeScrollDriver() {
  const lastStep = useRef(0);
  const lastWay = useRef(0);

  useEffect(() => {
    const journeyScroll = document.getElementById("journeyScroll");
    const journeyImage = document.querySelector<HTMLDivElement>(".journey__image");
    const journeyContent = document.querySelector<HTMLDivElement>(".journey__image-content");
    const stepBoxes = document.querySelectorAll<HTMLElement>(".step-box");
    const waysScroll = document.getElementById("waysScroll");
    const waysGrid = document.getElementById("waysGrid");

    function updateJourney() {
      if (!journeyScroll || !journeyImage || !journeyContent || !stepBoxes.length) return;

      const rect = journeyScroll.getBoundingClientRect();
      const scrollableHeight = journeyScroll.offsetHeight - window.innerHeight;
      // How far the sticky has scrolled within its container
      // rect.top starts at some positive value and goes negative as we scroll
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      // Before the section is fully in view (scrolled < 0), show no active step
      if (scrolled < 0) {
        if (lastStep.current !== 0) {
          lastStep.current = 0;
          stepBoxes.forEach((s) => s.classList.remove("active"));
          journeyContent.innerHTML = '<div class="journey__hint">Scroll to explore<span style="font-size:20px;margin-top:16px;display:block;animation:pulse 1.8s ease-in-out infinite">↓</span></div>';
        }
        return;
      }

      // Map progress 0–1 to steps 1–4
      // First 10% = no step (initial state visible), then 4 equal segments
      let newStep: number;
      if (progress < 0.1) newStep = 0;
      else if (progress < 0.325) newStep = 1;
      else if (progress < 0.55) newStep = 2;
      else if (progress < 0.775) newStep = 3;
      else newStep = 4;

      if (newStep !== lastStep.current) {
        lastStep.current = newStep;

        if (newStep === 0) {
          stepBoxes.forEach((s) => s.classList.remove("active"));
          journeyContent.innerHTML = '<div class="journey__hint">Scroll to explore<span style="font-size:20px;margin-top:16px;display:block;animation:pulse 1.8s ease-in-out infinite">↓</span></div>';
          return;
        }

        stepBoxes.forEach((s, i) => s.classList.toggle("active", i + 1 === newStep));

        const step = stepBoxes[newStep - 1];
        journeyImage.classList.remove("changing");
        void journeyImage.offsetWidth;
        journeyImage.classList.add("changing");

        setTimeout(() => {
          journeyContent.innerHTML = `<div class="journey__big">${step.dataset.big}</div><div class="journey__small">${step.dataset.small}</div>`;
        }, 450);
        setTimeout(() => journeyImage.classList.remove("changing"), 1100);
      }
    }

    function updateWays() {
      if (!waysScroll || !waysGrid) return;

      const rect = waysScroll.getBoundingClientRect();
      const scrollableHeight = waysScroll.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      if (scrolled < 0) {
        if (lastWay.current !== 0) {
          lastWay.current = 0;
          waysGrid.removeAttribute("data-active");
        }
        return;
      }

      // First 8% = all compacted, then 4 equal segments with room for step 4 to hold
      let newWay: number;
      if (progress < 0.08) newWay = 0;
      else if (progress < 0.28) newWay = 1;
      else if (progress < 0.48) newWay = 2;
      else if (progress < 0.68) newWay = 3;
      else newWay = 4;

      if (newWay !== lastWay.current) {
        lastWay.current = newWay;
        if (newWay === 0) waysGrid.removeAttribute("data-active");
        else waysGrid.dataset.active = String(newWay);
      }
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateJourney();
          updateWays();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
