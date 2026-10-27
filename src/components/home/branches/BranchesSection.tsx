"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { SERVICES } from "@/lib/branches/config";
import { generateBranchNetwork, measureBranchField } from "@/lib/branches/network";
import { createBranchesAnimation } from "@/lib/branches/animation";
import { BranchCard } from "./BranchCard";
import { BranchesNetwork } from "./BranchesNetwork";
import "./branches.css";

interface Field {
  network: OrganicNetwork;
  /** Width of the stage, CSS px. */
  view: number;
}

/**
 * SECTION 04 — THE BRANCHES
 *
 * The collective branching into its six disciplines. Since client round 3
 * (Oct 2026) the section is a stage that pins to the screen while the reader
 * scrolls, and a track of cards slides through it from right to left: one
 * branch runs its whole length, each card grows out of it on a short stem,
 * and at the far end the branch turns back down, the pin lets go, and the
 * page carries on into The Collective.
 *
 *   intro  — the section marker, scrolling normally; Selected Work's strands
 *            fall through it into the stage.
 *   stage  — one screen tall, pinned; clips the track sideways.
 *   track  — the journey: the network and the cards, slid by the animation.
 *
 * The field is measured, not assumed, so the network is grown after layout
 * settles and regrown when the stage changes shape. The cards are handed to
 * the generator as their real rectangles, which is what lets each stem land
 * on its card without a leader line ever being drawn.
 *
 * Every reveal — and the slide itself — is scrubbed against scroll position,
 * so the way back is the exact inverse of the way through.
 */
export function BranchesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();
  const [field, setField] = useState<Field | null>(null);

  const grow = useCallback(() => {
    const root = rootRef.current;
    if (!root || !tier) return;
    // Layout boxes, never paint boxes (see `layoutRect`), so The Collective,
    // which regrows this field to read its exits, gets the same network.
    const input = measureBranchField(root, tier);
    setField(input ? { network: generateBranchNetwork(input), view: input.view } : null);
  }, [tier]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    // Deferred by a frame rather than run inline: this section reads Selected
    // Work out of the live DOM for its inlets, so that section has to be
    // mounted and laid out before growth can start.
    frame = requestAnimationFrame(grow);
    // The stage and the intro, never the section: pinning adds the slide's
    // length to the section's height, and regrowing on that would re-pin,
    // and so on forever.
    const observer = new ResizeObserver(() => {
      const stage = stageRef.current;
      const intro = introRef.current;
      if (!stage || !intro) return;
      // Only regrow when the box actually changes shape, so ordinary scrolling
      // and sub-pixel reflow never trigger a regeneration.
      const key = `${stage.offsetWidth}x${Math.round(stage.offsetHeight / 8)}|${intro.offsetHeight}`;
      if (key === last) return;
      last = key;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(grow);
    });
    if (stageRef.current) observer.observe(stageRef.current);
    if (introRef.current) observer.observe(introRef.current);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [grow, tier]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !tier) return;
    return createBranchesAnimation({
      root,
      tier,
      reducedMotion,
      gatherX: field?.network.seedPoint.x ?? 0,
    });
  }, [reducedMotion, tier, field]);

  return (
    <section
      ref={rootRef}
      id="services"
      className="branches"
      data-branches-state="idle"
      aria-labelledby="branches-heading"
    >
      <div className="branches__intro" ref={introRef} data-branches-intro="">
        <header className="branches__marker" data-branches-marker="">
          <span className="branches__index">03</span>
          <span className="branches__rule" aria-hidden="true" />
          <h2 className="branches__title eyebrow-box" id="branches-heading">
            The branches
          </h2>
        </header>
      </div>

      <div className="branches__stage" ref={stageRef} data-branches-stage="">
        <div className="branches__track" data-branches-track="">
          {/* Layer 1 — the network, beneath everything, never clipped to a card. */}
          {field && <BranchesNetwork network={field.network} view={field.view} />}

          {/* Layers 2 and 3 — the cards and their content. */}
          <div className="branches__field">
            {SERVICES.map((service, i) => (
              <BranchCard key={service.index} service={service} order={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
