"use client";

/**
 * THE PROOF — ANIMATION
 *
 * Same model as Sections 3, 4 and 5, and for the same reason: every reveal is a
 * timeline whose progress *is* the scroll. Nothing uses `once`, nothing plays on
 * enter, there are no exit animations and no state is ever latched — so the
 * mid-scroll state is identical whichever direction you arrived from, and the
 * section can be crossed any number of times without reaching a stuck state.
 *
 *   progress 0    →  network undrawn, client names clipped shut, terms absent
 *   progress 0.5  →  halfway, in both directions
 *   progress 1    →  the relationships settled
 *
 * Ordering is expressed through trigger windows rather than one long stagger:
 *
 *   the network continues out of Section 5
 *     → it reaches a junction near a proof item
 *       → that item's client identity resolves
 *         → its quote, where one exists, opens
 *           → its terms follow
 *             → growth carries on to the next
 *
 * The anchor strand into an item is timed off its own node, so the junction
 * always exists before anything grows out of it. That whole ordering reverses
 * for free on the way back up, because every value is a pure function of the
 * scroll position rather than of elapsed time.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { growNetwork } from "@/lib/network/growth";

export interface ProofAnimationOptions {
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

export function createProofAnimation({
  root,
  reducedMotion,
}: ProofAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-proof-marker]");
    const lede = all<HTMLElement>(root, "[data-proof-lede]");
    const items = all<HTMLElement>(root, "[data-proof-item]");
    const strands = all<SVGPathElement>(root, "[data-proof-path]");
    const anchors = all<SVGPathElement>(root, "[data-proof-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-proof-node]");
    const junctions = all<SVGGElement>(root, "[data-proof-junction]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...strands, ...anchors], { strokeDashoffset: 0 });
      gsap.set([...nodeMarks, ...junctions], { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-proof-reveal]"), { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      gsap.set(all(root, "[data-proof-rule]"), { scaleX: 1 });
      gsap.set(
        [marker, ...lede, ...all(root, "[data-proof-meta]")].filter(Boolean),
        { opacity: 1, y: 0 },
      );
      root.dataset.proofState = "static";
      return;
    }

    root.dataset.proofState = "running";

    /* =================================================================== *
     * THE NETWORK — continues in as the section arrives, retreats as it
     * leaves. Genuine path growth: each strand draws along its own length as
     * the page's growth line reaches it, so growth runs on from the Section 5
     * inlets rather than the whole SVG fading up.
     * =================================================================== */
    if (strands.length) {
      gsap.set([...nodeMarks, ...junctions], {
        opacity: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      // Drawn along the page's shared growth line (lib/network/growth), so the
      // tips are on screen while they grow and the seam above hands over in step.
      growNetwork({ root, strands, reaches: anchors, marks: nodeMarks, junctions });
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
     * THE PROOF ITEMS — one scrubbed timeline each
     *
     * A clip that opens downward, a very short lift, and a hairline that draws
     * from its left edge. Nothing flies, nothing bounces, nothing rotates, no
     * two items move in different directions, and no card is ever transformed
     * as an object. The words are the visual event.
     * =================================================================== */
    items.forEach((item) => {
      const reveals = Array.from(
        item.querySelectorAll<HTMLElement>("[data-proof-reveal]"),
      );
      const rule = item.querySelector<HTMLElement>("[data-proof-rule]");
      const meta = item.querySelector<HTMLElement>("[data-proof-meta]");

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

      reveals.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: 10 },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.42 },
          i * 0.14,
        );
      });

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 0.3 },
          0.38,
        );
      }

      if (meta) {
        tl.fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, 0.46);
      }
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
