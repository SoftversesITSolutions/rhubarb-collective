/**
 * HERO ART DIRECTION
 * ==================
 *
 * Everything that shapes the hero's composition lives here. The generator in
 * ./network.ts is deliberately parameter-driven so the visual can be redirected
 * from this file alone — change the seed for a different composition of the
 * same character, change the primaries to change the character itself.
 *
 * Field coordinates are SVG user units. Each tier declares its own field
 * proportion, seed position and typography keep-out zones, because the mobile
 * composition is designed as its own layout rather than a scaled desktop one.
 */

import type { NetworkConfig } from "./network";

/** Change this to re-roll the whole system while keeping its character. */
export const NETWORK_SEED = 48291;

export type Tier = "desktop" | "tablet" | "mobile";

/** Scroll distance the pinned hero consumes, as a multiple of viewport height. */
export const SCROLL_LENGTH: Record<Tier, number> = {
  desktop: 3.2,
  tablet: 2.9,
  mobile: 2.5,
};

/* ------------------------------------------------------------------ *
 * DESKTOP — a wide lateral field drawn as a C-shaped cradle: a base
 * runner along the foot, a traverse through the slot beneath the
 * headline, a riser that climbs the right column and fans over the
 * top, and one single strand running behind the type.
 *
 * The Sep 2026 feedback round ("the lines feel jarring") replaced the
 * earlier free-fanning primaries — 147 crossings, half the ink in a
 * branching lineage under the type, a knot beneath the last headline
 * line — with this ordered set, a calmer walk, crossing avoidance and
 * a gentler keep-out gain. Strands now pass one another rather than
 * cross, and the node family (which the client liked) is kept up with
 * waypoint nodes rather than more lines.
 * ------------------------------------------------------------------ */
const desktop: NetworkConfig = {
  seed: NETWORK_SEED,
  width: 1600,
  height: 900,
  origin: { x: 0.05, y: 0.8 },
  stemAngle: -0.3,
  stemSteps: 6,
  primaries: [
    { at: 0.3, angle: 0.5, tropism: 0.12, lengthScale: 1.0 }, // base runner along the foot
    { at: 0.55, angle: 0.2, tropism: -0.02, lengthScale: 1.6 }, // the traverse through the slot
    { at: 0.8, angle: 0.05, tropism: -0.7, lengthScale: 1.7 }, // the riser: right column, then over the top
    { at: 1, angle: -0.25, tropism: -0.32, lengthScale: 1.6, behind: true, sterile: true }, // one strand under the type
  ],
  maxDepth: 2,
  branchBudget: 66,
  baseSteps: 26,
  stepLength: 34,
  curl: 0.14,
  tropismStrength: 0.1,
  density: 0.45,
  spread: 0.62,
  childLengthRange: [0.5, 0.86],
  baseWidth: 1.5,
  nodeProbability: 0.62,
  ringProbability: 0.22,
  halftoneClusters: 3,
  margin: 60,
  avoidCrossings: true,
  clearance: 8,
  repulsionGain: 1.2,
  waypointNodeProbability: 0.1,
  // 0.7 CSS px at the design viewport (1600-unit field in a 1440px frame).
  minWidth: 0.78,
  behindKeepOut: 0,
  keepOut: [
    // Measured from the rendered glyph line boxes at 1440x900 (Sep 2026), inset
    // to the ink band. One zone per headline line, following the staggered
    // indents, so growth threads the pockets the ragged setting leaves.
    { x: 52, y: 224, width: 534, height: 90, influence: 54, strength: 0.95 }, // WE ARE A
    { x: 230, y: 317, width: 1151, height: 90, influence: 54, strength: 0.95 }, // FORWARD-THINKING,
    { x: 52, y: 410, width: 831, height: 90, influence: 54, strength: 0.95 }, // NO-NONSENSE
    { x: 304, y: 503, width: 995, height: 90, influence: 54, strength: 0.95 }, // CREATIVE STUDIO.
    { x: 60, y: 72, width: 460, height: 66, influence: 44, strength: 0.6 }, // logo lockup + eyebrow
    // A soft zone sized to the two lines of copy, not the block around them:
    // the old 124-unit-tall zone at strength 1 fought the headline zone above
    // it and the slot strands zigzagged between the two.
    { x: 912, y: 738, width: 430, height: 62, influence: 44, strength: 1 }, // supporting copy
  ],
};

