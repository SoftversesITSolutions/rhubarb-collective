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
 *   • One scrubbed trigger drives the network across the section's own pass,
 *     timed from the page's shared growth line (lib/network/growth): the
 *     first screen grows as it is revealed, the rest as the scroll reaches it.
 *   • Copy arrives on its own entrance triggers, unscrubbed, so reading is
 *     never tied to scroll velocity.
 *   • At rest the primaries carry the page's shared slow pulse (lib/network/life).
 *
 * Motion is split by role, which is what keeps this from being the hero again:
 *   the strands       — stroke draw, tips riding the growth line
 *   the ridgelines    — resolve line by line as the line reaches them, then a
 *                       swell travels down the stack with scroll (the pulsar's
 *                       ripple), scrubbed and reversible
 *   the Work strand   — takes over at the end as the route onward
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DIVE, DIVE_LENGTH, type Tier } from "@/lib/hero/config";
import type { OrganicNetwork } from "@/lib/hero/network";
import { FG_BEATS } from "./config";
import { RIDGE_REST, ridgePath, ridgeYAt, swell, type RidgeField } from "./ridgelines";
import {
  GROWTH_LINE,
  centreOf,
  drawStrands,
  timeNear,
} from "@/lib/network/growth";
import { enliven } from "@/lib/network/life";

export interface FirstGrowthAnimationOptions {
  root: HTMLElement;
  network: OrganicNetwork;
  ridges: RidgeField | null;
  tier: Tier;
  reducedMotion: boolean;
}

