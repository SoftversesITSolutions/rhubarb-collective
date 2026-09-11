"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { DISCIPLINES, WORK_ITEMS } from "@/lib/work/config";
import { generateWorkNetwork } from "@/lib/work/network";
import { createWorkAnimation } from "@/lib/work/animation";
import { WorkItem } from "./WorkItem";
import { WorkNetwork } from "./WorkNetwork";
import "./work.css";

/**
 * SECTION 03 — SELECTED WORK
 *
 * The same organism, one field further on. Section 2's trunks leave its foot and
 * arrive here as this field's inlets, and the growth that follows is produced by
 * Section 2's own generator — so the work is discovered inside the network
 * rather than displayed after it.
 *
 * The field is measured rather than assumed. Heights here come from the images,
 * so the network can only be grown once the layout has settled: the section is
 * measured on mount and after resize, and the images are handed to the generator
 * as keep-out rectangles in their real positions.
 *
 * Every reveal — network and imagery alike — is scrubbed against scroll
 * position, so scrolling back up runs the identical timeline backwards. There
 * are no one-way triggers and no separate exit animations anywhere in here.
 */
export function WorkSection() {
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();
  const [network, setNetwork] = useState<OrganicNetwork | null>(null);

  /** Measures the rendered section and grows the continuation into it. */
  const grow = useCallback(() => {
    const root = rootRef.current;
    const field = fieldRef.current;
    if (!root || !field || !tier) return;

    const rootRect = root.getBoundingClientRect();
    if (rootRect.width < 1 || rootRect.height < 1) return;

    const images = Array.from(
      field.querySelectorAll<HTMLElement>("[data-work-frame]"),
    ).map((frame) => {
      const rect = frame.getBoundingClientRect();
      return {
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    setNetwork(
      generateWorkNetwork({
        tier,
        width: Math.round(rootRect.width),
        height: Math.round(rootRect.height),
        images,
      }),
    );
  }, [tier]);

  useEffect(() => {
    if (!tier) return;
    grow();

    // Regrow only when the box actually changes shape. Frames carry explicit
    // aspect-ratios, so images decoding does not move the layout and this stays
    // quiet during normal scrolling.
    let frame = 0;
    let last = "";
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
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
    return createWorkAnimation({ root, reducedMotion });
  }, [reducedMotion, network]);

  return (
    <section
      ref={rootRef}
      id="work"
      className="work"
      data-work-state="idle"
      aria-labelledby="work-heading"
    >
      {/*
        Layer 1 — the network. One field across the whole section, never clipped
        to an image container, always beneath the work.
      */}
      {network && <WorkNetwork network={network} />}

      <header className="work__marker" data-work-marker="">
        <span className="work__index">02</span>
        <span className="work__rule" aria-hidden="true" />
        <h2 className="work__title" id="work-heading">
          Selected work
        </h2>
      </header>

      {/* Layer 2 — the work. Layer 3 — its captions. */}
      <div className="work__field" ref={fieldRef}>
        {WORK_ITEMS.map((item, i) => (
          <WorkItem key={item.id} item={item} priority={i === 0} />
        ))}
      </div>

      {/*
        The close. The disciplines are derived from the work above, so this
        cannot claim a capability the pieces do not evidence — and it points at
        the Services chapter without building any of it. The strands that carry
        the eye down to it are the network's own, continuing past the last piece.
      */}
      <footer className="work__outlet" data-work-outlet="">
        <ul className="work__disciplines">
          {DISCIPLINES.map((discipline) => (
            <li key={discipline} data-work-discipline="">
              {discipline}
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
