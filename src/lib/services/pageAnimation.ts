"use client";

/**
 * /SERVICES — MOTION
 * ==================
 *
 * The quietest of the four inner routes. This page's whole subject is six
 * headings and what is written under them, so the animation's only job is to
 * bring type in and then get out of the way.
 *
 * ONE GESTURE, and it is the site's: a short lift with a mask that opens
 * downward, plus a hairline that draws from its left edge. Nothing is pinned,
 * nothing is scaled or rotated, nothing moves sideways, no scroll is hijacked
 * and there is no network, canvas or generated geometry on this route at all.
 *
 * SCRUBBED AND REVERSIBLE. Every reveal is a `fromTo` whose progress is the
 * scroll position, over a window a third of a viewport tall. Nothing latches,
 * nothing uses `once`, there is no exit animation — so the state at any scroll
 * position is the same whichever direction the reader arrived from.
 *
 * THE DISCLOSURE IS NOT ANIMATED HERE, and that is deliberate. Opening an entry
 * is a CSS grid-template-rows transition on the panel (see `services-page.css`)
 * — no measurement, no `height: auto` tween, no ResizeObserver, no GSAP. A
 * scrubbed timeline and an interaction that changes the document's height must
 * not both be writing to the same element, and the browser does this one
 * correctly on its own.
 *
 * WHAT IT DOES OWE THE DISCLOSURE is a refresh: opening an entry moves every
 * trigger below it. `refreshTriggers` is exported for that, debounced to the
 * end of the transition.
 *
 * WHY THIS IS NOT `lib/work/pageAnimation` OR `lib/contact/pageAnimation`. It
 * is closer to /contact's flat pass than to anything else, and the honest
 * answer is that a shared module should now be lifted out of /contact and this
 * page — they run the same gesture over the same attribute shape. It is not
 * done here because /contact is approved and closed, and reopening an approved
 * route to serve a new one is how a working page acquires a regression. The
 * moment /contact is next edited for its own reasons, these two should merge.
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

/** `gsap.set` warns on an empty array; an empty section is not a mistake. */
function setAll(targets: Element[], vars: gsap.TweenVars): void {
  if (targets.length) gsap.set(targets, vars);
}

export interface ServicesAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

export function createServicesAnimation({
  root,
  reducedMotion,
}: ServicesAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-sv-reveal]");
    const rules = all<HTMLElement>(root, "[data-sv-rule]");

    /* ---- the resting state, and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      setAll(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      setAll(rules, { scaleX: 1, scaleY: 1 });
      root.dataset.svState = "static";
      return;
    }

    root.dataset.svState = "running";

    /*
     * A block is a heading with its lines, or one entry in the index. Each gets
     * its own scroll window, so an entry never waits on the one below it and
     * the page cannot end up gated on its own foot.
     */
    all<HTMLElement>(root, "[data-sv-block]").forEach((block) => {
      const items = Array.from(block.querySelectorAll<HTMLElement>("[data-sv-reveal]"));
      const rule = block.querySelector<HTMLElement>("[data-sv-rule]");
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

    /*
     * THE SPINE.
     *
     * The one continuous vertical rule the six numbers sit on — the page's
     * argument that the disciplines are one practice rather than six products.
     * It draws downward across the whole index rather than per entry, which is
     * the only reveal on this page that is not scoped to a block.
     */
    const spine = root.querySelector<HTMLElement>("[data-sv-spine]");
    const index = root.querySelector<HTMLElement>("[data-sv-index]");
    if (spine && index) {
      gsap.fromTo(
        spine,
        { scaleY: 0, transformOrigin: "50% 0%" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: index,
            start: "top 80%",
            end: "bottom 85%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    // The brand faces change the height of every line on this page, so trigger
    // positions computed against the fallback metrics are wrong until they land.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}

/**
 * Opening or closing an entry changes the height of everything below it, so
 * every trigger past that point is measuring against a stale position. Called
 * once the panel's transition has finished rather than on every frame of it —
 * a refresh per frame would be recomputing the whole page 60 times to land in
 * the same place.
 */
export function refreshServiceTriggers(): void {
  ScrollTrigger.refresh();
}
