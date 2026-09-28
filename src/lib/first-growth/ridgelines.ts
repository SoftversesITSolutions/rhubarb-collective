/**
 * RIDGELINES — the pulsar field
 * =============================
 *
 * Client feedback (Sep 2026, note 4): section 01's lines felt "erratically
 * composed", and the reference offered was the Unknown Pleasures pulsar
 * plot — a stack of evenly spaced horizontal lines, each a smooth waveform
 * that rises where there is signal and lies flat at the margins, with the
 * crests rippling from one line to the next.
 *
 * That is what this field is. The SIGNAL is the spine: the hero's trunks
 * descending the section. Each ridgeline lifts where a trunk crosses it, so
 * the mountain range drifts down the field with the spine. The four brand
 * values each sit on a crest of their own, with a node at the apex — the
 * "nodes on the sentences" placement — and the lines below inherit that
 * crest at diminishing height, which is what makes a crest read as a range.
 *
 * Nothing crosses. Lifts are clamped so a line never meets the line above it,
 * and where a ridge would run into type or through a trunk it fades out via a
 * feathered mask (see FirstGrowthNetwork) rather than deflecting, the way the
 * pulsar's lines fade at their margins.
 *
 * Geometry is deterministic from the seed and from the spine; the ripple is a
 * per-line amplitude multiplier applied at draw time (`ridgePath`), so it can
 * be scrubbed by scroll without regenerating anything.
 */

import { toPath, type KeepOut, type OrganicNetwork, type Point } from "@/lib/hero/network";
import { createRng, range } from "@/lib/hero/random";

export interface RidgeCrest {
  /** Apex of the crest, in field units — where the value's node sits. */
  x: number;
  y: number;
}

export interface RidgeOptions {
  seed: number;
  /** Number of lines. */
  count: number;
  /** Field y of the first and last line. */
  top: number;
  bottom: number;
  /** Horizontal inset from the field edges. */
  margin: number;
  /** Field units between samples along a line. */
  sampleStep: number;
  /** Height a trunk crossing lifts a line, as a fraction of the line gap. */
  spineHeight: number;
  /** Width of that lift, field units (gaussian sigma). */
  spineSigma: number;
  /** Width of a value crest, field units (gaussian sigma). */
  crestSigma: number;
  /** How much of a crest the next line below inherits, per line. */
  crestFalloff: number;
  /** The value anchors. */
  crests: readonly RidgeCrest[];
  /** A very slow, very small organic undulation so lines are not rulers. */
  noiseAmplitude: number;
  noiseWavelength: number;
  /** Stroke. */
  width: number;
  opacity: number;
  /** Mask: fade band around each trunk, padding around type, feather. */
  fadeRadius: number;
  typePad: number;
  blur: number;
}

export interface Ridge {
  id: string;
  index: number;
  baseY: number;
  /** Sample x positions. */
  xs: number[];
  /** Static lift per sample, field units, ≥ 0. */
  lift: number[];
  /** Reveal order, 0..1, top to bottom. */
  at: number;
}

export interface RidgeNode {
  id: string;
  x: number;
  y: number;
  r: number;
  /** Index of the ridge whose apex this is. */
  ridge: number;
}

export interface RidgeField {
  width: number;
  height: number;
  gap: number;
  ridges: Ridge[];
  crestNodes: RidgeNode[];
  /** Rectangles the mask fades the lines under (type, padded). */
  maskRects: Array<{ x: number; y: number; width: number; height: number }>;
  /** Trunk paths the mask fades the lines around. */
  spinePaths: string[];
  options: RidgeOptions;
}

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

/** Samples a cubic path (as our generators emit it) into a polyline. */
function samplePath(d: string, per = 6): Point[] {
  const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
  if (nums.length < 2) return [];
  const pts: Point[] = [{ x: nums[0], y: nums[1] }];
  let p0 = pts[0];
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const [c1x, c1y, c2x, c2y, x, y] = nums.slice(i, i + 6);
    for (let k = 1; k <= per; k += 1) {
      const t = k / per;
      const u = 1 - t;
      pts.push({
        x: u * u * u * p0.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
        y: u * u * u * p0.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y,
      });
    }
    p0 = { x, y };
  }
  return pts;
}

/** x positions where a polyline crosses the horizontal line y. */
function crossingsAt(poly: Point[], y: number): number[] {
  const out: number[] = [];
  for (let i = 1; i < poly.length; i += 1) {
    const a = poly[i - 1];
    const b = poly[i];
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      const t = (y - a.y) / (b.y - a.y);
      out.push(a.x + (b.x - a.x) * t);
    }
  }
  return out;
}

const gauss = (dx: number, sigma: number) => Math.exp(-(dx * dx) / (2 * sigma * sigma));

/** The swell's floor, and the most it can differ between neighbouring lines. */
const SWELL_MIN = 0.62;
const SWELL_ADJACENT = 1.105;
/** Fraction of the gap always kept clear between neighbouring lines. */
const NO_CROSS_MARGIN = 0.08;

/* ------------------------------------------------------------------ *
 * generation
 * ------------------------------------------------------------------ */

