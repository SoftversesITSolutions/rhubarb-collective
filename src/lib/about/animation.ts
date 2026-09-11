"use client";

/**
 * /ABOUT — MOTION
 * ===============
 *
 * The homepage is the experiment. This page is the quiet reading of the same
 * brand, so its motion budget is deliberately tiny and there is exactly one
 * gesture in it, applied consistently:
 *
 *   a short lift, with a mask that opens downward
 *
 * Nothing pins. Nothing scrubs a composition against a long window. No element
 * is scaled, rotated, or moved sideways, no two things travel in different
 * directions, and there is no second gesture reserved for "important" content.
 * The type is the event; the motion only decides when it is legible.
 *
 * SCRUBBED AND REVERSIBLE, like every section of the homepage. Each reveal is a
 * `fromTo` whose progress *is* the scroll position, over a window barely a
 * fifth of the viewport tall. Nothing uses `once`, nothing plays on enter,
 * there is no exit animation and no state is ever latched, so the state at any
 * scroll position is identical whichever direction you arrived from and the
 * page can be crossed any number of times without sticking.
 *
 * READABLE BEFORE IT MOVES. Every window closes near the top of the viewport,
 * so a block is fully resolved well before it reaches the middle of the screen.
 * Nobody ever waits on an animation to read a sentence — and with JavaScript
 * off, the `noscript` block in the root layout releases the resting state
 * outright.
 *
 * REDUCED MOTION removes the tweens rather than shortening them: the elements
 * are set to their resting values in one pass and no ScrollTrigger is created.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface AboutAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/** How far a revealing block travels, in pixels. Small on purpose. */
const LIFT = 14;

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function createAboutAnimation({
  root,
  reducedMotion,
}: AboutAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-about-reveal]");
    const rules = all<HTMLElement>(root, "[data-about-rule]");

    /* ---- the resting state, and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      gsap.set(rules, { scaleX: 1 });
      root.dataset.aboutState = "static";
      return;
    }

    root.dataset.aboutState = "running";

    /*
     * Groups exist only to stagger their own children. A group is a heading
     * with its paragraphs, or one methodology stage — never a whole section, so
     * a long section never waits on its own foot to start resolving.
     */
    const groups = all<HTMLElement>(root, "[data-about-group]");

    groups.forEach((group) => {
      // A group's own items only. Groups nest — a figure inside a section's
      // lead block is a group in its own right — and without this filter the
      // outer group would tween the inner one's elements as well, running two
      // scrubbed timelines against the same properties from two different
      // scroll windows.
      const own = (el: Element) => el.closest("[data-about-group]") === group;

      const items = Array.from(
        group.querySelectorAll<HTMLElement>("[data-about-reveal]"),
      ).filter(own);
      const rule = Array.from(
        group.querySelectorAll<HTMLElement>("[data-about-rule]"),
      ).filter(own)[0];
      if (!items.length && !rule) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: group,
          // Opens as the block enters from the foot and is finished by the time
          // its top is four fifths of the way up the viewport.
          start: "top 92%",
          end: "top 62%",
          scrub: 0.6,
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

      // A short cascade, capped: a block of eight lines must not take eight
      // times as long to resolve as a block of one.
      items.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5 },
          Math.min(0.4, i * 0.08),
        );
      });
    });

    /*
     * Anything left outside a group gets the same gesture on its own trigger.
     * This is the safety net that guarantees no element can be left invisible
     * because its wrapper was refactored away.
     */
    reveals
      .filter((el) => !el.closest("[data-about-group]"))
      .forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          {
            clipPath: CLIP_OPEN,
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 94%",
              end: "top 66%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
      });

    rules
      .filter((el) => !el.closest("[data-about-group]"))
      .forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "0% 50%" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 96%",
              end: "top 78%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );
      });

    // The brand faces change the height of every paragraph on this page, so the
    // trigger positions computed against the fallback metrics are wrong until
    // they land.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}
