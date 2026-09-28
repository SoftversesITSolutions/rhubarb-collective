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
 * DESKTOP — a wide lateral field. Growth starts low-left, runs right
 * along the base, then climbs the right edge and arcs back over the top,
 * cradling the headline in a soft C of organic structure.
 * ------------------------------------------------------------------ */
const desktop: NetworkConfig = {
  seed: NETWORK_SEED,
  width: 1600,
  height: 900,
  origin: { x: 0.05, y: 0.8 },
  stemAngle: -0.3,
  stemSteps: 6,
  primaries: [
    { at: 0.3, angle: 0.42, tropism: 0.16, lengthScale: 0.85 }, // settles along the base
    { at: 0.5, angle: -0.34, tropism: -0.14, lengthScale: 0.7 }, // low tendril under the type
    { at: 0.72, angle: 0.2, tropism: -0.02, lengthScale: 1.6 }, // the long lateral traverse
    { at: 0.88, angle: -0.2, tropism: -0.1, lengthScale: 1.35 }, // mid-field, slowly rising
    { at: 1, angle: -0.16, tropism: -0.26, lengthScale: 1.5, behind: true }, // climbs under the type
  ],
  maxDepth: 3,
  branchBudget: 60,
  baseSteps: 26,
  stepLength: 34,
  curl: 0.34,
  tropismStrength: 0.07,
  density: 0.55,
  spread: 0.95,
  childLengthRange: [0.5, 0.86],
  baseWidth: 1.5,
  nodeProbability: 0.34,
  ringProbability: 0.22,
  halftoneClusters: 3,
  margin: 60,
  // One zone per headline line, following the staggered indents. Growth
  // therefore threads the pockets the ragged setting leaves behind instead of
  // being walled off by a single monolithic block.
  keepOut: [
    { x: 60, y: 246, width: 530, height: 84, influence: 54, strength: 0.95 }, // WE ARE A
    { x: 245, y: 336, width: 955, height: 84, influence: 54, strength: 0.95 }, // FORWARD-THINKING,
    { x: 60, y: 426, width: 710, height: 84, influence: 54, strength: 0.95 }, // NO-NONSENSE
    { x: 325, y: 516, width: 885, height: 84, influence: 54, strength: 0.95 }, // CREATIVE STUDIO.
    { x: 60, y: 108, width: 500, height: 64, influence: 44, strength: 0.6 }, // eyebrow
    { x: 900, y: 676, width: 640, height: 124, influence: 96, strength: 1 }, // supporting copy
  ],
};

/* ------------------------------------------------------------------ *
 * TABLET — a squarer field. Fewer branches, shorter runs, the same
 * lateral character but a tighter frame around the type.
 * ------------------------------------------------------------------ */
const tablet: NetworkConfig = {
  ...desktop,
  width: 1080,
  height: 1000,
  origin: { x: 0.08, y: 0.84 },
  stemAngle: -0.36,
  stemSteps: 5,
  primaries: [
    { at: 0.35, angle: 0.44, tropism: 0.2, lengthScale: 0.75 },
    { at: 0.6, angle: 0.24, tropism: -0.04, lengthScale: 1.4 },
    { at: 0.82, angle: -0.24, tropism: -0.18, lengthScale: 1.2 },
    { at: 1, angle: -0.18, tropism: -0.34, lengthScale: 1.35, behind: true },
  ],
  branchBudget: 46,
  baseSteps: 22,
  stepLength: 30,
  density: 0.82,
  childLengthRange: [0.58, 0.92],
  maxDepth: 3,
  halftoneClusters: 2,
  margin: 50,
  keepOut: [
    { x: 48, y: 124, width: 430, height: 58, influence: 40, strength: 0.6 }, // eyebrow
    { x: 48, y: 272, width: 400, height: 78, influence: 44, strength: 0.95 }, // WE ARE A
    { x: 48, y: 358, width: 800, height: 78, influence: 44, strength: 0.95 }, // FORWARD-THINKING,
    { x: 48, y: 444, width: 570, height: 78, influence: 44, strength: 0.95 }, // NO-NONSENSE
    { x: 190, y: 530, width: 740, height: 78, influence: 44, strength: 0.95 }, // CREATIVE STUDIO.
    { x: 410, y: 726, width: 620, height: 130, influence: 82, strength: 1 }, // supporting copy
  ],
};

/* ------------------------------------------------------------------ *
 * MOBILE — a tall field, its own composition rather than a shrunken
 * desktop. The seed sits low, growth creeps sideways in short runs and
 * stacks upward past the type, so the screen still reads as an ecosystem
 * at a fraction of the branch count.
 * ------------------------------------------------------------------ */
const mobile: NetworkConfig = {
  ...desktop,
  width: 760,
  height: 1280,
  origin: { x: 0.12, y: 0.9 },
  stemAngle: -0.42,
  stemSteps: 5,
  primaries: [
    { at: 0.4, angle: 0.5, tropism: 0.24, lengthScale: 0.6 },
    { at: 0.7, angle: 0.26, tropism: -0.1, lengthScale: 1.35 },
    { at: 1, angle: -0.2, tropism: -0.42, lengthScale: 1.5, behind: true },
  ],
  maxDepth: 2,
  branchBudget: 26,
  baseSteps: 18,
  stepLength: 26,
  curl: 0.4,
  density: 1.05,
  spread: 0.9,
  childLengthRange: [0.66, 0.98],
  baseWidth: 1.6,
  nodeProbability: 0.42,
  halftoneClusters: 2,
  margin: 36,
  // Mobile type stacks into six short lines; the ragged right edge leaves a
  // gutter the network can climb, so the composition still breathes.
  keepOut: [
    { x: 36, y: 156, width: 330, height: 44, influence: 30, strength: 0.6 }, // eyebrow
    { x: 36, y: 330, width: 300, height: 76, influence: 34, strength: 0.95 }, // WE ARE A
    { x: 36, y: 412, width: 560, height: 76, influence: 34, strength: 0.95 }, // FORWARD-
    { x: 36, y: 494, width: 470, height: 76, influence: 34, strength: 0.95 }, // THINKING,
    { x: 36, y: 576, width: 530, height: 76, influence: 34, strength: 0.95 }, // NO-NONSENSE
    { x: 36, y: 658, width: 430, height: 76, influence: 34, strength: 0.95 }, // CREATIVE
    { x: 36, y: 740, width: 400, height: 76, influence: 34, strength: 0.95 }, // STUDIO.
    { x: 36, y: 866, width: 620, height: 140, influence: 66, strength: 1 }, // supporting copy
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