/* ------------------------------------------------------------------ *
 * TABLET — a squarer field, the same cradle in a tighter frame: the
 * slot between headline and supporting copy is deeper here, so the
 * traverse and riser have room to separate before the right column.
 * ------------------------------------------------------------------ */
const tablet: NetworkConfig = {
  ...desktop,
  width: 1080,
  height: 1000,
  origin: { x: 0.08, y: 0.84 },
  stemAngle: -0.36,
  stemSteps: 5,
  primaries: [
    { at: 0.35, angle: 0.7, tropism: 0.26, lengthScale: 0.9 }, // base runner, kept low so its children clear the copy
    { at: 0.65, angle: 0.15, tropism: -0.05, lengthScale: 1.6 }, // traverse
    { at: 0.85, angle: 0.15, tropism: -0.5, lengthScale: 1.5 }, // riser: one long diagonal, then the column
    { at: 1, angle: -0.2, tropism: -0.36, lengthScale: 1.4, behind: true, sterile: true },
  ],
  branchBudget: 48,
  baseSteps: 22,
  stepLength: 30,
  curl: 0.14,
  tropismStrength: 0.13,
  density: 0.53,
  spread: 0.62,
  childLengthRange: [0.58, 0.92],
  maxDepth: 2,
  halftoneClusters: 2,
  margin: 50,
  // 0.7 CSS px in a 834px frame (1080-unit field).
  minWidth: 0.9,
  keepOut: [
    // Measured at 834x1112. The field is letterboxed in a portrait frame, so
    // the lockup sits above it; its zone is kept only so nothing grows into
    // the top edge beneath it.
    { x: 32, y: -40, width: 380, height: 52, influence: 30, strength: 0.6 }, // logo lockup + eyebrow
    { x: 32, y: 173, width: 422, height: 70, influence: 44, strength: 0.95 }, // WE ARE A
    { x: 112, y: 246, width: 904, height: 70, influence: 44, strength: 0.95 }, // FORWARD-THINKING,
    { x: 32, y: 318, width: 653, height: 70, influence: 44, strength: 0.95 }, // NO-NONSENSE
    { x: 162, y: 391, width: 782, height: 70, influence: 44, strength: 0.95 }, // CREATIVE STUDIO.
    { x: 422, y: 860, width: 413, height: 60, influence: 40, strength: 0.6 }, // supporting copy
  ],
};

/* ------------------------------------------------------------------ *
 * MOBILE — a tall field, its own composition rather than a shrunken
 * desktop. The seed sits low; a base runner creeps along the foot, one
 * traverse runs right beneath the supporting copy and climbs the
 * gutter beside it, and the single behind strand crosses to the top
 * right, so the screen still reads as one system at a fraction of the
 * branch count.
 * ------------------------------------------------------------------ */
const mobile: NetworkConfig = {
  ...desktop,
  width: 760,
  height: 1280,
  origin: { x: 0.12, y: 0.9 },
  stemAngle: -0.42,
  stemSteps: 5,
  primaries: [
    { at: 0.4, angle: 0.5, tropism: 0.2, lengthScale: 0.7 }, // base runner
    { at: 0.7, angle: 0.15, tropism: -0.6, lengthScale: 1.6 }, // traverse, then the gutter
    { at: 1, angle: -0.25, tropism: -0.5, lengthScale: 1.6, behind: true, sterile: true },
  ],
  maxDepth: 2,
  branchBudget: 28,
  baseSteps: 18,
  stepLength: 26,
  curl: 0.14,
  tropismStrength: 0.1,
  density: 0.84,
  spread: 0.75,
  childLengthRange: [0.66, 0.98],
  baseWidth: 1.6,
  nodeProbability: 0.62,
  halftoneClusters: 2,
  margin: 36,
  // 0.7 CSS px in a 390px frame (760-unit field).
  minWidth: 1.36,
  keepOut: [
    // Measured at 390x844. Mobile type stacks into six short lines; the ragged
    // right edge leaves a gutter the network can climb, and the band between
    // the headline and the supporting copy is where the traverse runs.
    { x: 30, y: 20, width: 536, height: 62, influence: 30, strength: 0.6 }, // logo lockup + eyebrow
    { x: 31, y: 241, width: 413, height: 70, influence: 34, strength: 0.95 }, // WE ARE A
    { x: 72, y: 313, width: 469, height: 70, influence: 34, strength: 0.95 }, // FORWARD-
    { x: 72, y: 384, width: 436, height: 70, influence: 34, strength: 0.95 }, // THINKING,
    { x: 31, y: 455, width: 641, height: 70, influence: 34, strength: 0.95 }, // NO-NONSENSE
    { x: 92, y: 526, width: 414, height: 70, influence: 34, strength: 0.95 }, // CREATIVE
    { x: 92, y: 598, width: 346, height: 70, influence: 34, strength: 0.95 }, // STUDIO.
    { x: 31, y: 974, width: 614, height: 84, influence: 46, strength: 0.6 }, // supporting copy
  ],
};

