/**
 * SECTION 06 — THE NETWORK REACHING ITS RELATIONSHIPS
 *
 * The same organism, one field further on again. Nothing here is a new visual
 * system, nothing is a fresh seed, and there is no second growth algorithm:
 * growth runs through `generateCascade()` — the generator that produced
 * Sections 2, 3, 4 and 5 — and its entry points are the real trunks that left
 * Section 5 through its lower edge.
 *
 *   hero seed → S2 exits → S3 exits → S4 exits → S5 exits → here
 *
 * Section 5's network is grown against its *measured* layout, so its exits
 * cannot be derived from config alone. This file re-measures the rendered
 * Collective exactly the way that section measures itself (same selector list,
 * same technique, both imported from it rather than restated), regrows it —
 * `generateCollectiveNetwork` is pure, so the result is byte-identical to what
 * is on the screen — and reads the exits off it. Sections 2–5 are only ever read
 * from: never touched, never mutated, never re-rendered.
 *
 * The anchor grammar is Section 5's, imported wholesale. A strand into a proof
 * item only exists where a junction genuinely grew within reach of it; the
 * items with no junction in reach belong to the network by proximity, which is
 * the honest version of "some relationships are implied".
 */

import type { Tier } from "@/lib/hero/config";
import { NETWORK_SEED } from "@/lib/hero/config";
import type { KeepOut, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import { generateCascade, type CascadeInlet } from "@/lib/first-growth/cascade";
import { readExits } from "@/lib/network/continuity";
import {
  anchorPeople,
  COLLECTIVE_COPY_SELECTOR,
  generateCollectiveNetwork,
  layoutRect,
  readBranchExits,
  type PersonAnchor,
  type Rect,
} from "@/lib/collective/network";
import {
  ITEM_INFLUENCE_CAP,
  MAX_INLETS,
  MIN_INLETS,
  PROOF_DESCENT,
  PROOF_SHAPE,
  SEGMENT_BUDGET_MULTIPLIER,
} from "./config";

export type { Rect };

/* ------------------------------------------------------------------ *
 * Measuring this field
 *
 * Exported rather than kept inside the component — exactly as Section 5 exports
 * its own — because Section 7 has to re-measure this section to read its exits,
 * and it has to do it *exactly* the way this section did: the same selector
 * list, the same measuring technique. Any other list regrows a different network
 * from the one on the screen and the seam stops being a continuation.
 * ------------------------------------------------------------------ */

/**
 * Type that growth is steered around. Tight boxes, not the blocks holding them
 * — reserving whole blocks over-claims the field and makes arriving strands mat
 * along its upper edge instead of descending through it.
 *
 * `[data-proof-pending]` is deliberately absent: it exists only in development
 * and is out of flow, so including it would make the geometry differ between a
 * dev and a production build.
 */
export const PROOF_COPY_SELECTOR = [
  ".proof__marker",
  ".proof__heading",
  ".proof__standfirst",
  ".proof__intro",
  ".proof-item__client",
  ".proof-item__descriptor",
  ".proof-item__quote-text",
  ".proof-item__attribution",
  ".proof-item__relationship",
  ".proof-item__term",
].join(",");

/* ------------------------------------------------------------------ *
 * Inheriting Section 5's exits
 * ------------------------------------------------------------------ */

/**
 * The chain is now five sections long, and reading it regrows Sections 3, 4 and
 * 5. All three are pure and cheap — and Section 5 already memoises the Branches
 * exits it depends on — but there is no reason to pay for the walk on every
 * resize tick. The answer only changes when the measured field changes.
 */
const exitCache = new Map<string, CascadeInlet[]>();

/**
 * Where Section 5's trunks cross its lower edge, normalised 0..1.
 *
 * Reads the live DOM because that is the only place Section 5's field size and
 * portrait positions are known. Returns null when The Collective is not on the
 * page, so the caller can decide what to do rather than being handed invented
 * geometry.
 */
export function readCollectiveExits(tier: Tier): CascadeInlet[] | null {
  if (typeof document === "undefined") return null;
  const collective = document.querySelector<HTMLElement>(".collective");
  if (!collective) return null;

  const rect = collective.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const key = `${tier}|${width}x${height}`;
  const cached = exitCache.get(key);
  if (cached) return cached;

  // MEASURED THE WAY SECTION 5 MEASURES ITSELF. Its portrait frames carry a
  // clip-path mid-reveal but never a transform, so their client rects are the
  // untransformed layout boxes that section grew against; its copy does carry a
  // translate, so every line of it is read off the offset chain instead. Any
  // other technique regrows a *different* network from the one on the screen
  // and the seam stops being a continuation.
  const portraits: (Rect & { id: string; connect: boolean })[] = [];
  collective
    .querySelectorAll<HTMLElement>("[data-collective-frame]")
    .forEach((frame, i) => {
      const box = frame.getBoundingClientRect();
      portraits.push({
        id: `p${i}`,
        connect: false,
        x: box.left - rect.left,
        y: box.top - rect.top,
        width: box.width,
        height: box.height,
      });
    });

  const copy: Rect[] = [];
  collective
    .querySelectorAll<HTMLElement>(COLLECTIVE_COPY_SELECTOR)
    .forEach((el) => copy.push(layoutRect(el, collective)));

  // Section 5's own inlets, which in turn come from Section 4's real exits, and
  // those from Section 3's, and those from the hero's descenders.
  const inlets = readBranchExits(tier);
  if (!inlets) return null;

  const network = generateCollectiveNetwork({
    tier,
    width,
    height,
    portraits,
    copy,
    inlets,
  });

  // Section 5's trunks, deepest first — the shared seam contract. See
  // `lib/network/continuity`.
  const kept = readExits(network, {
    min: MIN_INLETS[tier],
    max: MAX_INLETS[tier],
    spacing: PROOF_SHAPE[tier].inletSpacing,
  });

  if (!kept.length) return null;

  exitCache.set(key, kept);
  return kept;
}

/* ------------------------------------------------------------------ *
 * Growing the continuation
 * ------------------------------------------------------------------ */

export interface ProofFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Proof item blocks in the same pixel space — destinations, and keep-outs. */
  items: Rect[];
  /**
   * Type blocks: the opening copy and each item's name, quote and terms. Held
   * clear for the same reason the hero holds its headline clear — this is a
   * credibility section, and a strand crossing a client's words costs
   * legibility for nothing.
   */
  copy: Rect[];
  /** Entry points inherited from Section 5. */
  inlets: CascadeInlet[];
}

