"use client";

/**
 * FIRST GROWTH — ANIMATION
 * ========================
 *
 * The hero's verb is GROWTH and it earns a pinned, scrubbed narrative. This
 * section's verb is CONNECTION and it is deliberately quieter:
 *
 *   • The section is read through, not held — with one exception: it overlaps
 *     the hero's dive (see DIVE in lib/hero/config) and holds still beneath
 *     the stage for exactly that stretch, coming toward the reader as the
 *     hero's black lifts. Nothing below it moves: the overlap equals the hold
 *     plus the hero's extra pin.
 *   • One scrubbed trigger drives the network across the section's own pass
 *     through the viewport, starting as it is revealed.
 *   • Copy arrives on its own entrance triggers, unscrubbed, so reading is
 *     never tied to scroll velocity.
 *   • There are no ambient loops at all.
 *
 * Motion is split by role, which is what keeps this from being the hero again:
 *   arriving strands  — stroke draw, because they genuinely continue from above
 *   the rest          — resolve in place, because they are already there
 *   the ridgelines    — resolve line by line as the spine reaches them, then a
 *                       swell travels down the stack with scroll (the pulsar's
 *                       ripple), scrubbed and reversible
 *   the Work strand   — takes over at the end as the route onward
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DIVE, DIVE_LENGTH, type Tier } from "@/lib/hero/config";
import type { OrganicNetwork } from "@/lib/hero/network";
import { FG_BEATS } from "./config";
import { ridgePath, swell, type RidgeField } from "./ridgelines";

export interface FirstGrowthAnimationOptions {
  root: HTMLElement;
  network: OrganicNetwork;
  ridges: RidgeField | null;
  tier: Tier;
  reducedMotion: boolean;
}

type Beat = { readonly start: number; readonly end: number };

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

export function createFirstGrowthAnimation({
  root,
  network,
  ridges,
  reducedMotion,
}: FirstGrowthAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const branches = all<SVGPathElement>(root, "[data-fg-branch]");
    const arriving = branches.filter((el) => el.dataset.depth === "0");
    const settling = branches.filter((el) => el.dataset.depth !== "0");
    const nodes = all<SVGGElement>(root, "[data-fg-node]");
    const connections = all<SVGPathElement>(root, "[data-fg-connection]");
    const leaders = all<SVGLineElement>(root, "[data-fg-leader]");
    const drift = one<SVGGElement>(root, "[data-fg-layer='drift']");
    const workBranch = one<SVGPathElement>(root, "[data-fg-branch][data-work]");
    const boundary = one<HTMLElement>(root, "[data-fg='boundary']");
    const ridgePaths = all<SVGPathElement>(root, "[data-fg-ridge]");
    const ridgeNodes = all<SVGGElement>(root, "[data-fg-ridge-node]");

    const stage = one<HTMLElement>(root, "[data-fg='stage']");
    const marker = one<HTMLElement>(root, "[data-fg='marker']");
    const statementLines = all<HTMLElement>(root, "[data-fg='statement-line']");
    const values = all<HTMLElement>(root, "[data-fg='value']");
    const narrative = one<HTMLElement>(root, "[data-fg='narrative']");

    const nodeById = new Map<string, SVGGElement>();
    for (const node of nodes) {
      const id = node.dataset.id;
      if (id) nodeById.set(id, node);
    }

    /* ---- settled state — also the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...branches, ...connections, ...leaders], { strokeDashoffset: 0 });
      gsap.set(nodes, { opacity: 1 });
      // The field at rest: every line at its resting amplitude, no ripple.
      gsap.set([...ridgePaths, ...ridgeNodes], { opacity: 1 });
      gsap.set(
        [marker, ...statementLines, narrative, boundary].filter(Boolean),
        { opacity: 1, y: 0, yPercent: 0 },
      );
      gsap.set(values, { opacity: 1, x: 0, yPercent: -50 });
      root.dataset.fgState = "static";
      return;
    }

    root.dataset.fgState = "running";

    /* =================================================================== *
     * THE DIVE — overlap the hero's last viewport, hold beneath it
     *
     * The hero pins one stage plus its scroll length plus DIVE_LENGTH; this
     * section starts one stage plus DIVE_LENGTH above where flow would put
     * it, i.e. exactly at the dive's first scroll position, and is pinned
     * for the dive with spacing — so the page below is exactly where it was.
     * The anchor offset makes "Who we are" land after the dive, not in it.
     * =================================================================== */
    const vh = window.innerHeight;
    const dive = DIVE_LENGTH * vh;
    gsap.set(root, { marginTop: -(vh + dive), scrollMarginTop: -dive });
    gsap.set(stage, { scale: 0.88, opacity: 0.35, transformOrigin: "50% 35%" });
    gsap.to(stage, {
      scale: 1,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${DIVE_LENGTH * window.innerHeight}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.85,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    // Layout top of this section, read while pins are reverted (refresh).
    const rootTop = () => root.getBoundingClientRect().top + window.scrollY;
    // Absolute scroll positions. The hold shifts everything about this section
    // by one dive, and the reveal happens partway through it, so the arrival
    // is timed from the lift rather than from the section's layout position.
    const revealAt = () => rootTop() + DIVE.lift.start * DIVE_LENGTH * window.innerHeight;
    const releaseAt = () => rootTop() + DIVE_LENGTH * window.innerHeight;
    const footAt = () => releaseAt() + root.offsetHeight - window.innerHeight;

    /* ---- initial state ---- */
    gsap.set(settling, { opacity: 0 });
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(ridgePaths, { opacity: 0 });
    gsap.set(ridgeNodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(statementLines, { yPercent: 110, opacity: 1 });
    gsap.set([marker, narrative].filter(Boolean), { opacity: 0, y: 18 });
    // yPercent is restated here rather than left to CSS: GSAP owns transform on
    // these elements, so the vertical centring has to live in the same place as
    // the animated x or it gets overwritten.
    gsap.set(values, {
      opacity: 0,
      yPercent: -50,
      x: (i, el: Element) => ((el as HTMLElement).dataset.side === "left" ? 14 : -14),
    });
    gsap.set(boundary, { opacity: 0 });

    /* =================================================================== *
     * NETWORK — one scrubbed pass, no pin
     * =================================================================== */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        // From the moment the hero's black starts to lift off this section…
        start: revealAt,
        // …to the section's foot reaching the foot of the viewport, so the
        // handoff is on screen when it happens rather than already gone.
        end: footAt,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to({}, { duration: 1 }, 0);

    /* --- strands arriving from the hero ------------------------------- */
    // The trunks are literally the hero's descenders continuing, so they draw.
    // Their first run carries the eye across the seam.
    arriving.forEach((el) => {
      const start = onBeat(Number(el.dataset.start), FG_BEATS.arrival);
      const duration = Math.max(0.02, Number(el.dataset.duration) * span(FG_BEATS.arrival));
      tl.to(el, { strokeDashoffset: 0, duration, ease: "power1.out" }, start);
    });

    // Everything downstream resolves in place instead of re-performing growth.
    settling.forEach((el) => {
      const start = onBeat(Number(el.dataset.start), FG_BEATS.arrival);
      tl.to(el, { opacity: 1, duration: 0.09, ease: "power1.out" }, start);
    });

    nodes.forEach((el) => {
      const at = onBeat(Number(el.dataset.at), FG_BEATS.arrival);
      tl.to(el, { scale: 1, opacity: 1, duration: 0.05, ease: "power2.out" }, at);
    });

    /* --- the ridgelines ------------------------------------------------ */
    // Each line resolves as the spine's arrival reaches its depth, top to
    // bottom; the crest nodes land with their line.
    ridgePaths.forEach((el) => {
      const at = onBeat(Number(el.dataset.at), FG_BEATS.arrival);
      tl.to(el, { opacity: 1, duration: 0.07, ease: "power1.out" }, at);
    });
    ridgeNodes.forEach((el) => {
      const at = onBeat(Number(el.dataset.at), FG_BEATS.arrival) + 0.03;
      tl.to(el, { scale: 1, opacity: 1, duration: 0.05, ease: "power2.out" }, at);
    });

    // The ripple: one swell travels down the stack across the whole pass. It
    // is a per-line amplitude multiplier applied at draw time, so scrubbing it
    // is just redrawing paths — reversible by construction, and the field
    // never sits anywhere it was not generated to be.
    if (ridges && ridgePaths.length) {
      const count = ridges.ridges.length;
      const ripple = { t: 0 };
      const draw = () => {
        ridgePaths.forEach((el) => {
          const index = Number(el.dataset.index);
          const ridge = ridges.ridges[index];
          if (ridge) el.setAttribute("d", ridgePath(ridge, swell(index, count, ripple.t)));
        });
      };
      tl.to(ripple, { t: 1, duration: 1, ease: "none", onUpdate: draw }, 0);
    }


    /* --- PHASE: connection -------------------------------------------- */
    // The chord draws between two nodes, and as it lands both of its ends gain
    // weight. That pairing is the whole point — a link is only meaningful
    // because of what it joins.
    connections.forEach((el) => {
      const at = onBeat(Number(el.dataset.at), FG_BEATS.connect);
      const duration = span(FG_BEATS.connect) * 0.16;
      tl.to(el, { strokeDashoffset: 0, duration, ease: "power2.inOut" }, at);

      const ends = [el.dataset.from, el.dataset.to]
        .map((id) => (id ? nodeById.get(id) : undefined))
        .filter((n): n is SVGGElement => Boolean(n));
      if (ends.length) {
        tl.to(
          ends,
          { scale: 1.6, duration: duration * 0.6, ease: "power2.out" },
          at + duration * 0.7,
        );
      }
    });

    leaders.forEach((el) => {
      const at = onBeat(Number(el.dataset.at) * 0.8 + 0.15, FG_BEATS.connect);
      tl.to(
        el,
        { strokeDashoffset: 0, duration: span(FG_BEATS.connect) * 0.12, ease: "power2.out" },
        at,
      );
    });

    // A very small settle on the whole field — enough to feel alive under
    // scroll, far too little to read as parallax.
    tl.to(drift, { y: -network.height * 0.012, duration: 1, ease: "none" }, 0);

    /* --- PHASE: handoff toward Work ------------------------------------ */
    if (workBranch) {
      // The rest of the system steps back so one direction can dominate.
      tl.to(
        branches.filter((el) => el !== workBranch),
        // Stepped back, not switched off. Dimming these much further leaves
        // their nodes floating with nothing visibly connecting them.
        { opacity: 0.72, duration: span(FG_BEATS.handoff) * 0.8, ease: "sine.inOut" },
        FG_BEATS.handoff.start,
      );
      tl.to(
        workBranch,
        {
          strokeOpacity: 1,
          strokeWidth: Number(workBranch.getAttribute("stroke-width") ?? 1.4) * 2.1,
          duration: span(FG_BEATS.handoff) * 0.9,
          ease: "power2.out",
        },
        FG_BEATS.handoff.start,
      );
    }

    tl.to(
      boundary,
      { opacity: 1, duration: span(FG_BEATS.handoff) * 0.7, ease: "power2.out" },
      FG_BEATS.handoff.start,
    );

    /* =================================================================== *
     * COPY — entrance triggers, not scrubbed. Reading should never depend
     * on how fast someone is scrolling.
     * =================================================================== */
    // Layout offset of an element within the section, transform-free: the
    // stage is scaled during the hold, so client rects would lie.
    const withinRoot = (el: HTMLElement) => {
      let y = 0;
      let node: HTMLElement | null = el;
      while (node && node !== root) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return y;
    };
    // Nothing shows before the hold releases: the first thing that moves
    // after landing is the message. Anything further down the section still
    // arrives at its own natural moment (its layout position, shifted by the
    // hold) — whichever comes later.
    const landing = () => releaseAt() - window.innerHeight * 0.08;
    const natural = (el: HTMLElement) => () =>
      Math.max(landing(), releaseAt() + withinRoot(el) - window.innerHeight * 0.82);
    const reveal = (
      targets: gsap.TweenTarget,
      vars: gsap.TweenVars,
      start: () => number,
    ) => {
      gsap.to(targets, {
        ...vars,
        // Absolute positions, so the section's own pin cannot shift them.
        scrollTrigger: { trigger: root, start, once: true, invalidateOnRefresh: true },
      });
    };

    if (marker) {
      reveal(marker, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, landing);
    }

    if (statementLines.length) {
      reveal(
        statementLines,
        {
          yPercent: 0,
          duration: 1.15,
          ease: "expo.out",
          stagger: 0.11,
        },
        landing,
      );
    }

    values.forEach((el) => {
      reveal(el, { opacity: 1, x: 0, duration: 0.9, ease: "power2.out" }, natural(el));
    });

    if (narrative) {
      reveal(
        narrative,
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
        natural(narrative),
      );
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, root);

  return () => ctx.revert();
}
