/**
 * SEAM BRIDGES — one grammar for every boundary
 * =============================================
 *
 * Client feedback (Sep 2026, note 6): the sections felt like different pages
 * stitched together through random nodes and lines, and there was nowhere on
 * the page for artworks. Each boundary between two sections now carries the
 * same gesture: a short band of the ridgeline field from section 01 straddling
 * the seam, lifted where the strands cross it, with the next section's marker
 * sitting on a crest of its own and one artwork frame riding the band.
 *
 * Nothing about the sections' networks changes — their trunks still leave and
 * arrive exactly where the continuity contract puts them. The bridge reads
 * those arrivals off the lower section's rendered network and lifts the field
 * around them, so the ridges part for the strands rather than crossing them.
 *
 * Geometry is in CSS pixels, generated in the browser once the neighbours have
 * laid out, and regenerated on resize. `generateRidges` does the drawing; a
 * synthetic network of vertical strands at the crossing positions gives it the
 * "spine" to lift around.
 */

import type { Branch, KeepOut, OrganicNetwork } from "@/lib/hero/network";
import { NETWORK_SEED, type Tier } from "@/lib/hero/config";
import { generateRidges, type RidgeCrest, type RidgeField } from "@/lib/first-growth/ridgelines";

export interface SeamArtwork {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface SeamConfig {
  id: string;
  /** Selector of the section below the seam. */
  lower: string;
  /** Selector of that section's marker line, resolved inside it. */
  marker: string;
  /** Rhubarb's own brand artwork riding the band, or null for a reserved frame. */
  artwork: SeamArtwork | null;
}

/**
 * The six seams, top to bottom. Every artwork is Rhubarb's own brand material
 * from the client bundle — collages, the brand board, the business card, the
 * socials poster, the header dither — never a client case study, so nothing
 * here can be mistaken for portfolio work.
 */
export const SEAMS: readonly SeamConfig[] = [
  {
    id: "first-growth-work",
    lower: ".work",
    marker: "[data-work-marker]",
    artwork: {
      src: "/assets/brand/collage-machina-flora.jpg",
      alt: "Rhubarb Collective collage: stacked television sets sprouting flowers, an eye on one screen, titled Machina Flora.",
      width: 1218,
      height: 1600,
    },
  },
  {
    id: "work-branches",
    lower: ".branches",
    marker: "[data-branches-marker]",
    artwork: {
      src: "/assets/brand/moodboard.webp",
      alt: "Rhubarb Collective brand board: prints, posters and a business card taped to an ochre wall.",
      width: 1400,
      height: 1050,
    },
  },
  {
    id: "branches-collective",
    lower: ".collective",
    marker: "[data-collective-marker]",
    artwork: {
      src: "/assets/brand/collage-machine-mind.jpg",
      alt: "Rhubarb Collective collage: a sculpted head above hands at a laptop, circuit boards and server racks scattered around them.",
      width: 1225,
      height: 1600,
    },
  },
  {
    id: "collective-proof",
    lower: ".proof",
    marker: "[data-proof-marker]",
    artwork: {
      src: "/assets/brand/business-card.webp",
      alt: "Rhubarb Collective business card mockup.",
      width: 1500,
      height: 1000,
    },
  },
  {
    id: "proof-journal",
    lower: ".journal",
    marker: "[data-journal-marker]",
    artwork: {
      src: "/assets/brand/socials-halftone.webp",
      alt: "Rhubarb Collective social posters in the brand's halftone treatment.",
      width: 864,
      height: 1080,
    },
  },
  {
    id: "journal-contact",
    lower: ".contact",
    marker: "[data-contact-marker]",
    // Reserved. The bundle holds no sixth artwork that is not already used
    // above (the polaroid mockup is the brand board again) or spoken for
    // (the sunflower belongs to the contact section, note 8), so this frame
    // waits for the client's own piece rather than repeating one.
    artwork: null,
  },
];

/** How far the band reaches above and below the boundary, and its line rhythm. */
export interface SeamMetrics {
  above: number;
  below: number;
  gap: number;
}

/**
 * Band reach per tier, in CSS pixels. `above` fits inside the clear black every
 * section leaves at its foot (measured: the least is ~144px on desktop); `below`
 * is the marker's offset plus a short tail, so the band ends before any heading
 * or card. The first seam reaches less far up: section 01's own ridge stack
 * ends just above its foot, and the band continues that rhythm rather than
 * doubling it.
 */
export function seamMetrics(tier: Tier, first: boolean, markerDy: number): SeamMetrics {
  // `below` reaches one line past the marker: that line is the one that
  // carries the marker's crest (the crest belongs to the first line at least
  // 0.45 gap beneath its anchor). Headings that begin inside that reach are
  // masked, so the tail never draws through them.
  const base: Record<Tier, SeamMetrics> = {
    desktop: { above: 120, below: markerDy + 66 + 6, gap: 66 },
    tablet: { above: 140, below: markerDy + 62 + 6, gap: 62 },
    mobile: { above: 100, below: markerDy + 52 + 4, gap: 52 },
  };
  const m = base[tier];
  if (first) {
    // Section 01's own stack ends 108/85/26 px above its foot on the three
    // tiers; the band's first line sits exactly one gap below it.
    const above: Record<Tier, number> = { desktop: 42, tablet: 23, mobile: 0 };
    return { ...m, above: above[tier] };
  }
  return m;
}

/** Normalised x of every strand entering a section's network across its top edge. */
export function entriesOf(svg: SVGSVGElement): number[] {
  const viewBox = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
  const width = viewBox[2];
  if (!width) return [];
  const out: number[] = [];
  svg.querySelectorAll("path").forEach((path) => {
    const nums = (path.getAttribute("d") ?? "").match(/-?\d*\.?\d+(?:e-?\d+)?/g)?.map(Number);
    if (!nums || nums.length < 2) return;
    if (nums[1] <= 2) out.push(nums[0] / width);
  });
  return out;
}

/** Layout position of an element relative to the document, transform-free. */
export function layoutPosition(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export interface BridgeInput {
  width: number;
  height: number;
  /** Where the strands cross the band, CSS px from its left edge. */
  crossings: number[];
  /** The marker's crest, band coordinates. */
  crest: RidgeCrest | null;
  /** Rectangles the ridges fade under, band coordinates. */
  zones: Array<{ x: number; y: number; width: number; height: number }>;
  /** First and last line, band coordinates, and the spacing between lines. */
  top: number;
  bottom: number;
  gap: number;
  /** Stroke width in CSS px. */
  stroke: number;
}

export function bridgeField(input: BridgeInput): RidgeField {
  const { width, height } = input;
  // A synthetic spine: one vertical strand per crossing. The generator lifts
  // each line where a strand crosses it and the renderer's mask parts the
  // field around it — exactly what the real strand needs.
  const branches: Branch[] = input.crossings.map((x, i) => ({
    id: `x${i}`,
    parentId: null,
    depth: 0,
    d: `M${x} 0C${x} ${height / 3} ${x} ${(height * 2) / 3} ${x} ${height}`,
    length: height,
    width: 1,
    opacity: 1,
    behind: false,
    growthStart: 0,
    growthDuration: 1,
    tip: { x, y: height },
  }));
  const network: OrganicNetwork = {
    width,
    height,
    seedPoint: { x: 0, y: 0 },
    branches,
    nodes: [],
    halftone: [],
    descenders: [],
  };
  const keepOut: KeepOut[] = input.zones.map((z) => ({ ...z, influence: 0, strength: 0 }));
  const count = Math.max(2, Math.floor((input.bottom - input.top) / input.gap) + 1);
  return generateRidges(network, keepOut, {
    seed: NETWORK_SEED + 47,
    count,
    top: input.top,
    bottom: input.top + (count - 1) * input.gap,
    margin: 0,
    sampleStep: 18,
    spineHeight: 0.55,
    spineSigma: 90,
    crestSigma: 120,
    crestFalloff: 0.55,
    crests: input.crest ? [input.crest] : [],
    noiseAmplitude: 4,
    noiseWavelength: 380,
    width: input.stroke,
    opacity: 0.55,
    fadeRadius: 34,
    typePad: 14,
    blur: 12,
  });
}