export const NETWORK_CONFIG: Record<Tier, NetworkConfig> = {
  desktop,
  tablet,
  mobile,
};

/* ------------------------------------------------------------------ *
 * Timing map for the scroll-driven narrative. Values are fractions of the
 * pinned scroll timeline, and are the single place to retune pacing.
 * ------------------------------------------------------------------ */
export const BEATS = {
  /** Window the procedural growth is spread across. */
  growth: { start: 0.02, end: 0.54 },
  eyebrow: { start: 0.36, end: 0.47 },
  headline: { start: 0.44, end: 0.72 },
  support: { start: 0.66, end: 0.78 },
  /** Network reorganising itself around the established typography. */
  interaction: { start: 0.54, end: 0.88 },
  /** Network reaching past the hero into the next section. */
  handoff: { start: 0.84, end: 1 },
} as const;

/* ------------------------------------------------------------------ *
 * The dive — the last viewport of the pin, after the hand-off beat.
 * Client feedback (Sep 2026, note 3): leaving the hero felt like a page
 * scrolling away; they asked to *enter* the world of nodes instead. So the
 * scroll stops carrying the reader down and carries them in: the copy
 * dissolves, the field comes toward them about the point where its strands
 * leave the frame, the black lifts, and section 01 is already waiting
 * beneath. Section 01 overlaps the hero by exactly this much and holds for
 * exactly this long, so nothing below moves.
 *
 * Fractions of the dive, not of the narrative.
 * ------------------------------------------------------------------ */
/** Scroll the dive consumes, in viewport heights. The same on every tier. */
export const DIVE_LENGTH = 1;
/** How far the field comes toward the reader by the end. */
export const DIVE_SCALE = 2.6;
export const DIVE = {
  /** The copy has been read: it dissolves first. */
  copy: { start: 0, end: 0.3 },
  /** The boundary band brightens briefly, then goes — the edge is no longer an edge. */
  band: { start: 0.05, end: 0.5 },
  zoom: { start: 0, end: 1 },
  /** The strands thin out as they pass — ahead of the lift finishing, so the
   *  two fields hand over rather than pile up. */
  fade: { start: 0.5, end: 0.9 },
  /** The stage's black lifts to reveal section 01 beneath. */
  lift: { start: 0.55, end: 0.85 },
} as const;

/* ------------------------------------------------------------------ *
 * The opening: the logo intro that plays once on load, before the seed.
 * In seconds, not scroll fractions — this part is autonomous. The logo
 * used to arrive on the scrubbed timeline at 0.28–0.42; since the opening
 * leaves it in the lockup, that beat no longer exists.
 * ------------------------------------------------------------------ */
export const LOGO_INTRO = {
  /** Black hold before anything appears. */
  void: 0.3,
  /** The mark's soft top-down wipe. */
  wipe: 1.0,
  /** COLLECTIVE fades up beneath it, starting this long before the wipe ends. */
  wordlineLead: 0.3,
  wordline: 0.45,
  /** The finished mark holding centre-stage before it moves. */
  hold: 0.45,
  /** The glide into the lockup. */
  travel: 0.9,
  /** How far into the travel the seed is born, as a fraction of it. */
  seedOverlap: 0.4,
  /** The longest the opening waits for the logo image before starting anyway. */
  imageTimeout: 1.5,
} as const;
