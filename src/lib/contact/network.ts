/**
 * SECTION 08 — THE NETWORK REACHING ITS ROUTES OUT
 *
 * The same organism, one last field. Nothing here is a new visual system,
 * nothing is a fresh seed, and there is no second growth algorithm: growth runs
 * through `generateCascade()` — the generator that produced Sections 2 through 7
 * — and its entry points are the real trunks that left Section 7 through its
 * lower edge.
 *
 *   hero seed → S2 → S3 → S4 → S5 → S6 → S7 exits → here
 *
 * Section 7's network is grown against its *measured* layout, so its exits
 * cannot be derived from config alone. This file re-measures the rendered
 * Journal exactly the way that section measures itself (same selector list, same
 * technique, both imported from it rather than restated), regrows it —
 * `generateJournalNetwork` is pure, so the result is byte-identical to what is
 * on the screen — and reads the exits off it. Sections 2–7 are only ever read
 * from: never touched, never mutated, never re-rendered.
 *
 * WHAT IS DIFFERENT HERE is only the shape of the growth, never its grammar.
 * This field takes the fewest inlets on the page and resolves least often, so
 * what crosses the last seam is a couple of strands travelling between the
 * routes rather than a network still spreading. The convergence is real — it is
 * fewer of Section 7's own trunks being taken, not a funnel drawn to suggest one.
 *
 * The anchor grammar is Section 5's, imported wholesale. A strand into a route
 * only exists where a junction genuinely grew within reach of it; a route with
 * nothing in reach belongs to the network by proximity alone. That rule matters
 * most in this section, because a line drawn from a network to a phone number is
 * exactly the leader line the whole system has refused to draw for six sections.
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
  generateJournalNetwork,
  JOURNAL_COPY_SELECTOR,
  readProofExits,
} from "@/lib/journal/network";
import { JOURNAL_POSITIONS } from "@/lib/journal/config";
import {
  CONTACT_DESCENT,
  CONTACT_SHAPE,
  ITEM_INFLUENCE_CAP,
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
 * The closing statement is included and matters more than any other block on the
 * page: it is the largest display type below the hero, and it is the one thing
 * in this section that must not have a strand running through it.
 */
export const CONTACT_COPY_SELECTOR = [
  ".contact__marker",
  ".contact__statement",
  ".contact__invitation",
  ".contact-route__label",
  ".contact-route__value",
  ".contact-route__detail",
  ".contact__company",
  ".contact__address",
  ".contact__gstin",
].join(",");

/* ------------------------------------------------------------------ *
 * Inheriting Section 7's exits
 * ------------------------------------------------------------------ */

/**
 * The chain is now seven sections long, and reading it regrows Sections 3
 * through 7. All are pure and cheap — and each memoises the exits it depends on
 * — but there is no reason to pay for the walk on every resize tick. The answer
 * only changes when the measured field changes.
 */
const exitCache = new Map<string, CascadeInlet[]>();

/**
 * Where Section 7's trunks cross its lower edge, normalised 0..1.
 *
 * Reads the live DOM because that is the only place Section 7's field size and
 * editorial positions are known. Returns null when Journal & Culture is not on
 * the page, so the caller can decide what to do rather than being handed
 * invented geometry.
 */
export function readJournalExits(tier: Tier): CascadeInlet[] | null {
  if (typeof document === "undefined") return null;
  const journal = document.querySelector<HTMLElement>(".journal");
  if (!journal) return null;

  const rect = journal.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const key = `${tier}|${width}x${height}`;
  const cached = exitCache.get(key);
  if (cached) return cached;

  // MEASURED THE WAY SECTION 7 MEASURES ITSELF — `layoutRect` for both the
  // positions and the copy, because everything in that section carries a clip
  // and a translate mid-reveal and `getBoundingClientRect()` would report the
  // animated box. Reading it any other way makes the inherited geometry a
  // function of scroll position, and the same page grows differently depending
  // on where the reader happens to be.
  const items: (Rect & { id: string; connect: boolean })[] = Array.from(
    journal.querySelectorAll<HTMLElement>("[data-journal-item]"),
  ).map((el, i) => ({
    id: JOURNAL_POSITIONS[i]?.id ?? `j${i}`,
    connect: JOURNAL_POSITIONS[i]?.node ?? false,
    ...layoutRect(el, journal),
  }));

  const copy: Rect[] = [];
  journal
    .querySelectorAll<HTMLElement>(JOURNAL_COPY_SELECTOR)
    .forEach((el) => copy.push(layoutRect(el, journal)));

  // Section 7's own inlets, which come from Section 6's real exits, and those
  // from Section 5's, and so on back to the hero's descenders.
  const inlets = readProofExits(tier);
  if (!inlets) return null;

  const network = generateJournalNetwork({ tier, width, height, items, copy, inlets });

  // Section 7's trunks, deepest first — the shared seam contract. See
  // `lib/network/continuity`.
  const kept = readExits(network, {
    min: MIN_INLETS[tier],
    max: MAX_INLETS[tier],
    spacing: CONTACT_SHAPE[tier].inletSpacing,
  });

  if (!kept.length) return null;

  exitCache.set(key, kept);
  return kept;
}

