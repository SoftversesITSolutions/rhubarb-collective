"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useViewport } from "@/lib/hero/useViewport";
import { SPECIMENS, SPECIMEN_PLACEMENTS } from "@/lib/specimens/config";
import { findRoom } from "@/lib/specimens/place";
import { createSpecimenPlayer, type SpecimenPlayer } from "@/lib/specimens/player";
import "./specimens.css";

interface Planted {
  figure: HTMLElement;
  inner: HTMLElement;
  section: HTMLElement;
  index: number;
  player: SpecimenPlayer | null;
}

/**
 * The 3D flowers and mushrooms in the homepage's open space (client round 2,
 * priority 5 — see lib/specimens/config).
 *
 * One component for the whole page. It plants a figure into each configured
 * section, finds it real empty space there (lib/specimens/place) once the
 * layout has settled and again whenever a section changes shape, and turns
 * each one with the scroll as it crosses the screen: a short pre-rendered run
 * of frames, scrubbed, so it reverses exactly. Under reduced motion each is a
 * still.
 *
 * The figures are absolutely positioned inside their sections and sit above
 * the network and beside the content, so no section's height — and so no
 * network — changes because of them. They take no pointer events.
 */
export function SpecimenField() {
  const { tier, reducedMotion } = useViewport();

  useEffect(() => {
    if (!tier) return;
    gsap.registerPlugin(ScrollTrigger);

    const planted: Planted[] = [];
    SPECIMEN_PLACEMENTS.forEach((placement, index) => {
      const section = document.querySelector<HTMLElement>(placement.section);
      if (!section) return;
      const specimen = SPECIMENS[placement.specimen];

      const figure = document.createElement("div");
      figure.className = "specimen";
      figure.dataset.specimen = specimen.id;
      figure.setAttribute("role", "img");
      figure.setAttribute("aria-label", specimen.alt);
      const inner = document.createElement("div");
      inner.className = "specimen__figure";
      const canvas = document.createElement("canvas");
      canvas.className = "specimen__canvas";
      inner.append(canvas);
      figure.append(inner);
      section.append(figure);

      planted.push({
        figure,
        inner,
        section,
        index,
        player: createSpecimenPlayer(figure, canvas, placement.specimen),
      });
    });

    /* ---- motion: turn with the scroll, arrive quietly ----
       Built after each placement rather than once: a scroll window measured
       before its figure has a position is a window onto the wrong place. */
    let ctx: gsap.Context | null = null;
    const animate = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        planted.forEach(({ figure, inner, player }) => {
          if (figure.hidden) return;
          if (reducedMotion) {
            gsap.set(inner, { opacity: 1 });
            player?.draw(0.5);
            return;
          }
          const turn = { t: 0 };
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: figure,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          tl.to(turn, { t: 1, duration: 1, onUpdate: () => player?.draw(turn.t) }, 0);
          tl.fromTo(
            inner,
            { opacity: 0, y: 36, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "sine.out" },
            0.04,
          );
          // It keeps drifting a little against the page after it has arrived.
          tl.to(inner, { y: -22, duration: 0.66 }, 0.34);
        });
      });
    };

    /* ---- placement: measured, and re-measured when a section reflows ---- */
    let signature = "";
    const place = () => {
      // Clear first, so no specimen is an obstacle to itself or to an earlier one.
      planted.forEach(({ figure }) => figure.removeAttribute("data-placed"));
      const parts: string[] = [];
      planted.forEach(({ figure, section, index }) => {
        const { prefer, min, max } = SPECIMEN_PLACEMENTS[index];
        const room = findRoom(section, prefer, min, max);
        if (!room) {
          figure.hidden = true;
          parts.push("-");
          return;
        }
        // A little air inside the space that was found.
        const size = Math.round(room.size * 0.9);
        const inset = (room.size - size) / 2;
        figure.hidden = false;
        figure.style.left = `${Math.round(room.x + inset)}px`;
        figure.style.top = `${Math.round(room.y + inset)}px`;
        figure.style.width = `${size}px`;
        figure.dataset.placed = "";
        parts.push(`${figure.style.left},${figure.style.top},${size}`);
      });
      // Only rebuild the motion when something actually moved.
      const next = parts.join("|");
      if (next === signature) return;
      signature = next;
      animate();
    };

    let frame = 0;
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(place);
      }, 220);
    };
    const observer = new ResizeObserver(schedule);
    new Set(planted.map((p) => p.section)).forEach((section) => observer.observe(section));
    // Sections grow their networks and settle their type after fonts arrive.
    void document.fonts.ready.then(schedule);
    const late = window.setTimeout(schedule, 1600);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(late);
      cancelAnimationFrame(frame);
      observer.disconnect();
      ctx?.revert();
      planted.forEach(({ figure, player }) => {
        player?.destroy();
        figure.remove();
      });
    };
  }, [tier, reducedMotion]);

  return null;
}
