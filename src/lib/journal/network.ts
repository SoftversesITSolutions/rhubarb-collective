/**
 * SECTION 07 — THE NETWORK BECOMING A CULTURAL FEED
 *
 * The same organism, one field further on again. Nothing here is a new visual
 * system, nothing is a fresh seed, and there is no second growth algorithm:
 * growth runs through `generateCascade()` — the generator that produced Sections
 * 2, 3, 4, 5 and 6 — and its entry points are the real trunks that left Section
 * 6 through its lower edge.
 *
 *   hero seed → S2 exits → S3 exits → S4 exits → S5 exits → S6 exits → here
 *
 * Section 6's network is grown against its *measured* layout, so its exits
 * cannot be derived from config alone. This file re-measures the rendered Proof
 * exactly the way that section measures itself (same selector list, same
 * technique, both imported from it rather than restated), regrows it —
 * `generateProofNetwork` is pure, so the result is byte-identical to what is on
 * the screen — and reads the exits off it. Sections 2–6 are only ever read from:
 * never touched, never mutated, never re-rendered.
 *
 * The anchor grammar is Section 5's, imported wholesale. A strand into an
 * editorial position only exists where a junction genuinely grew within reach of
 * it; the positions with no junction in reach belong to the network by proximity
 * alone, which is the honest version of "the network connects ideas". Not every
 * idea gets a wire.
 */

import type { Tier } from "@/lib/hero/config";
import { NETWORK_SEED } from "@/lib/hero/config";
import type { KeepOut, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import { generateCascade, type CascadeInlet } from "@/lib/first-growth/cascade";
import { readExits } from "@/lib/network/continuity";
import {
  anchorPeople,
  layoutRect,
  type PersonAnchor,
  type Rect,
} from "@/lib/collective/network";
import {
  generateProofNetwork,
  PROOF_COPY_SELECTOR,
  readCollectiveExits,
} from "@/lib/proof/network";
import { PROOF_ITEMS } from "@/lib/proof/config";
import {
  ITEM_INFLUENCE_CAP,
  JOURNAL_DESCENT,
  JOURNAL_SHAPE,
  MAX_INLETS,
  MIN_INLETS,
  SEGMENT_BUDGET_MULTIPLIER,
} from "./config";

export type { Rect };

/* ------------------------------------------------------------------ *
 * Measuring this field
 * ------------------------------------------------------------------ */

/**
 * Type that growth is steered around in THIS section. Tight boxes, not the
 * blocks holding them.
 *
 * `[data-journal-pending]` is deliberately absent: it exists only in development
 * and is out of flow, so including it would make the geometry differ between a
 * dev and a production build.
 */
export const JOURNAL_COPY_SELECTOR = [
  ".journal__marker",
  ".journal__heading",
  ".journal__standfirst",
  ".journal__intro",
  ".journal__note",
  ".journal__forthcoming-label",
  ".journal__strand",
  ".journal-item__title",
  ".journal-item__meta",
  ".journal-item__excerpt",
  ".journal-item__state",
].join(",");

/* ------------------------------------------------------------------ *
 * Inheriting Section 6's exits
 * ------------------------------------------------------------------ */

/**
 * The chain is now six sections long, and reading it regrows Sections 3, 4, 5
 * and 6. All are pure and cheap — and each memoises the exits it depends on — but
 * there is no reason to pay for the walk on every resize tick. The answer only
 * changes when the measured field changes.
 */
const exitCache = new Map<string, CascadeInlet[]>();

/**
 * Where Section 6's trunks cross its lower edge, normalised 0..1.
 *
 * Reads the live DOM because that is the only place Section 6's field size and
 * item positions are known. Returns null when The Proof is not on the page, so
 * the caller can decide what to do rather than being handed invented geometry.
 */
export function readProofExits(tier: Tier): CascadeInlet[] | null {
  if (typeof document === "undefined") return null;
  const proof = document.querySelector<HTMLElement>(".proof");
  if (!proof) return null;

  const rect = proof.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const key = `${tier}|${width}x${height}`;
  const cached = exitCache.get(key);
  if (cached) return cached;

  // MEASURED THE WAY SECTION 6 MEASURES ITSELF — `layoutRect` for both the items
  // and the copy, because everything in that section carries a clip and a
  // translate mid-reveal and `getBoundingClientRect()` would report the animated
  // box. Reading it any other way makes the inherited geometry a function of
  // scroll position, and the same page grows differently depending on where the
  // reader happens to be.
  const items: (Rect & { id: string; connect: boolean })[] = Array.from(
    proof.querySelectorAll<HTMLElement>("[data-proof-item]"),
  ).map((el, i) => ({
    id: PROOF_ITEMS[i]?.id ?? `i${i}`,
    connect: PROOF_ITEMS[i]?.node ?? false,
    ...layoutRect(el, proof),
  }));

  const copy: Rect[] = [];
  proof
    .querySelectorAll<HTMLElement>(PROOF_COPY_SELECTOR)
    .forEach((el) => copy.push(layoutRect(el, proof)));

  // Section 6's own inlets, which in turn come from Section 5's real exits, and
  // those from Section 4's, and those from Section 3's, and those from the
  // hero's descenders.
  const inlets = readCollectiveExits(tier);
  if (!inlets) return null;

  const network = generateProofNetwork({ tier, width, height, items, copy, inlets });

  // Section 6's trunks, deepest first — the shared seam contract. See
  // `lib/network/continuity`.
  const kept = readExits(network, {
    min: MIN_INLETS[tier],
    max: MAX_INLETS[tier],
    spacing: JOURNAL_SHAPE[tier].inletSpacing,
  });

  if (!kept.length) return null;

  exitCache.set(key, kept);
  return kept;
}

/* ------------------------------------------------------------------ *
 * Growing the continuation
 * ------------------------------------------------------------------ */

export interface JournalFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Editorial positions in the same pixel space — destinations, and keep-outs. */
  items: Rect[];
  /**
   * Type blocks: the opening copy, the note, the strand list and each position's
   * own lines. Held clear for the same reason every section above holds its
   * copy clear — this is the client's writing, and a strand crossing a line of
   * it costs legibility for nothing.
   */
  copy: Rect[];
  /** Entry points inherited from Section 6. */
  inlets: CascadeInlet[];
}

