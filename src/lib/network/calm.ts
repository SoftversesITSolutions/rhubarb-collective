/**
 * CALM LINES — client round 3, notes 3, 4 and 10 (Oct 2026)
 * ==========================================================
 *
 * "Make the lines smoother… the lines connecting the nodes should be
 * natural… there are many areas where the branches are too much convoluted
 * (too much chaos), reduce it and make it simple" — worst, the client said,
 * in the team-photo section.
 *
 * Measured before this change (strands crossing other strands, settled):
 * The Collective 78 / 51 / 151 at 1440 / 834 / 390, Contact 14 / 106 / 215,
 * Proof 0 / 10 / ~1,930 (a knot holding 13% of its ink at the top of the 390
 * column). Every section below the hero grows through `generateCascade`, so
 * one rule calms them all:
 *
 *   • the generator steers a run away from the strands already grown, and
 *     will not let it cross one — an offshoot that cannot get past ends
 *     there with its tip node; a trunk always goes on, so every seam still
 *     connects (`CascadeConfig.avoid`)
 *   • fewer offshoots, forks and reversals, and less wander per step —
 *     the busiest fields cut hardest
 *
 * The hero is approved and is not a cascade; it is untouched.
 *
 * ROLLBACK: set `CALM_LINES` to false and every field grows exactly as it did
 * before (the generator only reads `avoid` when it is given).
 */

import type { CascadeConfig } from "@/lib/first-growth/cascade";

/** The one switch. `false` restores the pre-round-3-Phase-3 networks exactly. */
export const CALM_LINES = true;

export type CalmLevel = "trim" | "light" | "medium" | "strong";

interface Calm {
  /**
   * Least room a run keeps from strands already grown, field units — and,
   * with it, the no-crossing rule and lanes. 0 leaves them off.
   */
  spacing: number;
  /** How hard it is pushed off them (0: only the no-crossing rule). */
  push: number;
  /** Multipliers on the field's own numbers. */
  offshoots: number;
  forks: number;
  reversals: number;
  curl: number;
}

const LEVELS: Record<CalmLevel, Calm> = {
  // Section 01: fewer offshoots and less wander only. Its statement runs the
  // full width, and steering trunks off each other there pressed them up
  // against it into narrow spikes that reached the top edge — busier than
  // the few crossings it saved.
  trim: { spacing: 0, push: 0, offshoots: 0.75, forks: 0.6, reversals: 0.6, curl: 0.8 },
  // Selected Work: already one of the calmer fields.
  light: { spacing: 16, push: 0, offshoots: 0.75, forks: 0.6, reversals: 0.6, curl: 0.8 },
  // Journal & Culture.
  medium: { spacing: 18, push: 0, offshoots: 0.6, forks: 0.45, reversals: 0.45, curl: 0.7 },
  // The Collective, Proof and Contact — the three the measurements flagged.
  strong: { spacing: 22, push: 0, offshoots: 0.45, forks: 0.3, reversals: 0.3, curl: 0.6 },
};

/** A cascade's own configuration, calmed. Identity when `CALM_LINES` is off. */
export function calmed(config: CascadeConfig, level: CalmLevel): CascadeConfig {
  if (!CALM_LINES) return config;
  const calm = LEVELS[level];
  return {
    ...config,
    curl: config.curl * calm.curl,
    offshootChance: config.offshootChance * calm.offshoots,
    offshootForkChance: config.offshootForkChance * calm.forks,
    reverseChance: config.reverseChance * calm.reversals,
    avoid: calm.spacing > 0 ? { spacing: calm.spacing, push: calm.push } : undefined,
  };
}
