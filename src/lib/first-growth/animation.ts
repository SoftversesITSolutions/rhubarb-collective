"use client";

/**
 * FIRST GROWTH — ANIMATION
 * ========================
 *
 * The hero's verb is GROWTH and it earns a pinned, scrubbed narrative. This
 * section's verb is CONNECTION and it is deliberately quieter:
 *
 *   • Nothing is pinned. The section is read through, not held.
 *   • One scrubbed trigger drives the network across the section's own pass
 *     through the viewport.
 *   • Copy arrives on its own entrance triggers, unscrubbed, so reading is
 *     never tied to scroll velocity.
 *   • There are no ambient loops at all.
 *
 * Motion is split by role, which is what keeps this from being the hero again:
 *   arriving strands  — stroke draw, because they genuinely continue from above
 *   the rest          — resolve in place, because they are already there
 *   chords            — stroke draw, endpoint nodes gaining weight as they land
 *   the Work strand   — takes over at the end as the route onward
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Tier } from "@/lib/hero/config";
import type { OrganicNetwork } from "@/lib/hero/network";
import { FG_BEATS } from "./config";

export interface FirstGrowthAnimationOptions {
  root: HTMLElement;
  network: OrganicNetwork;
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
      gsap.set(
        [marker, ...statementLines, narrative, boundary].filter(Boolean),
        { opacity: 1, y: 0, yPercent: 0 },
      );
      gsap.set(values, { opacity: 1, x: 0, yPercent: -50 });
      root.dataset.fgState = "static";
      return;
    }

    root.dataset.fgState = "running";

    /* ---- initial state ---- */
    gsap.set(settling, { opacity: 0 });
    gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
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
        start: "top 85%",
        // Completes as the section's foot reaches the foot of the viewport, so
        // the handoff is on screen when it happens rather than already gone.
        end: "bottom bottom",
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
    const reveal = (
      targets: gsap.TweenTarget,
      vars: gsap.TweenVars,
      trigger: Element,
    ) => {
      gsap.to(targets, {
        ...vars,
        scrollTrigger: { trigger, start: "top 82%", once: true },
      });
    };

    if (marker) {
      reveal(marker, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, marker);
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
        statementLines[0],
      );
    }

    values.forEach((el) => {
      reveal(el, { opacity: 1, x: 0, duration: 0.9, ease: "power2.out" }, el);
    });

    if (narrative) {
      reveal(
        narrative,
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" },
        narrative,
      );
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, root);

  return () => ctx.revert();
}
