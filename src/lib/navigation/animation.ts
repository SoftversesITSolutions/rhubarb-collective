"use client";

/**
 * GLOBAL MENU — ANIMATION
 *
 * ONE TIMELINE, BUILT ONCE, PLAYED FORWARD AND REVERSED.
 *
 * Everything else on this site is scroll-scrubbed; the menu is the one thing
 * driven by a click, so it is the one place a play/reverse timeline is right.
 * The important property is the same either way: there is exactly one timeline
 * instance for the life of the component, so OPEN → CLOSE → OPEN → CLOSE can be
 * hammered without stacking tweens, leaking timelines or latching a half-open
 * state. Closing is literally the opening run backwards, which is why the two
 * can never disagree about where an element rests.
 *
 * Close runs faster than open (see CLOSE_SCALE) because a reader who has decided
 * to leave should not have to watch the arrival again in full.
 *
 * The trigger's own two rules are part of this timeline rather than a separate
 * CSS transition, so the icon can never be an X while the overlay is shut.
 */

import gsap from "gsap";

export interface MenuTimelineTargets {
  overlay: HTMLElement;
  /** The field the links sit in, lifted very slightly as it settles. */
  panel: HTMLElement;
  links: HTMLElement[];
  /** The footnote and any other secondary text, revealed last. */
  tail: HTMLElement[];
  /** The trigger's two hairlines, in DOM order: upper, lower. */
  bars: HTMLElement[];
}

/** How much faster the close runs than the open. */
export const CLOSE_SCALE = 1.45;

/**
 * Builds the paused open timeline.
 *
 * Total forward duration is ~1.15s — inside the 1–2s the brief asks for, and
 * short enough that the sixth link is never something you wait for.
 */
export function createMenuTimeline({
  overlay,
  panel,
  links,
  tail,
  bars,
}: MenuTimelineTargets): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  // The field opens first. `autoAlpha` carries `visibility` with the opacity, so
  // a closed overlay is genuinely hidden — out of the tab order and inert —
  // rather than a transparent sheet sitting over the page.
  tl.fromTo(
    overlay,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.34, ease: "power2.out" },
    0,
  );

  // A very small settle on the whole stack. Not a zoom — 8px and 0.6% — just
  // enough that the type arrives rather than switching on.
  tl.fromTo(
    panel,
    { y: 8, scale: 0.994 },
    { y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
    0.06,
  );

  // The links, in reading order. A clip that opens downward plus a short lift:
  // the same grammar the homepage sections use for their own reveals, so the
  // menu reads as part of the same system rather than as a bolted-on widget.
  tl.fromTo(
    links,
    { yPercent: 105, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.62,
      ease: "power3.out",
      stagger: 0.075,
    },
    0.14,
  );

  tl.fromTo(
    tail,
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.06 },
    0.6,
  );

  // The trigger's hairlines cross. Small, quick and part of the same run, so the
  // icon state and the overlay state cannot drift apart.
  if (bars.length === 2) {
    tl.to(bars[0], { y: 3, rotate: 45, duration: 0.32, ease: "power2.inOut" }, 0);
    tl.to(bars[1], { y: -3, rotate: -45, duration: 0.32, ease: "power2.inOut" }, 0);
  }

  return tl;
}

/**
 * REDUCED MOTION uses this same timeline rather than a parallel set of
 * `gsap.set` calls: jumping its progress to either end applies exactly the
 * states the animated path would have arrived at, so the two can never drift
 * apart as the timeline changes. The menu behaves identically — it simply
 * arrives already open, with nothing hidden behind an animation that never ran.
 */
export function jumpMenuTo(tl: gsap.core.Timeline, open: boolean): void {
  tl.pause();
  tl.progress(open ? 1 : 0, true);
}