export function generateJournalNetwork(input: JournalFieldInput): OrganicNetwork {
  const shape = JOURNAL_SHAPE[input.tier];
  const descent = JOURNAL_DESCENT[input.tier];

  // How far one lateral run falls, and therefore how many a trunk needs to
  // cross this field. Derived from the measured height so growth always reaches
  // the foot, whatever the composition makes the section's height.
  const averageRun = input.width * ((shape.runLength[0] + shape.runLength[1]) / 2);
  // Stages are derived from the SHALLOWEST fanned descent, not the average:
  // `descentSpread` fans each trunk's descent bias, and a trunk fanned to the
  // shallow end drops far less per stage than the mean predicts. Budgeting for
  // the average left those trunks stranded mid-field — measured at 1440, they
  // ended up to 0.14 of the height above the foot, and every seam entry that
  // continued them below visibly hung in space.
  const dropPerStage = Math.max(
    60,
    averageRun * Math.sin(Math.max(0.2, descent[0] - 0.25)),
  );
  const trunkStages = Math.ceil(input.height / dropPerStage) + 1;
  // See SEGMENT_BUDGET_MULTIPLIER: the queue is breadth-first, so offshoots have
  // to be paid for or they are paid for out of the trunks' descent.
  const segmentBudget =
    Math.round(input.inlets.length * trunkStages * SEGMENT_BUDGET_MULTIPLIER) +
    shape.segmentHeadroom;

  // Positions are destinations, not walls. A moderate field steers growth into
  // the negative space around them — which is what makes a strand appear to
  // arrive at an idea — while still letting one pass behind. The radius is
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
    seed: NETWORK_SEED + 433,
    width: input.width,
    height: input.height,
    inlets: input.inlets,
    trunkStages,
    segmentBudget,
    runLength: [input.width * shape.runLength[0], input.width * shape.runLength[1]],
    stepLength: shape.stepLength,
    // A touch more wander than Section 6 over a much longer run. The organism
    // arrived in the section above; here it is looking outward again, and the
    // extra curl is what stops a long lateral run reading as a ruled line.
    curl: 0.17,
    tropismStrength: 0.13,
    descent,
    // Widened from 0.3: with tangent-continuous entries both trunks arrived
    // on convergent headings and exited the foot 0.02 apart — the seam below
    // could only continue one of them and fell back to a dead strand for the
    // other. The wider fan lands them ~0.5 of the width apart (measured at
    // the page's own seed against the real 1440 layout).
    descentSpread: 0.55,
    entryAngle: 1.1,
    offshootChance: shape.offshootChance,
    offshootForkChance: 0.14,
    // The lowest on the page, for the same reason Section 6 lowered it: a
    // reversal in a confined pocket sends a run back into the field it just
    // left, and this section's long runs make that knot larger when it happens.
    reverseChance: 0.12,
    baseWidth: shape.baseWidth,
    keepOut,
    margin: 26,
  });
}

/* ------------------------------------------------------------------ *
 * Anchoring ideas into the network
 * ------------------------------------------------------------------ */

/** The real node a journal strand leaves from, promoted to a visible junction. */
export interface JournalJunction {
  id: string;
  x: number;
  y: number;
  r: number;
  appearAt: number;
}

export interface JournalAnchoring {
  anchors: PersonAnchor[];
  /**
   * One per anchor: the node it grew out of. These are not new geometry — each
   * is a node the walk already produced, marked because this section is about
   * the points where the network meets an idea.
   */
  junctions: JournalJunction[];
}

/**
 * Section 5's anchor grammar, applied to editorial positions.
 *
 * `anchorPeople` is imported rather than reimplemented, so the rules are
 * literally the same ones: the strand must start at a real node, that node must
 * already be within reach, one node serves one position, and a position with
 * nothing in reach gets nothing.
 */
export function anchorJournal(
  network: OrganicNetwork,
  items: readonly (Rect & { id: string; connect: boolean })[],
  reach: number,
): JournalAnchoring {
  const anchors = anchorPeople(network, items, reach);

  const byId = new Map<string, NetworkNode>();
  for (const node of network.nodes) byId.set(node.id, node);

  const junctions: JournalJunction[] = [];
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
