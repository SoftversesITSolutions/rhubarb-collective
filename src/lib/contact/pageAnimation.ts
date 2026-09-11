"use client";

/**
 * /CONTACT — MOTION
 * =================
 *
 * The least motion on the site, which is the point: this is the page people
 * arrive at when they want to do something, and nothing here may stand between
 * a reader and an email address.
 *
 * ONE GESTURE, twice over: a short lift with a mask that opens downward for a
 * block of type, and a hairline that draws from its left edge. Nothing pins,
 * nothing is scaled or rotated, nothing moves sideways, no two elements travel
 * in different directions, and there is no second gesture for "important"
 * content.
 *
 * SCRUBBED AND REVERSIBLE. Every reveal is a `fromTo` whose progress *is* the
 * scroll position, over a window a third of a viewport tall. Nothing uses
 * `once`, nothing plays on enter, there is no exit animation and no state is
 * ever latched — so the state at any scroll position is the same whichever
 * direction you arrived from.
 *
 * NON-BLOCKING BY CONSTRUCTION. Every window closes near the top of the
 * viewport, so a route is fully legible long before it reaches the middle of
 * the screen; the page is short enough that the hero and the first routes are
 * resolved at load. With JavaScript off, the `noscript` block in the root
 * layout releases the resting state outright.
 *
 * WHY THIS IS NOT `lib/about/animation`. That module carries a nested-group
 * cascade the About page's long sections need. This page has four routes and
 * three blocks of type; it needs one flat pass and nothing else, and merging
 * the two would mean refactoring an approved page to serve a simpler one. If a
 * third quiet page appears, that is the moment to lift a shared module out of
 * both — not before.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ContactPageAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/** How far a revealing block travels, in pixels. Small on purpose. */
const LIFT = 12;

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function createContactPageAnimation({
  root,
  reducedMotion,
}: ContactPageAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-cp-reveal]");
    const rules = all<HTMLElement>(root, "[data-cp-rule]");

    /* ---- the resting state, and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      gsap.set(rules, { scaleX: 1 });
      root.dataset.cpState = "static";
      return;
    }

    root.dataset.cpState = "running";

    /*
     * A block is a heading with the lines under it, or one route. Each gets its
     * own scroll window, so a route never waits on the one below it and the
     * page cannot end up gated on its own foot.
     */
    all<HTMLElement>(root, "[data-cp-block]").forEach((block) => {
      const items = Array.from(block.querySelectorAll<HTMLElement>("[data-cp-reveal]"));
      const rule = block.querySelector<HTMLElement>("[data-cp-rule]");
      if (!items.length && !rule) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: block,
          start: "top 94%",
          end: "top 66%",
          scrub: 0.5,
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

      // A short cascade, capped, so a block of five lines does not take five
      // times as long to resolve as a block of one.
      items.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5 },
          Math.min(0.3, i * 0.07),
        );
      });
    });

    // The brand faces change the height of every line on this page, so trigger
    // positions computed against the fallback metrics are wrong until they land.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}
