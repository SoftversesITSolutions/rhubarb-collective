"use client";

/**
 * JOURNAL & CULTURE — ANIMATION
 *
 * Same model as Sections 3, 4, 5 and 6, and for the same reason: every reveal is
 * a timeline whose progress *is* the scroll. Nothing uses `once`, nothing plays
 * on enter, there are no exit animations and no state is ever latched — so the
 * mid-scroll state is identical whichever direction you arrived from, and the
 * section can be crossed any number of times without reaching a stuck state.
 *
 *   progress 0    →  network undrawn, editorial positions clipped shut
 *   progress 0.5  →  halfway, in both directions
 *   progress 1    →  the field open, growth carried on past the foot
 *
 * Ordering is expressed through trigger windows rather than one long stagger:
 *
 *   the network continues out of Section 6
 *     → the section's opening copy resolves
 *       → growth reaches a junction near an editorial position
 *         → that position resolves
 *           → the forthcoming strands follow
 *             → growth carries on toward the foot of the page
 *
 * The anchor strand into a position is timed off its own node, so the junction
 * always exists before anything grows out of it. That whole ordering reverses
 * for free on the way back up, because every value is a pure function of the
 * scroll position rather than of elapsed time.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface JournalAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export function createJournalAnimation({
  root,
  reducedMotion,
}: JournalAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-journal-marker]");
    const lede = all<HTMLElement>(root, "[data-journal-lede]");
    const items = all<HTMLElement>(root, "[data-journal-item]");
    const strandList = one<HTMLElement>(root, "[data-journal-strands]");
    const strandItems = all<HTMLElement>(root, "[data-journal-strand]");
    const paths = all<SVGPathElement>(root, "[data-journal-path]");
    const anchors = all<SVGPathElement>(root, "[data-journal-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-journal-node]");
    const junctions = all<SVGGElement>(root, "[data-journal-junction]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...paths, ...anchors], { strokeDashoffset: 0 });
      gsap.set([...nodeMarks, ...junctions], { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-journal-reveal]"), {
        clipPath: CLIP_OPEN,
        opacity: 1,
        y: 0,
      });
      gsap.set(all(root, "[data-journal-rule]"), { scaleX: 1 });
      gsap.set(
        [marker, ...lede, ...strandItems, ...all(root, "[data-journal-meta]")].filter(
          Boolean,
        ),
        { opacity: 1, y: 0 },
      );
      root.dataset.journalState = "static";
      return;
    }

    root.dataset.journalState = "running";

    /* =================================================================== *
     * THE NETWORK — continues in as the section arrives, retreats as it
     * leaves. Genuine path growth: each strand draws along its own length in
     * the generator's own order, so growth propagates outward from the
     * Section 6 inlets rather than the whole SVG fading up.
     * =================================================================== */
    if (paths.length) {
      gsap.set([...nodeMarks, ...junctions], {
        opacity: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      const netTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom 88%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      netTl.to({}, { duration: 1 }, 0);

      paths.forEach((path) => {
        const start = Number(path.dataset.start) || 0;
        const duration = Math.max(0.02, Number(path.dataset.duration) || 0.05);
        netTl.to(path, { strokeDashoffset: 0, duration, ease: "power1.out" }, start * 0.82);
      });

      nodeMarks.forEach((node) => {
        const group = node.closest("[data-journal-group]");
        const path = group?.querySelector<SVGPathElement>("[data-journal-path]");
        const at =
          (Number(path?.dataset.start) || 0) + (Number(path?.dataset.duration) || 0);
        netTl.to(
          node,
          { opacity: 1, scale: 1, duration: 0.04, ease: "power2.out" },
          Math.min(0.96, at * 0.82),
        );
      });

      // The reach into an editorial position, timed off the node it leaves from.
      anchors.forEach((anchor) => {
        const at = Number(anchor.dataset.at) || 0;
        netTl.to(
          anchor,
          { strokeDashoffset: 0, duration: 0.05, ease: "power1.out" },
          Math.min(0.95, at * 0.82),
        );
      });

      // The meeting points. Marked a beat before the strand leaves them, so the
      // junction reads as the thing the growth resolved into.
      junctions.forEach((junction) => {
        const at = Number(junction.dataset.at) || 0;
        netTl.to(
          junction,
          { opacity: 1, scale: 1, duration: 0.05, ease: "power2.out" },
          Math.min(0.94, Math.max(0, at * 0.82 - 0.02)),
        );
      });
    }

    /* ---- section marker and the client's opening copy ---- */
    if (marker) {
      gsap.fromTo(
        marker,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: marker,
            start: "top 92%",
            end: "top 72%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    lede.forEach((line, i) => {
      gsap.fromTo(
        line,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 94%",
            end: `top ${74 - i * 2}%`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    /* =================================================================== *
     * THE EDITORIAL POSITIONS — one scrubbed timeline each
     *
     * A clip that opens downward, a very short lift, and a hairline that draws
     * from its left edge. Nothing flies, nothing bounces, nothing rotates, no
     * two positions move in different directions, and no position is ever
     * transformed as an object. The words are the visual event.
     * =================================================================== */
    items.forEach((item) => {
      const reveals = Array.from(
        item.querySelectorAll<HTMLElement>("[data-journal-reveal]"),
      );
      const rule = item.querySelector<HTMLElement>("[data-journal-rule]");
      const meta = item.querySelector<HTMLElement>("[data-journal-meta]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          end: "bottom 76%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 0.34 },
          0,
        );
      }

      reveals.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: 10 },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.42 },
          0.12 + i * 0.14,
        );
      });

      if (meta) {
        tl.fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, 0.46);
      }
    });

    /* ---- the forthcoming strands, arriving one after another ---- */
    if (strandList && strandItems.length) {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: strandList,
          start: "top 92%",
          end: "bottom 82%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      strandItems.forEach((strand, i) => {
        tl.fromTo(
          strand,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 },
          i * 0.06,
        );
      });
    }

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
