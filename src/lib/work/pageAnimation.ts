"use client";

/**
 * /WORK — MOTION
 * ==============
 *
 * The least decorated motion on the site, and the only page whose content
 * changes underneath its own timeline.
 *
 * THREE JOBS, DELIBERATELY SEPARATE:
 *
 *   1  the intro     the eyebrow, WORK, the statement, the rule and the filter
 *                    row. A short timeline on mount — not a scroll window.
 *   2  the pieces    one scrubbed window each, the site's usual gesture.
 *   3  the filter    a fast fade-and-lift when the visible set changes.
 *
 * WHY THE INTRO IS NOT SCRUBBED, when /about and /contact scrub theirs. On those
 * pages the masthead sits above the first scroll window's start, so its progress
 * is already 1 on the first frame and it simply appears — the scrub is real code
 * that never runs. This page is asked for an entrance, so it gets one honestly:
 * 0.5s, three elements, no stagger longer than the sentence takes to read.
 *
 * WHY 2 AND 3 CANNOT SHARE AN ELEMENT. A scrubbed reveal owns its target's
 * opacity for the whole length of its window, and a filter change is not a
 * scroll event — if both wrote opacity on the same node, filtering while
 * mid-window would hand the element back to the scroll position and undo the
 * transition on the next frame. So the two are given different elements: the
 * scrub owns the frame's clip-path and the caption's opacity, and the filter
 * transition owns the piece wrapper around them. Neither ever touches the
 * other's property.
 *
 * NOTHING IS PINNED, nothing is hijacked, no ScrollTrigger scrubs the page
 * itself, and there is no network, canvas or generated geometry on this route at
 * all — that is the homepage's, and it stays there.
 *
 * WHY THIS IS NOT `lib/contact/pageAnimation`. That module's header says a
 * shared module should be lifted out of both quiet pages when a third appears.
 * This is the third, and it still should not be: it is the first page whose DOM
 * changes under the timeline, so it needs a rebuildable archive context and a
 * state transition that neither existing page has any use for. Lifting the flat
 * pass out of /about and /contact to serve it would mean reopening two approved
 * routes to add a concept neither of them has.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

/** How far a revealing element travels, in pixels. Small on purpose. */
const LIFT = 12;

function all<T extends Element>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/**
 * `gsap.set` on an empty array logs "GSAP target not found" — a real warning for
 * a real mistake everywhere else, and pure noise here: a reduced-motion pass
 * runs before the reader has filtered anything and can legitimately find no
 * pieces to resolve. Guarding keeps the console meaningful.
 */
function setAll(targets: Element[], vars: gsap.TweenVars): void {
  if (targets.length) gsap.set(targets, vars);
}

/* ------------------------------------------------------------------ *
 * 1 — THE INTRO
 * ------------------------------------------------------------------ */

export interface WorkIntroOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

/**
 * Heading, then statement, then filter row. Runs once on mount and never again.
 *
 * It also flips `data-wk-state` off "idle", which is what releases the resting
 * state that ships in the server HTML — including the resting state of the
 * pieces, so a failure to reach the archive reveal can never leave the work
 * invisible.
 */
export function createWorkIntro({ root, reducedMotion }: WorkIntroOptions): () => void {
  const ctx = gsap.context(() => {
    const items = all<HTMLElement>(root, "[data-wk-intro]");
    const rules = all<HTMLElement>(root, "[data-wk-rule]");

    if (reducedMotion) {
      setAll(items, { clipPath: CLIP_OPEN, opacity: 1, y: 0 });
      setAll(rules, { scaleX: 1 });
      root.dataset.wkState = "static";
      return;
    }

    root.dataset.wkState = "running";

    if (!items.length && !rules.length) return;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (items.length) {
      tl.fromTo(
        items,
        { clipPath: CLIP_CLOSED, opacity: 0.001, y: LIFT },
        { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.5, stagger: 0.07 },
        0,
      );
    }

    if (rules.length) {
      tl.fromTo(
        rules,
        { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 0.5, ease: "power2.inOut" },
        0.08,
      );
    }
  }, root);

  return () => ctx.revert();
}

/* ------------------------------------------------------------------ *
 * 2 — THE ARCHIVE
 * ------------------------------------------------------------------ */

export interface WorkArchiveOptions {
  /** The grid. Rebuilt whenever the filtered set changes. */
  root: HTMLElement;
  reducedMotion: boolean;
}

/**
 * One scrubbed window per piece: the frame's mask opens downward and the
 * caption lifts under it, over a window a third of a viewport tall.
 *
 * Scrubbed and reversible, like every other reveal on the site — the state at
 * any scroll position is the same whichever direction you arrived from, nothing
 * latches, and there is no exit animation. The window closes near the top of the
 * viewport, so a picture is fully resolved well before it reaches the middle of
 * the screen and browsing never waits on the animation.
 *
 * Rebuilt on every filter change rather than diffed. Six triggers is nothing to
 * recreate, and a diff would be a FLIP system in all but name.
 */
export function createWorkArchiveReveal({
  root,
  reducedMotion,
}: WorkArchiveOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const pieces = all<HTMLElement>(root, "[data-wk-piece]");

    if (reducedMotion) {
      setAll(all(root, "[data-wk-frame]"), { clipPath: CLIP_OPEN });
      setAll(all(root, "[data-wk-meta]"), { opacity: 1, y: 0 });
      return;
    }

    pieces.forEach((piece) => {
      const frame = piece.querySelector<HTMLElement>("[data-wk-frame]");
      const meta = piece.querySelector<HTMLElement>("[data-wk-meta]");
      if (!frame && !meta) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: piece,
          start: "top 92%",
          end: "top 62%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      if (frame) {
        tl.fromTo(frame, { clipPath: CLIP_CLOSED }, { clipPath: CLIP_OPEN, duration: 0.6 }, 0);
      }
      if (meta) {
        tl.fromTo(
          meta,
          { opacity: 0.001, y: LIFT },
          { opacity: 1, y: 0, duration: 0.45 },
          0.18,
        );
      }
    });

    // The brand faces change the height of every caption on this page, and the
    // pictures are what set the row heights, so trigger positions computed
    // against fallback metrics are wrong until both have landed.
    if (document.fonts?.status !== "loaded") {
      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
  }, root);

  return () => ctx.revert();
}

/* ------------------------------------------------------------------ *
 * 3 — THE FILTER TRANSITION
 * ------------------------------------------------------------------ */

/**
 * What a change of industry looks like: the new set fades up eight pixels, in a
 * short capped cascade. 0.34s, so it is finished before a reader has moved their
 * eye down the page.
 *
 * NOT A FLIP. There is no measurement, no inverted transform and no shared-layout
 * bookkeeping — the grid simply reflows, and this covers the reflow. That is the
 * whole of the brief for this interaction, and a real FLIP system on six items
 * would be more code than the archive it animates.
 *
 * Under reduced motion it sets the resting state and returns, so the change is
 * instant and complete rather than absent.
 */
export function playWorkFilterTransition(root: HTMLElement, reducedMotion: boolean): void {
  const pieces = all<HTMLElement>(root, "[data-wk-piece]");
  if (!pieces.length) return;

  if (reducedMotion) {
    setAll(pieces, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    pieces,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.34,
      ease: "power2.out",
      // Capped, so filtering to six pieces does not take six times as long to
      // settle as filtering to one.
      stagger: { each: 0.04, amount: 0.16 },
      overwrite: "auto",
    },
  );
}
