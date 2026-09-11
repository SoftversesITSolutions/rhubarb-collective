"use client";

/**
 * /insights/[slug] — MOTION
 * =========================
 *
 * THIS IS A READING PAGE, so the animation has one job: bring the type and the
 * pictures in, then stop and stay out of the way. It is the same gesture the
 * rest of the site uses and no more of it — a short lift behind a mask that
 * opens downward, and a hairline that draws from its left edge.
 *
 * SCRUBBED AND REVERSIBLE. Every reveal's progress is the scroll position over
 * a window a little under a third of a viewport tall. Nothing latches, nothing
 * plays once, there is no `once: true` and no separate exit animation — driving
 * the page down, up and down again puts every element back exactly where it
 * was. That is the site's standing rule for motion and it is not relaxed here.
 *
 * EVERY WINDOW CLOSES NEAR THE TOP OF THE VIEWPORT (`top 64%`), so a paragraph
 * is fully legible well before it reaches the middle of the screen. Reading
 * never waits on the animation, and text never fades back out while it is being
 * read — the failure mode that makes an animated article unreadable.
 *
 * THE HERO IS THE ONE EXCEPTION and it is not scrubbed. It is above the fold on
 * arrival, so a scroll window would resolve it at progress 1 on the first frame
 * and never actually run; it gets a real 0.6s mask instead, which is this
 * page's one moment of arrival. Same treatment, same duration, same easing as
 * the case study's hero.
 *
 * PARAGRAPHS ARE NOT ANIMATED ONE BY ONE. The cascade inside a block is capped
 * at 0.3, so a block with a heading and three paragraphs resolves in about the
 * time a bare one does rather than four times slower.
 *
 * Nothing is pinned, nothing is hijacked, there is no horizontal movement, no
 * canvas, no network and no generated geometry — the homepage owns all of that.
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

/** `gsap.set` warns on an empty array; a piece without a figure is not a bug. */
function setAll(targets: Element[], vars: gsap.TweenVars): void {
  if (targets.length) gsap.set(targets, vars);
}

export interface InsightArticleAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

export function createInsightArticleAnimation({
  root,
  reducedMotion,
}: InsightArticleAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const reveals = all<HTMLElement>(root, "[data-ia-reveal]");
    const rules = all<HTMLElement>(root, "[data-ia-rule]");
    const hero = root.querySelector<HTMLElement>("[data-ia-hero]");

    /* ---- reduced motion: the page arrives, complete ---- */
    if (reducedMotion) {
      setAll(reveals, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      setAll(rules, { scaleX: 1 });
      if (hero) gsap.set(hero, { clipPath: CLIP_OPEN });
      root.dataset.iaState = "static";
      return;
    }

    root.dataset.iaState = "running";

    /* ---- the hero: the page's one arrival ---- */
    if (hero) {
      gsap.fromTo(
        hero,
        { clipPath: CLIP_CLOSED },
        { clipPath: CLIP_OPEN, duration: 0.6, ease: "power2.out" },
      );
    }

    /* ---- everything else: one scrubbed window per block ---- */
    all<HTMLElement>(root, "[data-ia-block]").forEach((block) => {
      const items = Array.from(block.querySelectorAll<HTMLElement>("[data-ia-reveal]"));
      const rule = block.querySelector<HTMLElement>("[data-ia-rule]");
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

      items.forEach((el, i) => {
        tl.fromTo(
          el,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5 },
          Math.min(0.3, i * 0.07),
        );
      });
    });

    // The brand faces change the height of every line on this page and the
    // pictures set the block heights, so trigger positions computed against the
    // fallback metrics are wrong until both have landed.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}
