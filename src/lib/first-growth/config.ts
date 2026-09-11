/**
 * FIRST GROWTH — ART DIRECTION
 * ============================
 *
 * Section two is not a new organism. It is the hero's network continuing, and
 * it inherits three things directly:
 *
 *   • the seed
 *   • the drawing primitives (curved walk, Catmull-Rom, measurement)
 *   • entry points taken from where the hero's strands actually left the frame
 *
 * What it does NOT inherit is the hero's growth *loop*, and that distinction is
 * the point. The hero walks freely with a lateral tropism and forks mid-branch,
 * which suits a wide field. Driving that same loop downward through a tall
 * field produced long near-vertical filaments — hanging roots. So growth here
 * runs through ./cascade.ts instead: individual strands still travel laterally
 * exactly as they do in the hero, and downward progress is emergent, produced
 * by junctions stepping the structure down the field.
 *
 * Field coordinates are SVG user units, and the section's CSS pins its own
 * aspect-ratio to the field's. That is deliberate: it makes one field unit map
 * to exactly one layout percentage, so the keep-out rectangles below sit under
 * the type they were drawn for, the value labels land where they are placed,
 * and an inlet at x = 42 meets the hero strand that exited at x = 42.
 */

import { NETWORK_CONFIG, NETWORK_SEED, type Tier } from "@/lib/hero/config";
import { generateOrganicNetwork, type OrganicNetwork } from "@/lib/hero/network";
import type { CascadeConfig, CascadeInlet } from "./cascade";
import type { ConnectionOptions } from "./connections";
import type { AnnotationSlot } from "./annotations";

/* ------------------------------------------------------------------ *
 * Inheriting the seam
 * ------------------------------------------------------------------ */

const heroNetworkCache = new Map<Tier, OrganicNetwork>();

/** The hero's network for a tier. Pure and deterministic, so caching is free. */
function heroNetwork(tier: Tier): OrganicNetwork {
  let cached = heroNetworkCache.get(tier);
  if (!cached) {
    cached = generateOrganicNetwork(NETWORK_CONFIG[tier]);
    heroNetworkCache.set(tier, cached);
  }
  return cached;
}

/**
 * The hero's outgoing strands, as this section's entry points.
 *
 * Every inlet is a real hero descender — `exitX` is where that strand actually
 * crossed the hero's lower edge and `exitLean` is the way it was leaning as it
 * went. Nothing is invented and nothing is padded out: four hero strands become
 * four trunks, which is what makes them individually traceable across the seam.
 *
 * Mobile takes the three most separated of them, because a 390px column cannot
 * carry four trunks without the structure reading as tangle.
 */