export function generateProofNetwork(input: ProofFieldInput): OrganicNetwork {
  const shape = PROOF_SHAPE[input.tier];
  const descent = PROOF_DESCENT[input.tier];

  // How far one lateral run falls, and therefore how many a trunk needs to
  // cross this field. Derived from the measured height so growth always reaches
  // the foot, whatever the composition makes the section's height.
  const averageRun = input.width * ((shape.runLength[0] + shape.runLength[1]) / 2);
  // Worst-case drop, not the average: `descentSpread` fans one trunk shallow,
  // and budgeting for the mean strands it mid-field (measured 292px above the
  // foot at 1440, which starved the Journal seam).
  const dropPerStage = Math.max(
    60,
    averageRun * Math.sin(Math.max(0.2, descent[0] - 0.25)),
  );
  const trunkStages = Math.ceil(input.height / dropPerStage) + 1;
  // See SEGMENT_BUDGET_MULTIPLIER: the queue is breadth-first, so offshoots
  // have to be paid for or they are paid for out of the trunks' descent.
  const segmentBudget =
    Math.round(input.inlets.length * trunkStages * SEGMENT_BUDGET_MULTIPLIER) +
    shape.segmentHeadroom;

  // Items are destinations, not walls. A moderate field steers growth into the
  // negative space around them — which is what makes a strand appear to arrive
  // at a relationship — while still letting one pass behind. The radius is
  // capped rather than left proportional to the block: see ITEM_INFLUENCE_CAP.
  const keepOut: KeepOut[] = input.items.map((block) => ({
    ...block,
    influence: Math.min(
      ITEM_INFLUENCE_CAP,
      Math.max(70, Math.min(block.width, block.height) * 0.5),
    ),
    strength: shape.itemStrength,
  }));

  for (const block of input.copy) {
    keepOut.push({
      ...block,
      influence: shape.copyInfluence,
      strength: shape.copyStrength,
    });
  }

  return generateCascade({
    seed: NETWORK_SEED + 379,
    width: input.width,
    height: input.height,
    inlets: input.inlets,
    trunkStages,
    segmentBudget,
    runLength: [input.width * shape.runLength[0], input.width * shape.runLength[1]],
    stepLength: shape.stepLength,
    // Less wander and a firmer heading than Section 5: the organism is
    // arriving here, not exploring.
    curl: 0.15,
    tropismStrength: 0.15,
    descent,
    // Widened from 0.26 on the wide tiers for the same reason as Journal's:
    // tangent-continuous entries arrive on convergent headings, and a narrow
    // fan let the two trunks travel together and starve the seam below of a
    // second real crossing. The 390 column keeps the narrow fan — there a
    // wide one throws a trunk so shallow it dies against the side walls.
    descentSpread: input.tier === "mobile" ? 0.26 : 0.5,
    entryAngle: 1.1,
    offshootChance: shape.offshootChance,
    offshootForkChance: 0.16,
    // Lower than every section above. A reversal in a confined pocket of the
    // field sends a run back into the one it just left, and at 834 that
    // produced a visible tangle beside the third item — measured as 3.2% of the
    // network's whole length inside a single 70px cell. Turning back less often
    // is what makes this field read as arriving rather than searching, and it
    // untangles the knot (2.3%) while lowering the length over live type at
    // every tier.
    reverseChance: 0.14,
    baseWidth: shape.baseWidth,
    keepOut,
    margin: 26,
  });
}