type Beat = { readonly start: number; readonly end: number };

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
    const nodes = all<SVGGElement>(root, "[data-fg-node]");
    const connections = all<SVGPathElement>(root, "[data-fg-connection]");
    const leaders = all<SVGLineElement>(root, "[data-fg-leader]");
    const workBranch = one<SVGPathElement>(root, "[data-fg-branch][data-work]");
    const ridgePaths = all<SVGPathElement>(root, "[data-fg-ridge]");
    const ridgeNodes = all<SVGGElement>(root, "[data-fg-ridge-node]");

    const stage = one<HTMLElement>(root, "[data-fg='stage']");
    const marker = one<HTMLElement>(root, "[data-fg='marker']");
    const statementLines = all<HTMLElement>(root, "[data-fg='statement-line']");
    const values = all<HTMLElement>(root, "[data-fg='value']");
    const narrative = one<HTMLElement>(root, "[data-fg='narrative']");

    // Each value's node rides its own ridge, and its label rides with it, so
    // the node is ON its line in every state of the ripple (round 3). `scaleOf` is each ridge's amplitude at this moment.
    const svg = one<SVGSVGElement>(root, "svg.fg-network");
    const ride = (scaleOf: (index: number) => number) => {
      if (!ridges || !svg) return;
      const perUnit = svg.getBoundingClientRect().height / ridges.height;
      ridgeNodes.forEach((g) => {
        const index = Number(g.dataset.ridge);
        const ridge = ridges.ridges[index];
        if (!ridge) return;
        const y = ridgeYAt(ridge, Number(g.dataset.x), scaleOf(index));
        g.querySelectorAll("circle").forEach((c) => c.setAttribute("cy", String(y)));
        const label = values[Number(g.dataset.value)];
        // A margin, not a translate: GSAP owns this element's transform and
        // clears the individual `translate` property when it writes one.
        if (label) label.style.marginTop = `${(y - Number(g.dataset.y)) * perUnit}px`;
      });
    };

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
        [marker, ...statementLines, narrative].filter(Boolean),
        { opacity: 1, y: 0, yPercent: 0 },
      );
      gsap.set(values, { opacity: 1, x: 0, yPercent: -50 });
      ride(() => RIDGE_REST);
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
    const lineAtFoot = () =>
      releaseAt() + root.offsetHeight - GROWTH_LINE * window.innerHeight;

    // Timeline position at which the growth line reaches a depth of the field.
    // During the hold the section is still, so the first screen down to the
    // line grows across the lift; past it, time is scroll.
    const perPx = root.offsetHeight / network.height;
    const linePx = GROWTH_LINE * vh;
    const revealPx = DIVE.lift.start * dive;
    const passPx = Math.max(1, dive + root.offsetHeight - linePx - revealPx);
    const landed = (dive - revealPx) / passPx;
    const depthTime = (y: number) => {
      const px = y * perPx;
      return px <= linePx
        ? 0.02 + (px / linePx) * (landed - 0.02)
        : (dive + px - linePx - revealPx) / passPx;
    };
    const perUnit = perPx / passPx;

    /* ---- initial state ---- */
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(ridgePaths, { opacity: 0 });
    // Opacity only: the ripple moves these nodes along their ridge, and a
    // scale about an origin fixed at set-time pulled a node ~20px off its
    // line while it appeared.
    gsap.set(ridgeNodes, { opacity: 0 });
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

    /* =================================================================== *
     * NETWORK — one scrubbed pass, no pin
     * =================================================================== */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        // From the moment the hero's black starts to lift off this section…
        start: revealAt,
        // …to the section's foot reaching the growth line, where the next
        // section's inlets take the strands on.
        end: lineAtFoot,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to({}, { duration: 1 }, 0);

    /* --- growth along the line ---------------------------------------- */
    // Every strand draws as the page's growth line (lib/network/growth)
    // reaches it. What the landing shows — the first screen down to the line —
    // grows while the hero's black lifts; everything deeper waits for the
    // scroll to carry the line to it, so nothing is drawn ahead of the reader.
    const schedules = drawStrands(tl, branches, depthTime, perUnit);
    enliven(root, branches);

    nodes.forEach((el) => {
      const centre = centreOf(el);
      const path = el.parentElement?.querySelector<SVGPathElement>("[data-fg-branch]");
      const schedule = path ? schedules.get(path) : undefined;
      const at =
        schedule && centre
          ? timeNear(schedule, centre.x, centre.y)
          : depthTime(centre?.y ?? 0);
      // Up to the strands' own finish (0.985), with a shorter pop at the very
      // end, so a node never lands before a late-starting strand reaches it.
      const start = Math.min(0.985, at);
      tl.to(
        el,
        { scale: 1, opacity: 1, duration: Math.max(0.005, Math.min(0.04, 1 - start)), ease: "power2.out" },
        start,
      );
    });

    /* --- the ridgelines ------------------------------------------------ */
    // Each line resolves as the spine's arrival reaches its depth, top to
    // bottom; the crest nodes land with their line.
    ridgePaths.forEach((el) => {
      const ridge = ridges?.ridges[Number(el.dataset.index)];
      const at = Math.min(0.96, depthTime(ridge?.baseY ?? 0));
      tl.to(el, { opacity: 1, duration: 0.05, ease: "power1.out" }, at);
    });
    ridgeNodes.forEach((el) => {
      // Never before its own ridge: the line it sits on is below the apex, so
      // timing the node from its own centre showed it before the line.
      const ridge = ridges?.ridges[Number(el.dataset.ridge)];
      const at = Math.min(
        0.96,
        Math.max(depthTime(centreOf(el)?.y ?? 0), depthTime(ridge?.baseY ?? 0)) + 0.015,
      );
      tl.to(el, { opacity: 1, duration: 0.04, ease: "power2.out" }, at);
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
        ride((index) => swell(index, count, ripple.t));
      };
      ride(() => RIDGE_REST);
      tl.to(ripple, { t: 1, duration: 1, ease: "none", onUpdate: draw }, 0);
    }


    /* --- PHASE: connection -------------------------------------------- */
    // The chord draws between two nodes, and as it lands both of its ends gain
    // weight. That pairing is the whole point — a link is only meaningful
    // because of what it joins.
    // A chord waits for the line to pass its lower end, so both of the nodes
    // it joins are already there.
    const lowerEnd = (el: SVGGraphicsElement) => {
      try {
        const box = el.getBBox();
        return box.y + box.height;
      } catch {
        return 0;
      }
    };
    connections.forEach((el) => {
      const duration = 0.05;
      const at = Math.min(0.92, depthTime(lowerEnd(el)));
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
      const at = Math.min(0.94, depthTime(lowerEnd(el)) + 0.01);
      tl.to(el, { strokeDashoffset: 0, duration: 0.04, ease: "power2.out" }, at);
    });

    // The field no longer settles upward under scroll (round 3): the drift
    // lifted every strand ~20px off the seam while Work's entries stayed put,
    // so the join opened mid-scroll. The ripple and the resting pulse carry
    // the life it was there for.

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