/* ------------------------------------------------------------------ *
 * Growing the last continuation
 * ------------------------------------------------------------------ */

export interface ContactFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Route blocks in the same pixel space — destinations, and keep-outs. */
  items: Rect[];
  /**
   * Type blocks: the closing statement, the invitation, each route's own lines
   * and the colophon. Held clear for the same reason every section above holds
   * its copy clear — and here the destinations themselves are the copy, so a
   * strand crossing an email address would cost the section its whole point.
   */
  copy: Rect[];
  /** Entry points inherited from Section 7. */
  inlets: CascadeInlet[];
}

export function generateContactNetwork(input: ContactFieldInput): OrganicNetwork {
  const shape = CONTACT_SHAPE[input.tier];
  const descent = CONTACT_DESCENT[input.tier];

  // How far one lateral run falls, and therefore how many a trunk needs to
  // cross this field. Derived from the measured height so growth always reaches
  // the foot, whatever the composition makes the section's height.
  const averageRun = input.width * ((shape.runLength[0] + shape.runLength[1]) / 2);
  const dropPerStage = Math.max(
    60,
    averageRun * Math.sin((descent[0] + descent[1]) / 2),
  );
  const trunkStages = Math.ceil(input.height / dropPerStage) + 1;
  // See SEGMENT_BUDGET_MULTIPLIER: the queue is breadth-first, so offshoots have
  // to be paid for or they are paid for out of the trunks' descent.
  const segmentBudget =
    Math.round(input.inlets.length * trunkStages * SEGMENT_BUDGET_MULTIPLIER) +
    shape.segmentHeadroom;

  // Routes are destinations, not walls. A moderate field steers growth into the
  // negative space around them — which is what makes a strand appear to arrive
  // at a destination — while still letting one pass behind. The radius is capped
  // rather than left proportional to the block: see ITEM_INFLUENCE_CAP.
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
    seed: NETWORK_SEED + 487,
    width: input.width,
    height: input.height,
    inlets: input.inlets,
    trunkStages,
    segmentBudget,
    runLength: [input.width * shape.runLength[0], input.width * shape.runLength[1]],
    stepLength: shape.stepLength,
    // The least wander and the firmest heading on the page. A run here is going
    // somewhere; the curl is only enough to keep it from reading as a ruled line.
    curl: 0.13,
    tropismStrength: 0.16,
    descent,
    descentSpread: 0.34,
    entryAngle: 1.1,
    offshootChance: shape.offshootChance,
    offshootForkChance: 0.1,
    // The lowest on the page. A route that turns back on itself is not a route.
    reverseChance: 0.1,
    baseWidth: shape.baseWidth,
    keepOut,
    margin: 26,
  });
}

/* ------------------------------------------------------------------ *
 * Anchoring routes into the network
 * ------------------------------------------------------------------ */

/** The real node a route strand leaves from, promoted to a visible junction. */
export interface ContactJunction {
  id: string;
  x: number;
  y: number;
  r: number;
  appearAt: number;
}

export interface ContactAnchoring {
  anchors: PersonAnchor[];
  /**
   * One per anchor: the node it grew out of. These are not new geometry — each
   * is a node the walk already produced, marked because this section is about
   * the points where the network reaches out of the page.
   */
  junctions: ContactJunction[];
}

/**
 * Section 5's anchor grammar, applied to routes.
 *
 * `anchorPeople` is imported rather than reimplemented, so the rules are
 * literally the same ones: the strand must start at a real node, that node must
 * already be within reach, one node serves one route, and a route with nothing
 * in reach gets nothing.
 */
export function anchorContact(
  network: OrganicNetwork,
  items: readonly (Rect & { id: string; connect: boolean })[],
  reach: number,
): ContactAnchoring {
  const anchors = anchorPeople(network, items, reach);

  const byId = new Map<string, NetworkNode>();
  for (const node of network.nodes) byId.set(node.id, node);

  const junctions: ContactJunction[] = [];
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