export function generateRidges(
  network: OrganicNetwork,
  keepOut: readonly KeepOut[],
  options: RidgeOptions,
): RidgeField {
  const rng = createRng(options.seed);
  const { width, height } = network;
  const n = Math.max(2, options.count);
  const gap = (options.bottom - options.top) / (n - 1);

  const xs: number[] = [];
  for (let x = options.margin; x <= width - options.margin; x += options.sampleStep) xs.push(x);
  if (xs[xs.length - 1] < width - options.margin) xs.push(width - options.margin);

  // The spine: every trunk (depth 0), sampled once.
  const trunks = network.branches.filter((b) => b.depth === 0);
  const spinePolys = trunks.map((b) => samplePath(b.d));

  const ridges: Ridge[] = [];
  for (let i = 0; i < n; i += 1) {
    const baseY = options.top + i * gap;
    const phase = range(rng, 0, Math.PI * 2);
    const phase2 = range(rng, 0, Math.PI * 2);
    const lift = xs.map(() => 0);

    // (1) the spine lifts the line where it crosses.
    const crossings = spinePolys.flatMap((poly) => crossingsAt(poly, baseY));
    xs.forEach((x, k) => {
      for (const cx of crossings) {
        lift[k] += options.spineHeight * gap * gauss(x - cx, options.spineSigma);
      }
    });

    // (2) organic undulation, deliberately tiny.
    xs.forEach((x, k) => {
      const w = (Math.PI * 2 * x) / options.noiseWavelength;
      lift[k] += options.noiseAmplitude * (0.5 + 0.5 * Math.sin(w + phase)) * (0.7 + 0.3 * Math.sin(w * 2.3 + phase2));
    });

    ridges.push({ id: `r${i}`, index: i, baseY, xs, lift, at: n > 1 ? i / (n - 1) : 0 });
  }

  // (3) value crests. The crest belongs to the first line at least 0.45 gap
  // below the anchor, so the mountain has height; lines below inherit it at
  // diminishing height, lines above arch over it so nothing crosses.
  const crestNodes: RidgeNode[] = [];
  options.crests.forEach((crest, ci) => {
    const target = ridges.findIndex((r) => r.baseY >= crest.y + gap * 0.45);
    if (target < 0) return;
    const h0 = ridges[target].baseY - crest.y;
    for (let i = target; i < n; i += 1) {
      const h = h0 * options.crestFalloff ** (i - target);
      if (h < 1) break;
      ridges[i].xs.forEach((x, k) => {
        ridges[i].lift[k] += h * gauss(x - crest.x, options.crestSigma);
      });
    }
    // Lines above arch over the crest. Each needs enough lift that the line
    // below can keep its own under the no-crossing rule in (4), including the
    // swell's worst case, so the requirement is propagated upward.
    let need = h0;
    for (let i = target - 1; i >= 0; i -= 1) {
      need = need * SWELL_ADJACENT - gap + gap * (NO_CROSS_MARGIN + 0.06);
      if (need <= 0) break;
      const lifted = need;
      ridges[i].xs.forEach((x, k) => {
        ridges[i].lift[k] += lifted * gauss(x - crest.x, options.crestSigma * 1.35);
      });
    }
    crestNodes.push({ id: `crest-${ci}`, x: crest.x, y: crest.y, r: 3.2, ridge: target });
  });

  // (4) nothing crosses, in any state of the ripple. The swell multiplies
  // adjacent lines by amounts that differ by at most SWELL_ADJACENT − 1, so a
  // line's lift is capped by the smaller of the two worst cases: the swell
  // at its lowest on both lines, and at its highest on both.
  for (let i = 0; i < n; i += 1) {
    const above = i > 0 ? ridges[i - 1] : null;
    const room = gap * (1 - NO_CROSS_MARGIN);
    ridges[i].lift = ridges[i].lift.map((l, k) => {
      const a = above ? above.lift[k] : 0;
      const ceiling = Math.min(
        (room + a * SWELL_MIN) / (SWELL_MIN + (SWELL_ADJACENT - 1)),
        (room + a) / SWELL_ADJACENT,
      );
      return Math.max(0, Math.min(l, ceiling));
    });
  }

  const pad = options.typePad;
  const maskRects = keepOut.map((z) => ({
    x: z.x - pad,
    y: z.y - pad,
    width: z.width + pad * 2,
    height: z.height + pad * 2,
  }));

  return {
    width,
    height,
    gap,
    ridges,
    crestNodes,
    maskRects,
    spinePaths: trunks.map((b) => b.d),
    options,
  };
}

/* ------------------------------------------------------------------ *
 * drawing
 * ------------------------------------------------------------------ */

/** Path data for a ridge with its lift scaled by `scale` (1 = full crests). */
export function ridgePath(ridge: Ridge, scale: number): string {
  const pts: Point[] = ridge.xs.map((x, k) => ({ x, y: ridge.baseY - ridge.lift[k] * scale }));
  return toPath(pts);
}

/** Resting amplitude, used before the scrub and under reduced motion. */
export const RIDGE_REST = 0.8;

/**
 * The ripple. A swell travels down the stack with scroll: crests near it stand
 * at full height, the rest sit lower. It enters above the first line and
 * leaves below the last, so at both ends of the pass the field is level.
 */
export function swell(index: number, count: number, t: number): number {
  const k = t * (count + 8) - 4;
  const d = index - k;
  const bump = Math.exp(-(d * d) / (2 * 2.2 * 2.2));
  return 0.62 + 0.38 * bump;
}
