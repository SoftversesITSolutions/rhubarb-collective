"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { COLLECTIVE_COPY, COLLECTIVE_SHAPE, PEOPLE } from "@/lib/collective/config";
import {
  anchorPeople,
  COLLECTIVE_COPY_SELECTOR,
  generateCollectiveNetwork,
  layoutRect,
  readBranchExits,
  type PersonAnchor,
  type Rect,
} from "@/lib/collective/network";
import { createCollectiveAnimation } from "@/lib/collective/animation";
import { CollectiveNetwork } from "./CollectiveNetwork";
import { CollectivePerson } from "./CollectivePerson";
import "./collective.css";

interface Grown {
  network: OrganicNetwork;
  anchors: PersonAnchor[];
}

/**
 * SECTION 05 — THE COLLECTIVE
 *
 * The people the whole system has been growing toward. The same organism again:
 * the trunks that left The Branches through its lower edge arrive here as this
 * field's inlets, and the growth that follows comes from the generator that
 * produced Sections 2, 3 and 4. Nothing restarts, and no fresh root is seeded.
 *
 * The field is measured, not assumed — the section's height depends on where the
 * portraits fall — so the network is grown after layout settles and regrown on
 * resize. The portraits are handed to the generator as their real rectangles,
 * which is what lets a branch arrive at a person without a leader line ever
 * being drawn, and what lets the short anchor strands start from junctions that
 * genuinely grew within reach.
 *
 * Every reveal is scrubbed against scroll position, so the way up is the exact
 * inverse of the way down.
 */
export function CollectiveSection() {
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();
  const [grown, setGrown] = useState<Grown | null>(null);

  const grow = useCallback(() => {
    const root = rootRef.current;
    const field = fieldRef.current;
    if (!root || !field || !tier) return;

    const rootRect = root.getBoundingClientRect();
    if (rootRect.width < 1 || rootRect.height < 1) return;

    const people = Array.from(
      field.querySelectorAll<HTMLElement>("[data-collective-person]"),
    );

    const portraits: (Rect & { id: string; connect: boolean })[] = [];
    const copy: Rect[] = [];

    people.forEach((person, i) => {
      const frame = person.querySelector<HTMLElement>("[data-collective-frame]");
      if (!frame) return;
      const box = frame.getBoundingClientRect();
      const x = box.left - rootRect.left;
      const y = box.top - rootRect.top;

      portraits.push({
        id: PEOPLE[i]?.id ?? `p${i}`,
        connect: PEOPLE[i]?.networkNode ?? false,
        x,
        y,
        width: box.width,
        height: box.height,
      });
    });

    // Each actual line of type, not the block that contains it. Reserving whole
    // blocks over-claimed the field — at 1440 it walled off the entire top of
    // the section and the arriving strands matted along the upper edge instead
    // of descending through it.
    root.querySelectorAll<HTMLElement>(COLLECTIVE_COPY_SELECTOR).forEach((el) => {
      copy.push(layoutRect(el, root));
    });

    // Inherited from The Branches. If that section is not on the page there is
    // nothing to continue, and inventing a root would be exactly the orphan
    // geometry this system avoids — so the field simply stays empty.
    const inlets = readBranchExits(tier);
    if (!inlets) {
      setGrown(null);
      return;
    }

    const network = generateCollectiveNetwork({
      tier,
      width: Math.round(rootRect.width),
      height: Math.round(rootRect.height),
      portraits,
      copy,
      inlets,
    });

    setGrown({
      network,
      anchors: anchorPeople(network, portraits, COLLECTIVE_SHAPE[tier].anchorReach),
    });
  }, [tier]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    let cancelled = false;

    // Deferred rather than run inline: this section reads The Branches out of
    // the live DOM for its inlets, so that section has to be mounted and laid
    // out first. Waiting on the brand faces as well is what makes the result
    // deterministic — growing against metrics from the fallback face measured a
    // different field height, and both this network and the Section 4 geometry
    // it inherits from came out different between two loads of the same page.
    const start = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(grow);
    };
    if (document.fonts?.status === "loaded") start();
    else document.fonts.ready.then(start).catch(start);
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
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [grow, tier]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createCollectiveAnimation({ root, reducedMotion });
  }, [reducedMotion, grown]);

  return (
    <section
      ref={rootRef}
      className="collective"
      data-collective-state="idle"
      aria-labelledby="collective-heading"
    >
      {/* Layer 1 — the network, beneath everything, never clipped to a frame. */}
      {grown && (
        <CollectiveNetwork network={grown.network} anchors={grown.anchors} />
      )}

      <header className="collective__opening">
        <p className="collective__marker" data-collective-marker="">
          <span className="collective__index">{COLLECTIVE_COPY.index}</span>
          <span className="collective__rule" aria-hidden="true" />
          <span className="collective__label">{COLLECTIVE_COPY.marker}</span>
        </p>

        <h2
          className="collective__heading"
          id="collective-heading"
          data-collective-lede=""
        >
          {COLLECTIVE_COPY.heading}
        </h2>

        <p className="collective__standfirst" data-collective-lede="">
          {COLLECTIVE_COPY.standfirst}
        </p>

        <p className="collective__intro" data-collective-lede="">
          {COLLECTIVE_COPY.intro}
        </p>
      </header>

      {/* Layers 2 and 3 — the portraits and their names. */}
      <div className="collective__field" ref={fieldRef}>
        {PEOPLE.map((person) => (
          <CollectivePerson key={person.id} person={person} />
        ))}
      </div>
    </section>
  );
}
