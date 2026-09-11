"use client";

/**
 * CASE STUDY — MOTION
 *
 * A reading page, so the animation's only job is to bring type and pictures in
 * and then stop. One gesture, the site's: a short lift with a mask that opens
 * downward, and a hairline that draws from its left edge.
 *
 * SCRUBBED AND REVERSIBLE. Every reveal's progress is the scroll position, over
 * a window a third of a viewport tall. Nothing latches, nothing plays once,
 * there is no exit animation, and every window closes near the top of the
 * viewport — so a paragraph is fully legible long before it reaches the middle
 * of the screen and reading never waits on the animation.
 *
 * THE HERO IS THE ONE EXCEPTION, and it is not scrubbed. It is above the fold
 * on arrival, so a scroll window would resolve it at progress 1 on the first
 * frame and never actually run; it gets a real 0.6s mask instead, which is the
 * one moment of arrival this page is allowed.
 *
 * Nothing is pinned, nothing is hijacked, there is no horizontal movement and
 * no network, canvas or generated geometry — the homepage owns all of that.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const LIFT = 12;

function all<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** `gsap.set` warns on an empty array; an absent section is not a mistake. */
function setAll(targets: Element[], vars: gsap.TweenVars): void {
  if (targets.length) gsap.set(targets, vars);
}

export interface CaseStudyAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

export function createCaseStudyAnimation({
  root,
  reducedMotion,
}: CaseStudyAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-cs-reveal]");
    const rules = all<HTMLElement>(root, "[data-cs-rule]");
    const hero = root.querySelector<HTMLElement>("[data-cs-hero]");

    if (reducedMotion) {
      setAll(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      setAll(rules, { scaleX: 1 });
      if (hero) gsap.set(hero, { clipPath: CLIP_OPEN });
      root.dataset.csState = "static";
      return;
    }

    root.dataset.csState = "running";

    /* ---- the hero: the page's one arrival ---- */
    if (hero) {
      gsap.fromTo(
        hero,
        { clipPath: CLIP_CLOSED },
        { clipPath: CLIP_OPEN, duration: 0.6, ease: "power2.out" },
      );
    }

    /* ---- everything else: one scrubbed window per block ---- */
    all<HTMLElement>(root, "[data-cs-block]").forEach((block) => {
      const items = Array.from(block.querySelectorAll<HTMLElement>("[data-cs-reveal]"));
      const rule = block.querySelector<HTMLElement>("[data-cs-rule]");
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

      // Capped, so a section with a label, a heading and two paragraphs does
      // not take four times as long to resolve as a bare one.
      items.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5 },
          Math.min(0.3, i * 0.07),
        );
      });
    });

    // The brand faces change the height of every line here, and the pictures
    // set the section heights, so triggers computed against fallback metrics
    // are wrong until both have landed.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}
