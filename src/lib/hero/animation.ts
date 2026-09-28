"use client";

/**
 * HERO ANIMATION ORCHESTRATION
 * ============================
 *
 * One entry point, one gsap.context, one ScrollTrigger. Everything the hero
 * does is expressed as either:
 *
 *   OPENING    — autonomous, plays once on load. The void, the mark, then
 *                the seed it lifts away from.
 *   NARRATIVE  — a single scrubbed timeline of normalised duration 1, pinned.
 *                All ten storyboard phases are positions on this one timeline,
 *                so pacing is retuned by editing BEATS in ./config.
 *   AMBIENT    — two very slow looping tweens. Enough for the system to read as
 *                alive while it waits, not enough to compete with scroll.
 *
 * Opacity convention: every element's *designed* opacity lives on an SVG
 * presentation attribute (stroke-opacity / fill-opacity) and the timeline only
 * ever animates CSS opacity on top of it. The two multiply, so the animation
 * never has to know a target's art-directed value.
 *
 * Cleanup is delegated to gsap.context().revert(), which also kills the
 * ScrollTrigger and restores every inline style — so a hot reload or a
 * breakpoint change cannot leave a duplicate trigger or a stuck transform
 * behind.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BEATS, LOGO_INTRO, SCROLL_LENGTH, type Tier } from "./config";
import type { OrganicNetwork } from "./network";

/**
 * The opening plays once per page life. A breakpoint change rebuilds the whole
 * hero (new network, new timeline) and must not replay it; a reload does.
 */
let openingPlayed = false;

export interface HeroAnimationOptions {
  /** Section that owns the scroll distance. */
  root: HTMLElement;
  /** Viewport-height element that gets pinned. */
  stage: HTMLElement;
  network: OrganicNetwork;
  tier: Tier;
  reducedMotion: boolean;
}

type Beat = { readonly start: number; readonly end: number };

/** Maps a 0..1 value from the generator onto a slice of the scroll timeline. */
function onBeat(value: number, beat: Beat): number {
  return beat.start + value * (beat.end - beat.start);
}

