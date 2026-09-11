/**
 * SECTION 03 — THE NETWORK CONTINUING
 *
 * Selected Work is not a gallery that happens to follow the network. It is the
 * next field the same organism grows into, so this file does not invent a
 * decorative system: it runs Section 2's own generator again.
 *
 *   generateCascade()  — identical growth rules, identical grammar
 *   inlets             — the actual trunks that left Section 2 through its foot,
 *                        at the x they left from, leaning the way they were
 *                        leaning when they went
 *
 * Every line that ends up on screen therefore traces back to a Section 2 trunk
 * through a chain of real junctions and offshoots. There are no ornamental
 * curves and nothing is drawn to fill space.
 *
 * The field is measured from the rendered section rather than assumed, so one
 * SVG user unit is one CSS pixel. That keeps branch geometry undistorted and
 * lets the work images be handed in as keep-out rectangles in their real
 * positions — the network then favours the negative space the composition
 * already leaves, while still crossing behind a piece here and there.
 */

import type { Tier } from "@/lib/hero/config";
import type { KeepOut, OrganicNetwork } from "@/lib/hero/network";
import { NETWORK_SEED } from "@/lib/hero/config";
import { firstGrowthConfig } from "@/lib/first-growth/config";
import { generateCascade, type CascadeInlet } from "@/lib/first-growth/cascade";
import { readExits } from "@/lib/network/continuity";

/* ------------------------------------------------------------------ *
 * Inheriting Section 2's exits
 * ------------------------------------------------------------------ */

/**
 * Horizontal direction a path is travelling at its final point.
 *
 * Moved to `lib/network/continuity` alongside the seam contract that uses it,
 * and re-exported here so the sections that already import it from this module
 * keep working unchanged.
 */
export { exitLeanOf } from "@/lib/network/continuity";

const inletCache = new Map<Tier, CascadeInlet[]>();

/**
 * The trunks leaving Section 2 through its lower edge, as this section's entry
 * points. Section 2's cascade is a pure function, so this reads its real
 * geometry without touching or changing a single Section 2 file.
 *
 * Only trunks are taken — offshoots are short side twigs and would enter as
 * stubs — and only those that actually reached the foot of that field.
 */
export function workInlets(tier: Tier): CascadeInlet[] {
  const cached = inletCache.get(tier);
  if (cached) return cached;

  const config = firstGrowthConfig(tier);
  const network = generateCascade(config);

  // Entries are kept apart so the continuation opens across the field instead
  // of arriving as a bundle, and the deepest — Section 2's Work route — is
  // always kept.
  //
  // THIS USED TO END WITH `if (kept.length === 0) kept.push({ x: 0.5, lean: 1 })`,
  // an invented root at dead centre. It fired at every tablet and mobile width,
  // because Section 2's trunks stopped well short of the foot there, and it
  // silently re-rooted the entire organism below this seam at a point that had
  // never grown anywhere: measured entry x was exactly 0.500 at 834 and 390
  // against a genuine 0.777 at 1440. `readExits` cannot invent a coordinate —
  // when the preferred trunks are missing it falls back to the next-deepest
  // real ones, and Section 2 now reaches its own foot at every tier anyway.
  const kept = readExits(network, {
    min: 2,
    max: 3,
    spacing: 0.1,
    foot: network.height - config.margin * 2,
  });

  inletCache.set(tier, kept);
  return kept;
}

/* ------------------------------------------------------------------ *
 * Growing the continuation
 * ------------------------------------------------------------------ */

interface TierShape {
  /**
   * Headroom on top of the stages needed to reach the foot of the field. The
   * stage count itself is derived from the measured height — a fixed number
   * cannot span a section whose height is decided by its images.
   */
  segmentHeadroom: number;
  /** Fractions of the field width. */
  runLength: [number, number];
  stepLength: number;
  offshootChance: number;
  baseWidth: number;
  /** How hard the work images push growth away, 0..1. */
  imageStrength: number;
}

