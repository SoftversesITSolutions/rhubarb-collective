"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { PROOF_COPY, PROOF_ITEMS, PROOF_SHAPE } from "@/lib/proof/config";
import { layoutRect, type Rect } from "@/lib/collective/network";
import {
  anchorProof,
  generateProofNetwork,
  PROOF_COPY_SELECTOR,
  readCollectiveExits,
  type ProofAnchoring,
} from "@/lib/proof/network";
import { createProofAnimation } from "@/lib/proof/animation";
import { ProofNetwork } from "./ProofNetwork";
import { ProofItem } from "./ProofItem";
import "./proof.css";

interface Grown {
  network: OrganicNetwork;
  anchoring: ProofAnchoring;
}

/**
 * SECTION 06 — THE PROOF
 *
 * Why any of it can be trusted. The same organism once more: the trunks that
 * left The Collective through its lower edge arrive here as this field's inlets,
 * and the growth that follows comes from the generator that produced Sections 2,
 * 3, 4 and 5. Nothing restarts, and no fresh root is seeded.
 *
 * The field is measured, not assumed — the section's height depends on where the
 * proof items fall — so the network is grown after layout settles and regrown on
 * resize. Each item is handed to the generator as its real rectangle, which is
 * what lets a strand arrive at a relationship without a leader line ever being
 * drawn, and what lets the anchors start from junctions that genuinely grew
 * within reach. Items with nothing in reach are simply near the network, and
 * that is the intended reading: not every relationship is a line.
 *
 * Every reveal is scrubbed against scroll position, so the way up is the exact
 * inverse of the way down.
 */
export function ProofSection() {
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

    // Layout boxes, never paint boxes. Each item's children carry a clip and a
    // translate mid-reveal, so anything read through `getBoundingClientRect()`
    // would make this network a function of scroll position.
    const blocks = Array.from(field.querySelectorAll<HTMLElement>("[data-proof-item]"));
    const items: (Rect & { id: string; connect: boolean })[] = blocks.map((el, i) => ({
      id: PROOF_ITEMS[i]?.id ?? `i${i}`,
      connect: PROOF_ITEMS[i]?.node ?? false,
      ...layoutRect(el, root),
    }));

    const copy: Rect[] = [];
    root
      .querySelectorAll<HTMLElement>(PROOF_COPY_SELECTOR)
      .forEach((el) => copy.push(layoutRect(el, root)));

    // Inherited from The Collective. If that section is not on the page there is
    // nothing to continue, and inventing a root would be exactly the orphan
    // geometry this system avoids — so the field simply stays empty.
    const inlets = readCollectiveExits(tier);
    if (!inlets) {
      setGrown(null);
      return;
    }

    const network = generateProofNetwork({
      tier,
      width: Math.round(rootRect.width),
      height: Math.round(rootRect.height),
      items,
      copy,
      inlets,
    });

    setGrown({
      network,
      anchoring: anchorProof(network, items, PROOF_SHAPE[tier].anchorReach),
    });
  }, [tier]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    let cancelled = false;

    // Deferred rather than run inline: this section reads The Collective out of
    // the live DOM for its inlets, so that section has to be mounted and laid
    // out first. Waiting on the brand faces as well is what makes the result
    // deterministic — growing against fallback-face metrics measures a different
    // field height and yields a different network between two loads of the same
    // page, for this section and for every one it inherits from.
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
      // and sub-pixel reflow never trigger a regeneration — and one resize can
      // never leave two networks behind.
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
    return createProofAnimation({ root, reducedMotion });
  }, [reducedMotion, grown]);

  return (
    <section
      ref={rootRef}
      className="proof"
      data-proof-state="idle"
      aria-labelledby="proof-heading"
    >
      {/* Layer 1 — the network, beneath everything, never clipped to an item. */}
      {grown && (
        <ProofNetwork
          network={grown.network}
          anchors={grown.anchoring.anchors}
          junctions={grown.anchoring.junctions}
        />
      )}

      <header className="proof__opening">
        <p className="proof__marker" data-proof-marker="">
          <span className="proof__index">{PROOF_COPY.index}</span>
          <span className="proof__rule" aria-hidden="true" />
          <span className="proof__label">{PROOF_COPY.marker}</span>
        </p>

        <h2 className="proof__heading" id="proof-heading" data-proof-lede="">
          {PROOF_COPY.heading}
        </h2>

        <p className="proof__standfirst" data-proof-lede="">
          {PROOF_COPY.standfirst}
        </p>

        <p className="proof__intro" data-proof-lede="">
          {PROOF_COPY.intro}
        </p>
      </header>

      {/* Layer 2 — the relationships. */}
      <div className="proof__field" ref={fieldRef}>
        {PROOF_ITEMS.map((item) => (
          <ProofItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
