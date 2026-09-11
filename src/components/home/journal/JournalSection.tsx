"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import {
  JOURNAL_COPY,
  JOURNAL_POSITIONS,
  JOURNAL_SHAPE,
  JOURNAL_STRANDS,
} from "@/lib/journal/config";
import { layoutRect, type Rect } from "@/lib/collective/network";
import {
  anchorJournal,
  generateJournalNetwork,
  JOURNAL_COPY_SELECTOR,
  readProofExits,
  type JournalAnchoring,
} from "@/lib/journal/network";
import { createJournalAnimation } from "@/lib/journal/animation";
import { JournalNetwork } from "./JournalNetwork";
import { JournalItem } from "./JournalItem";
import "./journal.css";

interface Grown {
  network: OrganicNetwork;
  anchoring: JournalAnchoring;
}

/**
 * SECTION 07 — JOURNAL & CULTURE
 *
 * The homepage stops describing the collective here and opens outward: the last
 * movement is not what Rhubarb sells but what it is curious about. The same
 * organism once more — the trunks that left The Proof through its lower edge
 * arrive here as this field's inlets, and the growth that follows comes from the
 * generator that produced Sections 2 through 6. Nothing restarts, and no fresh
 * root is seeded.
 *
 * The field is measured, not assumed — the section's height depends on where the
 * editorial positions fall — so the network is grown after layout settles and
 * regrown on resize. Each position is handed to the generator as its real
 * rectangle, which is what lets a strand arrive at an idea without a leader line
 * ever being drawn, and what lets the anchors start from junctions that
 * genuinely grew within reach. Positions with nothing in reach are simply near
 * the network, and that is the intended reading: the network connects ideas, not
 * cards, and not every idea gets a wire.
 *
 * NO EDITORIAL EXISTS YET — see `lib/journal/config.ts`. What is rendered is the
 * client's own approved copy for this section plus a real, waiting field. Every
 * position is visibly unwritten rather than filled with a plausible article.
 *
 * Every reveal is scrubbed against scroll position, so the way up is the exact
 * inverse of the way down.
 */
export function JournalSection() {
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

    // Layout boxes, never paint boxes. Each position's children carry a clip and
    // a translate mid-reveal, so anything read through `getBoundingClientRect()`
    // would make this network a function of scroll position.
    const blocks = Array.from(field.querySelectorAll<HTMLElement>("[data-journal-item]"));
    const items: (Rect & { id: string; connect: boolean })[] = blocks.map((el, i) => ({
      id: JOURNAL_POSITIONS[i]?.id ?? `j${i}`,
      connect: JOURNAL_POSITIONS[i]?.node ?? false,
      ...layoutRect(el, root),
    }));

    const copy: Rect[] = [];
    root
      .querySelectorAll<HTMLElement>(JOURNAL_COPY_SELECTOR)
      .forEach((el) => copy.push(layoutRect(el, root)));

    // Inherited from The Proof. If that section is not on the page there is
    // nothing to continue, and inventing a root would be exactly the orphan
    // geometry this system avoids — so the field simply stays empty.
    const inlets = readProofExits(tier);
    if (!inlets) {
      setGrown(null);
      return;
    }

    const network = generateJournalNetwork({
      tier,
      width: Math.round(rootRect.width),
      height: Math.round(rootRect.height),
      items,
      copy,
      inlets,
    });

    setGrown({
      network,
      anchoring: anchorJournal(network, items, JOURNAL_SHAPE[tier].anchorReach),
    });
  }, [tier]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    let cancelled = false;

    // Deferred rather than run inline: this section reads The Proof out of the
    // live DOM for its inlets, so that section has to be mounted and laid out
    // first. Waiting on the brand faces as well is what makes the result
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
    return createJournalAnimation({ root, reducedMotion });
  }, [reducedMotion, grown]);

  return (
    <section
      ref={rootRef}
      id="insights"
      className="journal"
      data-journal-state="idle"
      aria-labelledby="journal-heading"
    >
      {/* Layer 1 — the network, beneath everything, never clipped to an item. */}
      {grown && (
        <JournalNetwork
          network={grown.network}
          anchors={grown.anchoring.anchors}
          junctions={grown.anchoring.junctions}
        />
      )}

      <header className="journal__opening">
        <p className="journal__marker" data-journal-marker="">
          <span className="journal__index">{JOURNAL_COPY.index}</span>
          <span className="journal__rule" aria-hidden="true" />
          <span className="journal__label">{JOURNAL_COPY.marker}</span>
        </p>

        <h2 className="journal__heading" id="journal-heading" data-journal-lede="">
          {JOURNAL_COPY.heading}
        </h2>

        <p className="journal__standfirst" data-journal-lede="">
          {JOURNAL_COPY.standfirst}
        </p>

        <p className="journal__intro" data-journal-lede="">
          {JOURNAL_COPY.intro}
        </p>

        {/* The client's own note on the space, set apart from the introduction
            because it is addressed to the reader rather than about the work. */}
        <p className="journal__note" data-journal-lede="">
          {JOURNAL_COPY.note}
        </p>
      </header>

      {/* Layer 2 — the editorial field. Every position is real architecture and
          currently unwritten; nothing here is a placeholder article. */}
      <div className="journal__field" ref={fieldRef}>
        {JOURNAL_POSITIONS.map((position, i) => (
          <JournalItem key={position.id} position={position} ordinal={i + 1} />
        ))}
      </div>

      {/*
        Layer 3 — the strands this space is planned to grow into.

        These are the client's own future content areas, in their own words and
        order, and they are labelled as forthcoming rather than presented as
        categories: no counts, no filters, no links, and nothing implying a
        single piece of music, film or writing sits behind any of them today.
      */}
      <div className="journal__forthcoming" data-journal-strands="">
        <p className="journal__forthcoming-label">{JOURNAL_COPY.forthcoming}</p>
        <ul className="journal__strands">
          {JOURNAL_STRANDS.map((strand) => (
            <li className="journal__strand" key={strand} data-journal-strand="">
              {strand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
