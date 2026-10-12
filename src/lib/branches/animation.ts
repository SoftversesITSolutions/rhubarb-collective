"use client";

/**
 * BRANCHES — ANIMATION
 *
 * Same model as Selected Work, and for the same reason: every reveal is a
 * timeline whose progress *is* the scroll. Nothing uses `once`, nothing plays on
 * enter, and there are no exit animations — so the mid-scroll state is identical
 * whichever direction you arrived from, and the section can be crossed any
 * number of times without reaching a stuck state.
 *
 *   progress 0    →  network undrawn, cards clipped shut, prints blank
 *   progress 0.5  →  halfway
 *   progress 1    →  settled
 *
 * Ordering is expressed through trigger windows rather than one long stagger:
 * the cards resolve as they enter and the network grows through them on the
 * page's shared growth line (lib/network/growth); all of it reverses for free
 * on the way back up.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { growNetwork } from "@/lib/network/growth";

export interface BranchesAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

// Opens left-to-right: this is the page's one section whose growth is lateral.
const CLIP_CLOSED = "inset(0% 100% 0% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export function createBranchesAnimation({
  root,
  reducedMotion,
}: BranchesAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-branches-marker]");
    const cards = all<HTMLElement>(root, "[data-branch-card]");
    const branches = all<SVGPathElement>(root, "[data-branch-path]");
    const nodeMarks = all<SVGGElement>(root, "[data-branch-node]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set(branches, { strokeDashoffset: 0 });
      gsap.set(nodeMarks, { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-branch-frame]"), { clipPath: CLIP_OPEN });
      gsap.set(
        [marker, ...all(root, "[data-branch-body]"), ...all(root, "[data-branch-print]")].filter(
          Boolean,
        ),
        { opacity: 1, y: 0 },
      );
      // The print holds still; its pointer state is CSS and still applies.
      gsap.set(all(root, "[data-branch-print-image]"), { y: 0 });
      root.dataset.branchesState = "static";
      return;
    }

    root.dataset.branchesState = "running";

    /* =================================================================== *
     * THE NETWORK — grows in as the section arrives, retreats as it leaves
     * =================================================================== */
    if (branches.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

      // Drawn along the page's shared growth line (lib/network/growth), so the
      // tips are on screen while they grow and the seam above hands over in step.
      growNetwork({ root, strands: branches, marks: nodeMarks });
    }

    /* ---- section marker ---- */
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

    /* =================================================================== *
     * THE CARDS — one scrubbed timeline each
     *
     * The card's clip opens while it settles the last few pixels upward and
     * out of a slight under-scale; its content follows inside the same
     * timeline. Restrained on purpose: no bounce, no flight paths, nothing
     * arriving from off-axis.
     * =================================================================== */
    cards.forEach((card) => {
      const frame = card.querySelector<HTMLElement>("[data-branch-frame]");
      const body = card.querySelector("[data-branch-body]");
      const print = card.querySelector("[data-branch-print]");
      const printImage = card.querySelector("[data-branch-print-image]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: card,
          start: "top 92%",
          end: "bottom 82%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        frame,
        { clipPath: CLIP_CLOSED, x: -18, scale: 0.985 },
        { clipPath: CLIP_OPEN, x: 0, scale: 1, duration: 0.78 },
        0,
      ).fromTo(body, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.34 }, 0.5);

      // The print develops on the cream once the card is mostly open — after
      // the plane, before the type — like a photograph coming up in the tray.
      // Only the wrap's opacity is scrubbed; the image's own opacity is the
      // pointer state and stays with CSS.
      if (print) {
        tl.fromTo(print, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.28);
      }

      // A slow drift of the print against the scroll for as long as the card
      // is on screen: a few pixels, scrubbed, so the card reads as an object
      // with depth rather than a flat plane. The reach is a fraction of the
      // card's height and is re-read on refresh, so a resize cannot expose an
      // edge (the image is 16% taller than the card).
      if (printImage && frame) {
        const reach = () => Math.round(frame.offsetHeight * 0.06);
        gsap.fromTo(
          printImage,
          { y: () => reach() },
          {
            y: () => -reach(),
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