/* ------------------------------------------------------------------ *
 * Anchoring relationships into the network
 * ------------------------------------------------------------------ */

/** The real node a proof strand leaves from, promoted to a visible junction. */
export interface ProofJunction {
  id: string;
  x: number;
  y: number;
  r: number;
  appearAt: number;
}

export interface ProofAnchoring {
  anchors: PersonAnchor[];
  /**
   * One per anchor: the node it grew out of. These are not new geometry — each
   * is a node the walk already produced, marked because the section is about
   * the points where the network meets someone.
   */
  junctions: ProofJunction[];
}

/**
 * Section 5's anchor grammar, applied to proof items.
 *
 * `anchorPeople` is imported rather than reimplemented, so the rules are
 * literally the same ones: the strand must start at a real node, that node must
 * already be within reach, one node serves one item, and an item with nothing
 * in reach gets nothing.
 */
export function anchorProof(
  network: OrganicNetwork,
  items: readonly (Rect & { id: string; connect: boolean })[],
  reach: number,
): ProofAnchoring {
  const anchors = anchorPeople(network, items, reach);

  const byId = new Map<string, NetworkNode>();
  for (const node of network.nodes) byId.set(node.id, node);

  const junctions: ProofJunction[] = [];
  for (const anchor of anchors) {
    const node = byId.get(anchor.nodeId);
    if (!node) continue;
    junctions.push({
      id: node.id,
      x: node.x,
      y: node.y,
      // A shade larger than the node already drawn there, so the meeting point
      // reads as resolved rather than as one more tip.
      r: Math.max(2.6, node.r * 1.5),
      appearAt: anchor.appearAt,
    });
  }

  return { anchors, junctions };
}
