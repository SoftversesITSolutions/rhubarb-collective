/**
 * SEAMS — how many strands each section boundary hands down, in one table.
 *
 * Both sides of a seam read this: the section above closes every crossing
 * strand the section below will not continue (`closeSeam`), and the section
 * below opens on exactly the ones left (`readExits`). Defined once so the two
 * can never disagree — when each side kept its own numbers, strands were cut
 * on the boundary with nothing below to pick them up.
 *
 * The counts and spacings are the ones each section already used; only where
 * they live has changed.
 */

import type { Tier } from "@/lib/hero/config";
import type { ExitOptions } from "@/lib/network/continuity";
import { CALM_LINES } from "@/lib/network/calm";
import {
  MAX_INLETS as COLLECTIVE_MAX,
  MIN_INLETS as COLLECTIVE_MIN,
} from "@/lib/collective/config";
import {
  MAX_INLETS as PROOF_MAX,
  MIN_INLETS as PROOF_MIN,
  PROOF_SHAPE,
} from "@/lib/proof/config";
import {
  JOURNAL_SHAPE,
  MAX_INLETS as JOURNAL_MAX,
  MIN_INLETS as JOURNAL_MIN,
} from "@/lib/journal/config";
import {
  CONTACT_SHAPE,
  MAX_INLETS as CONTACT_MAX,
  MIN_INLETS as CONTACT_MIN,
} from "@/lib/contact/config";

/** Who We Are → Selected Work. */
export const FIRST_GROWTH_EXITS: (tier: Tier) => ExitOptions = () => ({
  min: 2,
  max: 3,
  spacing: 0.1,
});

/** Selected Work → The Turn. */
export const WORK_EXITS: (tier: Tier) => ExitOptions = () => ({
  min: 2,
  max: 2,
  spacing: 0.09,
});

/**
 * Calm lines (round 3, lib/network/calm): on the 390 column every trunk
 * runs laterally across the same width, so two or three of them cannot help
 * crossing each other at every stage — measured, trunk-on-trunk crossings
 * were nearly all that was left in The Collective (43 of 48) and Proof (228
 * of 230). Fewer trunks there: two into The Collective, one into Proof, as
 * Journal and Contact already take.
 */
const calmPhone = (tier: Tier) => CALM_LINES && tier === "mobile";

/** The Turn → The Collective. */
export const TURN_EXITS = (tier: Tier): ExitOptions => ({
  min: calmPhone(tier) ? 2 : COLLECTIVE_MIN,
  max: calmPhone(tier) ? 2 : COLLECTIVE_MAX[tier],
  spacing: 0.09,
});

/** The Collective → Proof. */
export const COLLECTIVE_EXITS = (tier: Tier): ExitOptions => ({
  min: calmPhone(tier) ? 1 : PROOF_MIN[tier],
  max: calmPhone(tier) ? 1 : PROOF_MAX[tier],
  spacing: PROOF_SHAPE[tier].inletSpacing,
});

/** Proof → Journal & Culture. */
export const PROOF_EXITS = (tier: Tier): ExitOptions => ({
  min: JOURNAL_MIN[tier],
  max: JOURNAL_MAX[tier],
  spacing: JOURNAL_SHAPE[tier].inletSpacing,
});

/** Journal & Culture → Contact. */
export const JOURNAL_EXITS = (tier: Tier): ExitOptions => ({
  min: CONTACT_MIN[tier],
  max: CONTACT_MAX[tier],
  spacing: CONTACT_SHAPE[tier].inletSpacing,
});
