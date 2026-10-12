"use client";

/**
 * CONTACT / ROUTES — ANIMATION
 *
 * Same model as Sections 3 through 7: every reveal is a timeline whose progress
 * *is* the scroll. Nothing uses `once`, nothing plays on enter, there are no exit
 * animations and no state is ever latched — so the mid-scroll state is identical
 * whichever direction you arrived from, and the section can be crossed any
 * number of times without reaching a stuck state.
 *
 * WHAT IS DIFFERENT HERE: the composition is ONE coherent timeline rather than a
 * trigger per block. Every section above is a field the reader moves through, so
 * per-item windows are right there — an item resolves as it comes up. This
 * section is a single closing frame, and it should resolve as one thing:
 *
 *   0.00 – 0.20   the network continues in from Section 7
 *   0.15 – 0.45   the closing statement settles into prominence
 *   0.30 – 0.50   the invitation follows it
 *   0.45 – 0.80   the routes emerge, in reading order
 *   0.72 – 0.95   the company details settle at the foot
 *
 * THE BLOOM (client note 8) has a window of its own: from its slot entering
 * at the foot of the viewport until the slot's lower edge reaches the upper
 * half. It fades up, turns from the back of its head to face-on by 0.62 of
 * that window and holds, while the whole figure swirls in from a rotation and
 * a slight under-scale. Timing it from the slot rather than the section is
 * what makes the whole turn visible on every tier — on the narrow ones the
 * flower sits well below the section's top. The turn is a frame index and the
 * swirl is a transform — both pure functions of scroll position, so it
 * reverses like everything else.
 *
 * The network runs on its own scrubbed timeline over a slightly wider window,
 * because growth has to be arriving before there is anything for a route to be
 * near. The anchor strand into a route is timed off its own node, so the
 * junction always exists before anything grows out of it.
 *
 * All of it reverses for free on the way back up, because every value is a pure
 * function of scroll position rather than of elapsed time.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { layoutRect } from "@/lib/network/continuity";
import { growNetwork } from "@/lib/network/growth";
import { createBloomPlayer, type BloomPlayer } from "./bloom";
import { BLOOM_MOTION } from "./config";

export interface ContactAnimationOptions {
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

export function createContactAnimation({
  root,
  reducedMotion,
}: ContactAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  let bloomPlayer: BloomPlayer | null = null;

  const ctx = gsap.context(() => {
    const bloom = one<HTMLElement>(root, "[data-contact-bloom]");
    const bloomSlot = one<HTMLElement>(root, "[data-contact-bloom-slot]");
    const bloomOrigin = one<HTMLElement>(root, "[data-contact-bloom-origin]");
    const marker = one<HTMLElement>(root, "[data-contact-marker]");
    const statementLines = all<HTMLElement>(root, "[data-contact-line]");
    const invitation = one<HTMLElement>(root, "[data-contact-invitation]");
    const routes = all<HTMLElement>(root, "[data-contact-route]");
    const colophon = all<HTMLElement>(root, "[data-contact-colophon]");
    const paths = all<SVGPathElement>(root, "[data-contact-path]");
    const anchors = all<SVGPathElement>(root, "[data-contact-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-contact-node]");
    const junctions = all<SVGGElement>(root, "[data-contact-junction]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...paths, ...anchors], { strokeDashoffset: 0 });
      gsap.set([...nodeMarks, ...junctions], { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-contact-reveal]"), {
        clipPath: CLIP_OPEN,
        opacity: 1,
        y: 0,
      });
      gsap.set(all(root, "[data-contact-rule]"), { scaleX: 1 });
      gsap.set(
        [marker, invitation, ...colophon, ...all(root, "[data-contact-meta]")].filter(
          Boolean,
        ),
        { opacity: 1, y: 0 },
      );
      // The still: face-on, unrotated, and no player — the frames never load.
      if (bloom) gsap.set(bloom, { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 });
      root.dataset.contactState = "static";
      return;
    }

    root.dataset.contactState = "running";

    /* =================================================================== *
     * THE NETWORK — the last continuation. Genuine path growth: each strand
     * draws along its own length as the page's growth line reaches it, so
     * growth runs on from the Section 7 inlets rather than the whole SVG
     * fading up.
     * =================================================================== */
    if (paths.length) {
      gsap.set([...nodeMarks, ...junctions], {
        opacity: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      // Drawn along the page's shared growth line (lib/network/growth), so the
      // tips are on screen while they grow and the seam above hands over in step.
      growNetwork({ root, strands: paths, reaches: anchors, marks: nodeMarks, junctions, last: true });
    }

    /* =================================================================== *
     * THE BLOOM — the turn, the swirl and the travel, over one window that
     * opens as the flower's origin enters the screen and closes with its slot
     * at mid-screen. Both boxes are plain layout — the figure is the only
     * thing transformed — so the window never drifts with what it drives.
     * =================================================================== */
    if (bloom && bloomSlot) {
      bloomPlayer = createBloomPlayer(root);
      const origin = bloomOrigin ?? bloomSlot;
      // From the slot's centre to the origin's, and their size ratio.
      const travel = () => {
        const from = layoutRect(origin, root);
        const to = layoutRect(bloomSlot, root);
        return {
          x: from.x + from.width / 2 - (to.x + to.width / 2),
          y: from.y + from.height / 2 - (to.y + to.height / 2),
          scale: to.width ? from.width / to.width : 1,
        };
      };

      const turn = { t: 0 };
      const bloomTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: origin,
          start: "top bottom",
          endTrigger: bloomSlot,
          // Clamped: on a tall screen the page can end before the slot reaches
          // mid-screen, and the flower must still arrive.
          end: "clamp(center 50%)",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // The turn: back of the head → face-on, across the whole window.
      bloomTl.to(
        turn,
        { t: 1, duration: 1, ease: "sine.inOut", onUpdate: () => bloomPlayer?.draw(turn.t) },
        0,
      );
      bloomPlayer?.draw(0);

      // The travel, one axis per tween so the path curves.
      bloomTl.fromTo(
        bloom,
        { x: () => travel().x },
        { x: 0, duration: 1, ease: BLOOM_MOTION.easeX },
        0,
      );
      bloomTl.fromTo(
        bloom,
        { y: () => travel().y },
        { y: 0, duration: 1, ease: BLOOM_MOTION.easeY },
        0,
      );
      // The swirl: it unwinds and grows to size the whole way down, settling
      // gently rather than stopping.
      bloomTl.fromTo(
        bloom,
        { rotate: BLOOM_MOTION.swirl, scale: () => travel().scale },
        { rotate: 0, scale: 1, duration: 1, ease: "sine.out" },
        0,
      );
      bloomTl.fromTo(bloom, { opacity: 0 }, { opacity: 1, duration: BLOOM_MOTION.fadeEnd }, 0);
    }

    /* =================================================================== *
     * THE CLOSING FRAME — one timeline, in the order the section is read.
     * Nothing flies, nothing bounces, nothing rotates, no two blocks move in
     * different directions. The words are the visual event.
     * =================================================================== */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top 78%",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    if (marker) {
      tl.fromTo(marker, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, 0);
    }

    // The statement is the dominant object, so it opens line by line — the only
    // staggered element in the section, and the reason the frame reads as
    // settling rather than appearing.
    statementLines.forEach((line, i) => {
      tl.fromTo(
        line,
        { clipPath: CLIP_CLOSED, opacity: 0.001, y: 14 },
        { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.22 },
        0.15 + i * 0.08,
      );
    });

    if (invitation) {
      tl.fromTo(invitation, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18 }, 0.32);
    }

    routes.forEach((route, i) => {
      const rule = route.querySelector<HTMLElement>("[data-contact-rule]");
      const label = route.querySelector<HTMLElement>("[data-contact-meta]");
      const value = route.querySelector<HTMLElement>("[data-contact-reveal]");
      const at = 0.45 + i * 0.075;

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 0.14 },
          at,
        );
      }
      if (label) {
        tl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.14 }, at + 0.03);
      }
      if (value) {
        tl.fromTo(
          value,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: 10 },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.18 },
          at + 0.06,
        );
      }
    });

    colophon.forEach((block, i) => {
      tl.fromTo(
        block,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.16 },
        0.72 + i * 0.05,
      );
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => {
    bloomPlayer?.destroy();
    ctx.revert();
  };
}
