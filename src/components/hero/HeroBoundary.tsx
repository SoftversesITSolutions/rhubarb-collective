import type { Descender } from "@/lib/hero/network";

interface HeroBoundaryProps {
  descenders: Descender[];
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
 */
export function HeroBoundary({ descenders }: HeroBoundaryProps) {
  return (
    <div className="hero-boundary" data-hero="boundary" aria-hidden="true">
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
            data-descender=""
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