function inletsFor(tier: Tier, limit: number): CascadeInlet[] {
  const { descenders } = heroNetwork(tier);
  const all: CascadeInlet[] = descenders.map((strand) => ({
    x: strand.exitX / 100,
    lean: strand.exitLean,
  }));

  if (all.length <= limit) return all;

  // Keep the most widely spaced entries rather than simply the first N.
  const sorted = [...all].sort((a, b) => a.x - b.x);
  const kept: CascadeInlet[] = [sorted[0]];
  for (let i = 1; i < sorted.length && kept.length < limit; i += 1) {
    if (sorted[i].x - kept[kept.length - 1].x > 0.12) kept.push(sorted[i]);
  }
  for (const candidate of sorted) {
    if (kept.length >= limit) break;
    if (!kept.includes(candidate)) kept.push(candidate);
  }
  return kept.slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * DESKTOP
 *
 * Field 1600 × 1900. Marker and statement upper-left, brand voice laddered
 * down the middle band, narrative lower-right, and the cascade stepping
 * laterally between them.
 * ------------------------------------------------------------------ */
const desktop = (): CascadeConfig => ({
  seed: NETWORK_SEED,
  width: 1600,
  height: 1900,
  inlets: inletsFor("desktop", 4),
  trunkStages: 8,
  segmentBudget: 46,
  // ~460 units of lateral travel before a run must resolve. Long enough to read
  // as one of the hero's sweeping strands, short enough that nothing ever
  // becomes an unsupported filament.
  runLength: [380, 520],
  stepLength: 34,
  curl: 0.16,
  tropismStrength: 0.1,
  // Radians below horizontal. At ~0.55 a run travels roughly 1.6 units sideways
  // for every 1 unit down, which is what keeps the reading lateral.
  descent: [0.42, 0.62],
  descentSpread: 0.34,
  // Steeper on arrival, matching the angle the hero's boundary strands leave
  // at, then pulled round to lateral inside the first run.
  entryAngle: 1.05,
  // Trimmed from 0.5 / 0.32 in the continuity revamp: this section is ROOT →
  // GROWTH, a few dominant trunks with occasional offshoots — and reversals
  // in confined pockets were curling strands into the teardrop loops that
  // read as spaghetti at the top of the field.
  offshootChance: 0.36,
  offshootForkChance: 0.3,
  reverseChance: 0.2,
  baseWidth: 1.4,
  margin: 40,
  // One rectangle per real block of type. Mirrors firstGrowth.css.
  keepOut: [
    { x: 60, y: 232, width: 300, height: 44, influence: 60, strength: 0.3 }, // 01 marker
    { x: 60, y: 430, width: 1180, height: 82, influence: 84, strength: 0.42 }, // BUILT TO TURN ENDURING
    { x: 188, y: 512, width: 1075, height: 82, influence: 84, strength: 0.42 }, // IDEAS INTO MEMORABLE
    { x: 764, y: 594, width: 650, height: 82, influence: 84, strength: 0.42 }, // EXPERIENCES.
    { x: 190, y: 808, width: 340, height: 44, influence: 54, strength: 0.3 }, // value 1
    { x: 1060, y: 928, width: 340, height: 44, influence: 54, strength: 0.3 }, // value 2
    { x: 330, y: 1048, width: 340, height: 44, influence: 54, strength: 0.3 }, // value 3
    { x: 950, y: 1168, width: 340, height: 44, influence: 54, strength: 0.3 }, // value 4
    { x: 940, y: 1330, width: 600, height: 360, influence: 84, strength: 0.44 }, // narrative
  ],
});

/* ------------------------------------------------------------------ *
 * TABLET — the same reading order in a narrower column, one stage shorter.
 * ------------------------------------------------------------------ */
const tablet = (): CascadeConfig => ({
  ...desktop(),
  width: 1080,
  height: 1850,
  inlets: inletsFor("tablet", 4),
  trunkStages: 7,
  segmentBudget: 36,
  runLength: [330, 450],
  stepLength: 30,
  descent: [0.44, 0.64],
  descentSpread: 0.32,
  // Trimmed for the same reason as mobile: the derived stage count lengthens
  // every trunk's descent, so the old rate would have raised the density along
  // with it. See `withDerivedStages`.
  offshootChance: 0.26,
  // 1080-unit design space at 834 is a 0.77× scale, so 1.4 units drew at
  // 1.08 CSS px. A small correction to sit level with the desktop weight.
  baseWidth: 1.55,
  margin: 34,
  keepOut: [
    { x: 48, y: 210, width: 280, height: 40, influence: 50, strength: 0.3 }, // 01 marker
    { x: 48, y: 380, width: 880, height: 76, influence: 70, strength: 0.42 }, // line 1
    { x: 124, y: 456, width: 800, height: 76, influence: 70, strength: 0.42 }, // line 2
    { x: 461, y: 532, width: 480, height: 76, influence: 70, strength: 0.42 }, // line 3
    { x: 130, y: 790, width: 310, height: 40, influence: 44, strength: 0.3 }, // value 1
    { x: 650, y: 906, width: 310, height: 40, influence: 44, strength: 0.3 }, // value 2
    { x: 220, y: 1022, width: 310, height: 40, influence: 44, strength: 0.3 }, // value 3
    { x: 600, y: 1138, width: 310, height: 40, influence: 44, strength: 0.3 }, // value 4
    { x: 400, y: 1330, width: 630, height: 360, influence: 74, strength: 0.44 }, // narrative
  ],
});

/* ------------------------------------------------------------------ *
 * MOBILE — three trunks in a single reading column. Its own composition,
 * not a squeezed desktop.
 * ------------------------------------------------------------------ */
const mobile = (): CascadeConfig => ({
  ...desktop(),
  width: 760,
  height: 2200,
  inlets: inletsFor("mobile", 3),
  trunkStages: 7,
  segmentBudget: 22,
  runLength: [270, 360],
  stepLength: 26,
  descent: [0.58, 0.8],
  descentSpread: 0.26,
  entryAngle: 1.15,
  // Fewer side twigs than before. Deriving the stage count (see
  // `withDerivedStages`) roughly doubles how far a trunk travels down this
  // field, and holding the old offshoot rate over that longer descent would
  // have thickened the narrow column into a mat. The mobile field should read
  // as a few long strands running the length of the section, not a web.
  offshootChance: 0.2,
  offshootForkChance: 0.2,
  // The one responsive stroke adjustment on the page, and it is a correction
  // rather than a preference: this section renders in a fixed 760-unit design
  // space scaled to the viewport, so at 390 every stroke is drawn at 0.51× and
  // 1.5 units landed as 0.77 CSS px — visibly fainter than the same network at
  // desktop (1.26px). 1.9 units brings it back to ~0.97px, in line with the
  // rest of the organism instead of heavier than it.
  baseWidth: 1.9,
  margin: 26,
  // Mobile blocks are treated whole rather than line by line — the column is
  // narrow enough that per-line rectangles would leave no route through.
  keepOut: [
    { x: 36, y: 168, width: 260, height: 40, influence: 40, strength: 0.3 },
    { x: 36, y: 360, width: 640, height: 320, influence: 74, strength: 0.42 },
    { x: 36, y: 810, width: 600, height: 380, influence: 62, strength: 0.3 },
    { x: 36, y: 1370, width: 660, height: 500, influence: 80, strength: 0.44 },
  ],
});

const BUILDERS: Record<Tier, () => CascadeConfig> = { desktop, tablet, mobile };

/**
 * ENOUGH STAGES TO ACTUALLY CROSS THE FIELD.
 *
 * `trunkStages` was a hand-set constant per tier, and on the two narrow tiers it
 * was too small for the field it had to span. A trunk descends roughly
 * `averageRun × sin(descent)` per stage, so the reach is `stages × drop`:
 *
 *   desktop  1600×1900  8 stages × ~225  = 1800   ≈ spans the field
 *   tablet   1080×1850  7 stages × ~200  = 1400   — 450 short
 *   mobile    760×2200  7 stages × ~200  = 1400   — 800 short
 *
 * The narrow tiers have the TALLEST design fields (mobile is 2200 units against
 * desktop's 1900) and were given the FEWEST stages, so growth died a third of
 * the way up the section. Measured on the live page, Section 2's deepest strand
 * ended 670 units above its own foot at 390 and 263 at 834 — a dead band of
 * ~344 and ~203 CSS px immediately above Selected Work, which is the single most
 * visible "the network stopped and a new one started" moment on the page. It
 * also starved the handoff: with nothing reaching the foot, Section 3 fell back
 * to an invented root (see `lib/network/continuity`).
 *
 * Deriving the count from the field's own geometry — the way Sections 3 to 8
 * already derive theirs from their measured height — makes it correct at every
 * tier and keeps it correct if a field is ever resized.
 */
function withDerivedStages(config: CascadeConfig): CascadeConfig {
  const averageRun = (config.runLength[0] + config.runLength[1]) / 2;
  // Worst-case descent, not the average: `descentSpread` fans one trunk to the
  // shallow end, and a run cut short by a keep-out or a wall drops less still.
  // Budgeting for the mean left the shallow-fanned trunk ~194 units above the
  // mobile foot, and the seam entry that continued it hung in space.
  const worstDescent = Math.max(0.2, config.descent[0] - config.descentSpread / 2 - 0.1);
  const dropPerStage = Math.max(60, averageRun * Math.sin(worstDescent));

  // One spare stage, because the last one rarely lands exactly on the edge.
  const trunkStages = Math.ceil(config.height / dropPerStage) + 1;

  // The queue is breadth-first, so every offshoot spends a segment a trunk stage
  // would otherwise have had. Budgeting exactly `inlets × stages` starves the
  // deepest stages and the field ends short of its own foot regardless of the
  // stage count — the same multiplier Sections 6 to 8 use for the same reason.
  const segmentBudget = Math.round(config.inlets.length * trunkStages * 1.35) + 6;

  return { ...config, trunkStages, segmentBudget };
}

const configCache = new Map<Tier, CascadeConfig>();

export function firstGrowthConfig(tier: Tier): CascadeConfig {
  let cached = configCache.get(tier);
  if (!cached) {
    cached = withDerivedStages(BUILDERS[tier]());
    configCache.set(tier, cached);
  }
  return cached;
}

/* ------------------------------------------------------------------ *
 * Connection mesh — how much of the collective is spelled out.
 *
 * Deliberately few. A connection only earns its place when it joins two real
 * junctions across two different trunks; more than a handful and the mesh reads
 * as tangle rather than as interconnection.
 * ------------------------------------------------------------------ */
export const CONNECTION_OPTIONS: Record<Tier, Omit<ConnectionOptions, "keepOut">> = {
  desktop: {
    seed: NETWORK_SEED + 17,
    max: 6,
    minDistance: 140,
    maxDistance: 580,
    maxPerNode: 2,
  },
  tablet: {
    seed: NETWORK_SEED + 17,
    max: 5,
    minDistance: 120,
    maxDistance: 500,
    maxPerNode: 2,
  },
  mobile: {
    seed: NETWORK_SEED + 17,
    max: 3,
    minDistance: 90,
    maxDistance: 380,
    maxPerNode: 2,
  },
};

/* ------------------------------------------------------------------ *
 * Brand-value annotations.
 *
 * Fixed, art-directed slots — an alternating ladder down the middle band of
 * the field. These are the source of truth for three things that must agree:
 * the layout percentages the labels render at, the keep-out rectangles above,
 * and the leaders the SVG draws back to the network. `maxLeader` is how far a
 * label may reach for a junction before it is left to stand on its own.
 * ------------------------------------------------------------------ */
export const ANNOTATION_OPTIONS: Record<
  Tier,
  {
    slots: AnnotationSlot[];
    maxLeader: number;
    labelWidth: number;
    labelHeight: number;
    /**
     * Whether the labels hang off the network. Mobile reads them as a plain
     * stacked list instead: a 390px column has nowhere to run a leader, and
     * legibility beats the flourish.
     */
    anchored: boolean;
  }
> = {
  desktop: {
    slots: [
      { x: 0.119, y: 0.4368, side: "right" },
      { x: 0.875, y: 0.5, side: "left" },
      { x: 0.206, y: 0.5632, side: "right" },
      { x: 0.806, y: 0.6263, side: "left" },
    ],
    maxLeader: 230,
    labelWidth: 340,
    labelHeight: 44,
    anchored: true,
  },
  tablet: {
    slots: [
      { x: 0.12, y: 0.4378, side: "right" },
      { x: 0.88, y: 0.5005, side: "left" },
      { x: 0.204, y: 0.5632, side: "right" },
      { x: 0.833, y: 0.6259, side: "left" },
    ],
    maxLeader: 200,
    labelWidth: 310,
    labelHeight: 40,
    anchored: true,
  },
  mobile: {
    slots: [],
    maxLeader: 0,
    labelWidth: 250,
    labelHeight: 40,
    anchored: false,
  },
};

/* ------------------------------------------------------------------ *
 * Timing. Fractions of the section's own scroll pass — not of a pinned
 * sequence. Section two is read through, not held.
 * ------------------------------------------------------------------ */
export const FG_BEATS = {
  /** Strands arriving from the hero and the cascade resolving. */
  arrival: { start: 0.04, end: 0.5 },
  /** Chords forming between trunks — the collective. */
  connect: { start: 0.34, end: 0.78 },
  /** The Work strand taking over as the dominant direction. */
  handoff: { start: 0.76, end: 0.98 },
} as const;
