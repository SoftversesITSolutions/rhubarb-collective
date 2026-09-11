"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { SERVICES } from "@/lib/branches/config";
import { generateBranchNetwork, readWorkExits } from "@/lib/branches/network";
import { layoutRect } from "@/lib/network/continuity";
import { createBranchesAnimation } from "@/lib/branches/animation";
import { BranchCard } from "./BranchCard";
import { BranchesNetwork } from "./BranchesNetwork";
import "./branches.css";

/**
 * SECTION 04 — THE BRANCHES
 *
 * The collective branching into its six disciplines. The same organism again:
 * the trunks that left Selected Work through its lower edge arrive here as this
 * field's inlets, and the growth that follows comes from the generator that
 * produced Sections 2 and 3.
 *
 * The field is measured, not assumed — the section's height depends on where
 * the cards fall — so the network is grown after layout settles and regrown on
 * resize. The cards are handed to the generator as their real rectangles, which
 * is what lets branches arrive at them without a leader line ever being drawn.
 *
 * Every reveal is scrubbed against scroll position, so the way up is the exact
 * inverse of the way down.
 */
export function BranchesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();
  const [network, setNetwork] = useState<OrganicNetwork | null>(null);

  const grow = useCallback(() => {
    const root = rootRef.current;
    const field = fieldRef.current;
    if (!root || !field || !tier) return;

    const rootRect = root.getBoundingClientRect();
    if (rootRect.width < 1 || rootRect.height < 1) return;

    // Layout boxes, never paint boxes. A card's frame carries a translate and a
    // scale mid-reveal, so `getBoundingClientRect()` reported the ANIMATED box
    // and made this section's own network a function of scroll position — and,
    // worse, a network The Collective could never reproduce when it regrows this
    // field to read its exits. Measuring through pure layout makes the geometry
    // deterministic and makes the seam below it line up exactly.
    const cards = Array.from(
      field.querySelectorAll<HTMLElement>("[data-branch-frame]"),
    ).map((frame) => layoutRect(frame, root));

    // Inherited from Selected Work. If that section is not on the page there is
    // nothing to continue, and inventing a root would be exactly the orphan
    // geometry this system avoids — so the field simply stays empty.
    const inlets = readWorkExits(tier);
    if (!inlets) {
      setNetwork(null);
      return;
    }

    setNetwork(
      generateBranchNetwork({
        tier,
        width: Math.round(rootRect.width),
        height: Math.round(rootRect.height),
        cards,
        inlets,
      }),
    );
  }, [tier]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    // Deferred by a frame rather than run inline: this section reads Selected
    // Work out of the live DOM for its inlets, so that section has to be
    // mounted and laid out before growth can start.
    frame = requestAnimationFrame(grow);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      // Only regrow when the box actually changes shape, so ordinary scrolling
      // and sub-pixel reflow never trigger a regeneration.
      const key = `${Math.round(box.width)}x${Math.round(box.height / 8)}`;
      if (key === last) return;
      last = key;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(grow);
    });
    const root = rootRef.current;
    if (root) observer.observe(root);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [grow, tier]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createBranchesAnimation({ root, reducedMotion });
  }, [reducedMotion, network]);

  return (
    <section
      ref={rootRef}
      id="services"
      className="branches"
      data-branches-state="idle"
      aria-labelledby="branches-heading"
    >
      {/* Layer 1 — the network, beneath everything, never clipped to a card. */}
      {network && <BranchesNetwork network={network} />}

      <header className="branches__marker" data-branches-marker="">
        <span className="branches__index">03</span>
        <span className="branches__rule" aria-hidden="true" />
        <h2 className="branches__title" id="branches-heading">
          The branches
        </h2>
      </header>

      {/* Layers 2 and 3 — the cards and their content. */}
      <div className="branches__field" ref={fieldRef}>
        {SERVICES.map((service) => (
          <BranchCard key={service.index} service={service} />
        ))}
      </div>
    </section>
  );
}
