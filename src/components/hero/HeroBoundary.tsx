"use client";

import { useEffect, useRef } from "react";
import type { Descender } from "@/lib/hero/network";

interface HeroBoundaryProps {
  descenders: Descender[];
  /** The hero network's field size — its SVG viewBox. */
  field: { width: number; height: number };
}

/**
 * PHASE 10 — the hero's lower edge.
 *
 * Rather than stopping at a hard seam, the system sends a few strands through
 * the boundary and dissolves into a halftone ramp, so the ecosystem reads as
 * continuing into the rest of the site. The halftone is a CSS radial-gradient
 * tile masked by a linear fade: procedural, no DOM cost, no raster.
 *
 * The strands use preserveAspectRatio="none" so they always span the band's
 * full height; non-scaling-stroke keeps their weight identical to the network
 * above regardless of that distortion.
 *
 * Each strand STARTS on the hero strand it continues (round 3). The band is
 * its own stretched SVG, so the generator cannot know where that strand's tip
 * lands on screen; measured, the strands began at the band's top edge up to
 * ~140px from any strand. Once laid out, the tip is mapped through the
 * network's `meet` fit into band units — usually above the band, which the
 * strand reaches by overflowing it — and the strand leaves on the tip's own
 * heading. Its end, which Section 01 continues, is never moved.
 */
export function HeroBoundary({ descenders, field }: HeroBoundaryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.parentElement;
    if (!root || !stage) return;

    const place = () => {
      const sw = stage.offsetWidth;
      const sh = stage.offsetHeight;
      const bh = root.offsetHeight;
      if (sw < 1 || sh < 1 || bh < 1) return;
      const s = Math.min(sw / field.width, sh / field.height);
      const offX = (sw - field.width * s) / 2;
      const offY = (sh - field.height * s) / 2;
      const top = sh - bh;
      const unit = (x: number, y: number) => ({ x: (x / sw) * 100, y: ((y - top) / bh) * 100 });

      descenders.forEach((strand) => {
        const path = root.querySelector<SVGPathElement>(`[data-descender="${strand.id}"]`);
        if (!path) return;
        const p0 = { x: offX + strand.from.x * s, y: offY + strand.from.y * s };
        const p3 = { x: (strand.exitX / 100) * sw, y: sh };
        const drop = p3.y - p0.y;
        // A tip already in or below the band has nowhere to come from.
        if (drop < 24) return;
        const reach = Math.hypot(p3.x - p0.x, drop) * 0.35;
        const c1 = {
          x: p0.x + Math.cos(strand.from.angle) * reach,
          y: p0.y + Math.sin(strand.from.angle) * reach,
        };
        const c2 = { x: p3.x, y: p3.y - Math.max(36, drop * 0.45) };
        const [a, b, c, d] = [p0, c1, c2, p3].map((p) => unit(p.x, p.y));
        const r = (n: number) => Math.round(n * 100) / 100;
        path.setAttribute("d", `M${r(a.x)} ${r(a.y)}C${r(b.x)} ${r(b.y)} ${r(c.x)} ${r(c.y)} ${r(d.x)} ${r(d.y)}`);

        // Re-pad the dash for the new length, keeping the reveal where it was.
        // Under non-scaling-stroke the dash is laid out in SCREEN pixels, not
        // the band's stretched units, so the length is measured on screen.
        const before = parseFloat(path.style.strokeDasharray) || strand.length;
        const drawnFrom = parseFloat(path.style.strokeDashoffset);
        let onScreen = 0;
        let prev = p0;
        for (let i = 1; i <= 32; i += 1) {
          const t = i / 32;
          const u = 1 - t;
          const q = {
            x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
          };
          onScreen += Math.hypot(q.x - prev.x, q.y - prev.y);
          prev = q;
        }
        const length = Math.ceil(onScreen * 1.1) + 2;
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${Number.isFinite(drawnFrom) ? (drawnFrom / before) * length : length}`;
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(stage);
    observer.observe(root);
    return () => observer.disconnect();
  }, [descenders, field.width, field.height]);

  return (
    <div className="hero-boundary" data-hero="boundary" aria-hidden="true" ref={rootRef}>
      <span className="hero-boundary__halftone" data-hero="boundary-halftone" />
      <svg
        className="hero-boundary__strands"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {descenders.map((strand) => (
          <path
            key={strand.id}
            data-descender={strand.id}
            d={strand.d}
            fill="none"
            stroke="var(--rh-cream)"
            strokeWidth={1}
            strokeOpacity={0.45}
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: strand.length,
              strokeDashoffset: strand.length,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
