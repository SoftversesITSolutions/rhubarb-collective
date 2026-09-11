"use client";

/**
 * THE COLLECTIVE — ANIMATION
 *
 * Same model as Sections 3 and 4, and for the same reason: every reveal is a
 * timeline whose progress *is* the scroll. Nothing uses `once`, nothing plays on
 * enter, and there are no exit animations — so the mid-scroll state is identical
 * whichever direction you arrived from, and the section can be crossed any
 * number of times without reaching a stuck state.
 *
 *   progress 0    →  network undrawn, portraits clipped shut, names absent
 *   progress 0.5  →  halfway, in both directions
 *   progress 1    →  the collective settled
 *
 * Ordering is expressed through trigger windows rather than one long stagger:
 * the network's window opens first, so a branch arrives ahead of the person it
 * reaches, and the anchor strand into a frame is timed off its own node. That
 * ordering reverses for free on the way back up.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface CollectiveAnimationOptions {
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

export function createCollectiveAnimation({
  root,
  reducedMotion,
}: CollectiveAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-collective-marker]");
    const lede = all<HTMLElement>(root, "[data-collective-lede]");
    const people = all<HTMLElement>(root, "[data-collective-person]");
    const strands = all<SVGPathElement>(root, "[data-collective-path]");
    const anchors = all<SVGPathElement>(root, "[data-collective-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-collective-node]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...strands, ...anchors], { strokeDashoffset: 0 });
      gsap.set(nodeMarks, { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-collective-frame]"), { clipPath: CLIP_OPEN });
      gsap.set(all(root, "[data-collective-portrait]"), { scale: 1 });
      gsap.set(
        [marker, ...lede, ...all(root, "[data-collective-meta]")].filter(Boolean),
        { opacity: 1, y: 0 },
      );
      root.dataset.collectiveState = "static";
      return;
    }

    root.dataset.collectiveState = "running";

    /* =================================================================== *
     * THE NETWORK — grows in as the section arrives, retreats as it leaves
     * =================================================================== */
    if (strands.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

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

      // Each strand keeps the generator's own ordering, so growth propagates
      // outward from the Section 4 inlets rather than appearing at once — and
      // unwinds in that same order on the way back up.
      strands.forEach((strand) => {
        const start = Number(strand.dataset.start) || 0;
        const duration = Math.max(0.02, Number(strand.dataset.duration) || 0.05);
        netTl.to(
          strand,
          { strokeDashoffset: 0, duration, ease: "power1.out" },
          start * 0.82,
        );
      });

      nodeMarks.forEach((node) => {
        const group = node.closest("[data-collective-group]");
        const path = group?.querySelector<SVGPathElement>("[data-collective-path]");
        const at =
          (Number(path?.dataset.start) || 0) + (Number(path?.dataset.duration) || 0);
        netTl.to(
          node,
          { opacity: 1, scale: 1, duration: 0.04, ease: "power2.out" },
          Math.min(0.96, at * 0.82),
        );
      });

      // The reach into a portrait, timed off the node it leaves from — so the
      // junction always exists before anything grows out of it.
      anchors.forEach((anchor) => {
        const at = Number(anchor.dataset.at) || 0;
        netTl.to(
          anchor,
          { strokeDashoffset: 0, duration: 0.05, ease: "power1.out" },
          Math.min(0.95, at * 0.82),
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
     * THE PEOPLE — one scrubbed timeline each
     *
     * The frame's clip opens while the picture inside settles out of a slight
     * over-scale, and the name follows it. Restrained on purpose: no bounce, no
     * flight paths, nothing arriving from off-axis, and every value is a
     * function of scroll position rather than of time.
     * =================================================================== */
    people.forEach((person) => {
      const frame = person.querySelector("[data-collective-frame]");
      const portrait = person.querySelector("[data-collective-portrait]");
      const meta = person.querySelector("[data-collective-meta]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: person,
          start: "top 90%",
          end: "bottom 78%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        frame,
        { clipPath: CLIP_CLOSED },
        { clipPath: CLIP_OPEN, duration: 0.62 },
        0,
      );

      if (portrait) {
        tl.fromTo(portrait, { scale: 1.03 }, { scale: 1, duration: 0.8 }, 0);
      }

      tl.fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, 0.46);
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
