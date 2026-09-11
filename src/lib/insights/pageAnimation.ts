"use client";

/**
 * /INSIGHTS — MOTION
 * ==================
 *
 * The same gesture the rest of the site uses, and no more of it. This page is a
 * publication: nothing may stand between a reader and a headline.
 *
 * TWO JOBS, on deliberately different elements:
 *
 *   1  the reveal   masthead, archive marker, filter row and each card, each on
 *                   its own scrubbed scroll window.
 *   2  the filter   a fast fade-and-lift when the visible set changes.
 *
 * A scrubbed reveal owns its target's opacity for the length of its window, and
 * a filter change is not a scroll event — if both wrote opacity on one node,
 * filtering mid-window would hand the element straight back to the scroll
 * position on the next frame. So the scrub owns the card's frame and its text,
 * and the filter transition owns the card wrapper. This is the same split
 * `lib/work/pageAnimation` documents, and for the same reason.
 *
 * Nothing is pinned, nothing is hijacked, no network, no canvas, no generated
 * geometry — the homepage owns all of that.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/** How far a revealing block travels, in pixels. Small on purpose. */
const LIFT = 12;

function all<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** `gsap.set` warns on an empty array, and an empty archive is not a mistake. */
function setAll(targets: Element[], vars: gsap.TweenVars): void {
  if (targets.length) gsap.set(targets, vars);
}

export interface InsightsAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

/**
 * The page's reveal. Every block — the masthead, the archive header, each card,
 * the colophon — gets its own scroll window, so a card never waits on the one
 * above it and the page cannot end up gated on its own foot.
 */
export function createInsightsAnimation({
  root,
  reducedMotion,
}: InsightsAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-in-reveal]");
    const rules = all<HTMLElement>(root, "[data-in-rule]");

    if (reducedMotion) {
      setAll(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      setAll(rules, { scaleX: 1 });
      root.dataset.inState = "static";
      return;
    }

    root.dataset.inState = "running";

    all<HTMLElement>(root, "[data-in-block]").forEach((block) => {
      const items = Array.from(block.querySelectorAll<HTMLElement>("[data-in-reveal]"));
      const rule = block.querySelector<HTMLElement>("[data-in-rule]");
      if (!items.length && !rule) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: block,
          start: "top 92%",
          end: "top 64%",
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

      // A short cascade, capped, so a card with an image, a title, an excerpt
      // and a byline does not take four times as long to resolve as a bare one.
      items.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5 },
          Math.min(0.3, i * 0.07),
        );
      });
    });

    // The brand faces change the height of every headline on this page, and the
    // pictures set the row heights, so trigger positions computed against the
    // fallback metrics are wrong until both have landed.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}

/**
 * A change of strand: the new set fades up eight pixels in a short capped
 * cascade. Not a FLIP — there is no measurement and no inverted transform, the
 * grid simply reflows and this covers the reflow.
 */
export function playInsightsFilterTransition(
  root: HTMLElement,
  reducedMotion: boolean,
): void {
  const cards = all<HTMLElement>(root, "[data-in-card]");
  if (!cards.length) return;

  if (reducedMotion) {
    setAll(cards, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    cards,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.34,
      ease: "power2.out",
      stagger: { each: 0.04, amount: 0.16 },
      overwrite: "auto",
    },
  );
}