/**
 * Deliberately lighter than Section 2 at every tier. The network is no longer
 * the subject here — it is the medium the work sits in — so it spends its
 * budget on reach rather than mass.
 */
const SHAPE: Record<Tier, TierShape> = {
  desktop: {
    segmentHeadroom: 14,
    runLength: [0.24, 0.34],
    stepLength: 30,
    offshootChance: 0.15,
    baseWidth: 1.25,
    imageStrength: 0.3,
  },
  tablet: {
    segmentHeadroom: 11,
    runLength: [0.26, 0.36],
    stepLength: 26,
    offshootChance: 0.14,
    baseWidth: 1.25,
    imageStrength: 0.28,
  },
  mobile: {
    segmentHeadroom: 6,
    runLength: [0.3, 0.42],
    stepLength: 22,
    offshootChance: 0.12,
    baseWidth: 1.35,
    imageStrength: 0.24,
  },
};

export interface WorkFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Work image rectangles, in the same pixel space. */
  images: { x: number; y: number; width: number; height: number }[];
}

const DESCENT: [number, number] = [0.5, 0.78];

export function generateWorkNetwork(input: WorkFieldInput): OrganicNetwork {
  const shape = SHAPE[input.tier];
  const inlets = workInlets(input.tier);

  // How far a single lateral run falls, and therefore how many of them a trunk
  // needs to cross this field. Derived rather than guessed, so the growth
  // reaches the foot of the section at every tier and every content height.
  const averageRun = input.width * ((shape.runLength[0] + shape.runLength[1]) / 2);
  // Stages are derived from the SHALLOWEST fanned descent, not the average:
  // `descentSpread` fans each trunk's descent bias, and a trunk fanned to the
  // shallow end drops far less per stage than the mean predicts. Budgeting for
  // the average left those trunks stranded mid-field — measured at 1440, they
  // ended up to 0.14 of the height above the foot, and every seam entry that
  // continued them below visibly hung in space.
  const dropPerStage = Math.max(
    60,
    averageRun * Math.sin(Math.max(0.2, DESCENT[0] - 0.15)),
  );
  const trunkStages = Math.ceil(input.height / dropPerStage) + 1;
  // ×1.35 pays for the offshoots SEPARATELY from the descent: the queue is
  // breadth-first, so a budget of exactly inlets × stages spends the deepest
  // stages on side growth and the trunks die just above the foot — measured
  // at 1440, only one of three trunks crossed, and the two seam entries below
  // therefore continued from strands that ended up to 490px short.
  const segmentBudget =
    Math.round(inlets.length * trunkStages * 1.35) + shape.segmentHeadroom;

  // Weak, wide fields rather than hard walls. Growth should prefer the negative
  // space the composition already leaves without being forbidden from crossing
  // behind a piece — the images sit above the network, so a crossing costs the
  // artwork nothing and is what makes the work feel embedded in the system.
  const keepOut: KeepOut[] = input.images.map((rect) => ({
    ...rect,
    influence: Math.max(70, Math.min(rect.width, rect.height) * 0.42),
    strength: shape.imageStrength,
  }));

  return generateCascade({
    // Same seed family as the rest of the organism.
    seed: NETWORK_SEED + 91,
    width: input.width,
    height: input.height,
    inlets,
    trunkStages,
    segmentBudget,
    runLength: [input.width * shape.runLength[0], input.width * shape.runLength[1]],
    stepLength: shape.stepLength,
    curl: 0.2,
    tropismStrength: 0.12,
    // Shallower than Section 2: this field is far taller than it is wide, and a
    // steep descent would read as the vertical filaments that section had to
    // shed. Lateral travel with a long fall is the same grammar, stretched.
    descent: DESCENT,
    descentSpread: 0.3,
    entryAngle: 1.1,
    offshootChance: shape.offshootChance,
    offshootForkChance: 0.25,
    // 0.34 knotted the field: a reversal in a pocket between two images sent
    // a run straight back through the one it just crossed.
    reverseChance: 0.2,
    baseWidth: shape.baseWidth,
    keepOut,
    margin: 26,
  });
}