function span(beat: Beat): number {
  return beat.end - beat.start;
}

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export function createHeroAnimation({
  root,
  stage,
  network,
  tier,
  reducedMotion,
}: HeroAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  let cancelled = false;
  const teardown: Array<() => void> = [];

  const ctx = gsap.context(() => {
    /* ---- elements ---------------------------------------------------- */
    const branches = all<SVGPathElement>(root, "[data-branch]");
    const nodes = all<SVGGElement>(root, "[data-node]");
    const halftoneGroups = all<SVGGElement>(root, "[data-halftone]");
    const halftoneDots = all<SVGCircleElement>(root, "[data-halftone] circle");
    const descenders = all<SVGPathElement>(root, "[data-descender]");

    const seed = one<SVGGElement>(root, "[data-seed]");
    const seedCore = one<SVGCircleElement>(root, "[data-seed-core]");
    const seedRing = one<SVGCircleElement>(root, "[data-seed-ring]");
    const ambientLayer = one<SVGGElement>(root, "[data-layer='ambient']");
    const growthLayer = one<SVGGElement>(root, "[data-layer='growth']");
    const behindLayer = one<SVGGElement>(root, "[data-layer='behind']");

    const logo = one<HTMLElement>(root, "[data-hero='logo']");
    const lockupMark = one<HTMLElement>(root, "[data-hero='logo-mark']");
    const introRoot = one<HTMLElement>(root, "[data-hero='intro']");
    const introMark = one<HTMLElement>(root, "[data-hero='intro-mark']");
    const introImg = one<HTMLImageElement>(root, "[data-hero='intro-img']");
    const introWordline = one<HTMLElement>(root, "[data-hero='intro-wordline']");
    const eyebrow = one<HTMLElement>(root, "[data-hero='eyebrow']");
    const rule = one<HTMLElement>(root, "[data-hero='rule']");
    const headlineLines = all<HTMLElement>(root, "[data-hero='headline-line']");
    const support = all<HTMLElement>(root, "[data-hero='support-line']");
    const cue = one<HTMLElement>(root, "[data-hero='cue']");
    const cueMark = one<HTMLElement>(root, "[data-hero='cue-mark']");
    const boundary = one<HTMLElement>(root, "[data-hero='boundary']");

    // The logo is not in here: the opening owns it until the hand-off.
    const copy = [eyebrow, ...support].filter(
      (el): el is HTMLElement => el !== null,
    );
    // SVG coordinates, not a CSS transform-origin: for SVG elements GSAP reads
    // transformOrigin relative to the element's own bounding box, which put
    // the scale's centre well below the field and lifted every strand on the
    // narrow tiers. svgOrigin is the seed itself, in field units.
    const origin = `${network.seedPoint.x} ${network.seedPoint.y}`;

    /* ---- resting state ------------------------------------------------ *
     * The final frame of the whole narrative, and the entire experience when
     * motion is reduced: fully grown network, all copy in place.            */
    if (reducedMotion) {
      gsap.set(branches, { strokeDashoffset: 0 });
      gsap.set(descenders, { strokeDashoffset: 0 });
      gsap.set([...nodes, ...halftoneDots], { opacity: 1 });
      gsap.set(behindLayer, { opacity: 0.3 });
      gsap.set([seed, seedCore], { opacity: 1 });
      gsap.set(seedRing, { opacity: 1 });
      gsap.set([...copy, ...headlineLines], { opacity: 1 });
      // No opening under reduced motion: the mark is simply present in its
      // lockup from the first frame. The message stays, the movement goes.
      gsap.set(logo, { opacity: 1 });
      gsap.set(introRoot, { display: "none" });
      gsap.set(boundary, { opacity: 1 });
      gsap.set(rule, { opacity: 1 });
      // THE CUE STAYS VISIBLE HERE. It used to be set to opacity 0 in the
      // reduced-motion branch, which meant the readers least likely to have
      // motion telling them the page continues were also the only ones given no
      // instruction at all — they got a near-black screen and nothing else.
      // Reduced motion should remove the movement, never the message, so the
      // cue is shown at rest and only its travelling mark is held still.
      gsap.set(cue, { opacity: 1, y: 0 });
      gsap.set(cueMark, { yPercent: 0 });
      root.dataset.heroState = "static";
      return;
    }

    root.dataset.heroState = "running";

    /* ---- initial state ------------------------------------------------ */
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(halftoneDots, { opacity: 0 });
    gsap.set(seed, { opacity: 1, transformOrigin: "50% 50%" });
    gsap.set(seedCore, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(seedRing, { scale: 0.15, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set([growthLayer, ambientLayer], { svgOrigin: origin });
    gsap.set(headlineLines, { yPercent: 108, opacity: 1 });
    gsap.set(copy, { opacity: 0, y: 14 });
    // Hidden, and deliberately *not* offset like the other copy: the opening
    // measures this box to know where to land, so it must be transform-free.
    gsap.set(logo, { opacity: 0 });
    gsap.set(introImg, { "--wipe": "0%" });
    gsap.set(introWordline, { opacity: 0, y: 6 });
    gsap.set(introMark, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
    gsap.set(rule, { opacity: 0, scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(boundary, { opacity: 0 });
    gsap.set(cue, { opacity: 0, y: 10 });
    // Parked above its rule so the first fall enters from the top rather than
    // popping into the middle of the track.
    gsap.set(cueMark, { yPercent: -100 });

    /* =================================================================== *
     * PHASE 00–02 — OPENING: the void, the mark, then the seed
     *
     * Time-based, not scrubbed. The mark wipes in centre-stage, its wordline
     * follows, it holds, then it glides into the lockup and the seed is born
     * beneath it as it lifts away. Clock values live in LOGO_INTRO.
     * =================================================================== */
    const T = LOGO_INTRO;
    const wipeAt = T.void;
    const wordlineAt = wipeAt + T.wipe - T.wordlineLead;
    const travelAt = Math.max(wipeAt + T.wipe, wordlineAt + T.wordline) + T.hold;
    const travelEnd = travelAt + T.travel;
    const seedAt = travelAt + T.travel * T.seedOverlap;

    // Where the mark is going: the lockup logo's box. Measured when the travel
    // starts rather than now, so it reads the settled layout. Both boxes live
    // in the pinned stage, so the delta between their client rects is immune
    // to whatever ScrollTrigger does to the stage, and neither carries a
    // transform at that moment — which is why the lockup logo is excluded
    // from the reveal offsets above.
    let flight: { x: number; y: number; scale: number } | null = null;
    const measureFlight = () => {
      if (!flight) {
        const from = introMark?.getBoundingClientRect();
        const to = lockupMark?.getBoundingClientRect();
        flight =
          from && to
            ? { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width }
            : { x: 0, y: 0, scale: 1 };
      }
      return flight;
    };

    const opening = gsap.timeline({
      paused: true,
      onComplete: () => {
        openingPlayed = true;
      },
    });
    opening
      .to(introImg, { "--wipe": "112%", duration: T.wipe, ease: "power2.inOut" }, wipeAt)
      .to(
        introWordline,
        { opacity: 1, y: 0, duration: T.wordline, ease: "power2.out" },
        wordlineAt,
      )
      // Function-based values resolve on the tween's first render, i.e. when
      // the playhead reaches it — that is what makes the late measurement work.
      .to(
        introMark,
        {
          x: () => measureFlight().x,
          y: () => measureFlight().y,
          scale: () => measureFlight().scale,
          duration: T.travel,
          ease: "power3.inOut",
        },
        travelAt,
      )
      // The hand-off: the lockup's own logo takes over in the frame the
      // travelling copy lands on it, and the opening layer leaves the page.
      .set(logo, { opacity: 1 }, travelEnd)
      .set(introRoot, { display: "none" }, travelEnd)
      // The seed is born under the mark as it lifts away.
      .to(seedCore, { scale: 1, opacity: 1, duration: 1.5, ease: "expo.out" }, seedAt)
      .to(seedRing, { scale: 1.5, opacity: 1, duration: 2.4, ease: "power2.out" }, seedAt + 0.25)
      .to(cue, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, seedAt + 1.3)
      // The breathe only starts once the seed has finished arriving, so the two
      // tweens never contend for the same property.
      .add(() => {
        gsap.to(seedCore, {
          scale: 1.14,
          duration: 6.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // The mark falls down its rule, pauses, and falls again. This is the
        // one repeating tween in the hero besides the seed's breathe, and it
        // earns the exception: on a black opening screen a static label is easy
        // to read past, and motion in the direction of travel is what actually
        // answers "is there anything below this?". It is slow and small enough
        // to stay ambient, it never competes with the headline, and the scrub
        // below fades the whole cue out the moment the reader takes the hint.
        gsap.fromTo(
          cueMark,
          { yPercent: -100 },
          {
            yPercent: 240,
            duration: 1.9,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 0.7,
          },
        );
      });

    // Reader intent always wins. Any scroll during the opening jumps it to its
    // end state (callbacks included) so the scrubbed narrative never fights
    // it; a restored scroll position or a second build in this page life skips
    // it outright. The one thing the opening waits for is its own image, and
    // only for so long — a slow network must not hold the hero hostage.
    const skipOpening = () => {
      if (opening.progress() < 1) opening.progress(1);
    };
    if (openingPlayed || window.scrollY > 0) {
      skipOpening();
    } else {
      const loaded =
        introImg && !introImg.complete
          ? new Promise<void>((resolve) => {
              introImg.addEventListener("load", () => resolve(), { once: true });
              introImg.addEventListener("error", () => resolve(), { once: true });
            })
          : Promise.resolve();
      const patience = new Promise<void>((resolve) => {
        setTimeout(resolve, T.imageTimeout * 1000);
      });
      Promise.race([loaded, patience]).then(() => {
        if (!cancelled && opening.progress() < 1) opening.play();
      });

      const intents = ["scroll", "wheel", "touchmove"] as const;
      intents.forEach((type) => window.addEventListener(type, skipOpening, { passive: true }));
      teardown.push(() => {
        intents.forEach((type) => window.removeEventListener(type, skipOpening));
      });
    }

    /* =================================================================== *
     * PHASE 03–10 — the scrubbed narrative
     * =================================================================== */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${window.innerHeight * SCROLL_LENGTH[tier]}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.85,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    // Fixes the timeline's total length at exactly 1 so every position below
    // reads as a fraction of the scroll journey.
    tl.to({}, { duration: 1 }, 0);
    tl.to(cue, { opacity: 0, duration: 0.05, ease: "power1.in" }, 0);

    /* --- PHASE 03–04: organic growth, then network formation ------------ */
    // Each branch draws in at the moment its parent's tip reaches it, so the
    // system genuinely propagates outward instead of fading in as a picture.
    branches.forEach((el) => {
      const start = onBeat(Number(el.dataset.start), BEATS.growth);
      const duration = Math.max(0.01, Number(el.dataset.duration) * span(BEATS.growth));
      tl.to(el, { strokeDashoffset: 0, duration, ease: "power1.out" }, start);
    });

    nodes.forEach((el) => {
      const at = onBeat(Number(el.dataset.at), BEATS.growth);
      tl.to(el, { scale: 1, opacity: 1, duration: 0.03, ease: "power2.out" }, at);
    });

    halftoneGroups.forEach((group) => {
      const at = Math.min(onBeat(Number(group.dataset.at), BEATS.growth), 0.94);
      tl.to(
        Array.from(group.querySelectorAll("circle")),
        {
          opacity: 1,
          duration: 0.02,
          ease: "power1.out",
          stagger: { amount: 0.04, from: "start" },
        },
        at,
      );
    });

    // The seed recedes as the wider system takes over from it.
    tl.to(seed, { scale: 0.7, duration: 0.24, ease: "sine.inOut" }, BEATS.growth.start + 0.2);
    tl.to(seedRing, { opacity: 0.35, duration: 0.2, ease: "sine.out" }, BEATS.growth.start + 0.2);

    /* --- PHASE 05 used to be the logo arriving here. The opening now leaves
       it in the lockup before the first scroll, so the beat is gone. -------- */

    /* --- PHASE 06: the positioning statement ---------------------------- */
    tl.to(
      rule,
      { opacity: 1, scaleX: 1, duration: span(BEATS.eyebrow) * 0.8, ease: "power2.out" },
      BEATS.eyebrow.start,
    );
    tl.to(
      eyebrow,
      { opacity: 1, y: 0, duration: span(BEATS.eyebrow), ease: "power2.out" },
      BEATS.eyebrow.start + 0.02,
    );

    /* --- PHASE 07: the main statement ----------------------------------- */
    // Line-by-line mask reveal. The lines are real HTML inside a clipped block,
    // so nothing here costs the text its selectability or its semantics.
    headlineLines.forEach((line, i) => {
      tl.to(
        line,
        { yPercent: 0, duration: span(BEATS.headline) * 0.52, ease: "expo.out" },
        BEATS.headline.start + i * (span(BEATS.headline) * 0.16),
      );
    });

    /* --- PHASE 09: supporting message ----------------------------------- */
    tl.to(
      support,
      {
        opacity: 1,
        y: 0,
        duration: span(BEATS.support) * 0.8,
        ease: "power2.out",
        stagger: span(BEATS.support) * 0.18,
      },
      BEATS.support.start,
    );

    /* --- PHASE 08: the ecosystem reorganises around the message --------- */
    const interaction = span(BEATS.interaction);

    // Strands running under the type step back so the headline stays dominant.
    tl.to(
      behindLayer,
      { opacity: 0.22, duration: interaction * 0.55, ease: "sine.inOut" },
      BEATS.interaction.start,
    );

    // The layer itself no longer moves during this phase. It used to scale
    // 7.5% about the seed and lift, which dragged strands that were grown to
    // clear the copy back across it — the generator cannot know about a
    // transform applied after the fact. The reorganisation is carried by the
    // strands and nodes below instead, so the settled composition is exactly
    // the measured one.

    // A deterministic subset of tertiary growth recedes: the network is not a
    // static drawing that finished, it keeps rearranging itself.
    const receding = branches.filter(
      (el, i) => Number(el.dataset.depth) >= 2 && i % 3 === 1,
    );
    tl.to(
      receding,
      {
        opacity: 0.22,
        duration: interaction * 0.4,
        ease: "sine.inOut",
        stagger: { amount: interaction * 0.3 },
      },
      BEATS.interaction.start + interaction * 0.15,
    );

    // …while the junctions nearest the type gain weight.
    const emphasis = nodes.filter(
      (el) => el.dataset.kind === "junction" && Number(el.dataset.depth) <= 1,
    );
    tl.to(
      emphasis,
      {
        scale: 1.45,
        duration: interaction * 0.5,
        ease: "sine.inOut",
        stagger: { amount: interaction * 0.35 },
      },
      BEATS.interaction.start + interaction * 0.1,
    );

    /* --- PHASE 10: handoff into the next section ------------------------ */
    const handoff = span(BEATS.handoff);
    // The layer does not move here either. Even a straight sink of 6% carried
    // strands into the supporting copy on tablet; the continuation is told by
    // the boundary band and the descenders below, which is where it belongs.
    tl.to(
      boundary,
      { opacity: 1, duration: handoff * 0.6, ease: "power2.out" },
      BEATS.handoff.start,
    );
    tl.to(
      descenders,
      {
        strokeDashoffset: 0,
        duration: handoff * 0.85,
        ease: "power1.out",
        stagger: { amount: handoff * 0.3 },
      },
      BEATS.handoff.start + handoff * 0.1,
    );

    /* =================================================================== *
     * AMBIENT — barely-there life while the page waits
     * =================================================================== */
    // Kept very small: it scales about the seed, so the far side of the field
    // moves most, and strands sit within a few pixels of the copy there.
    gsap.to(ambientLayer, {
      scale: 1.006,
      duration: 17,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Loading the brand faces changes line boxes, which changes the pin length.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, root);

  return () => {
    cancelled = true;
    teardown.forEach((fn) => fn());
    ctx.revert();
  };
}
