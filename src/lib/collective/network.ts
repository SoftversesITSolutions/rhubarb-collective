/**
 * SECTION 05 — THE NETWORK REACHING THE PEOPLE
 *
 * The same organism, one field further on again. Nothing here is a new visual
 * system and nothing is a fresh seed: growth runs through `generateCascade()` —
 * the generator that produced Sections 2, 3 and 4 — and its entry points are the
 * real trunks that left Section 4 through its lower edge.
 *
 *   hero seed → Section 2 exits → Section 3 exits → Section 4 exits → here
 *
 * Section 4's network is grown against its *measured* layout, so its exits
 * cannot be derived from config alone. This file measures the rendered Branches
 * section the same way that section does, regrows it (pure function, so the
 * result is byte-identical), and reads the exits off it. Sections 3 and 4 are
 * only ever read from — never touched, never mutated, never re-rendered.
 *
 * The one thing this section adds to the grammar is an ANCHOR: a very short
 * strand from a junction that has genuinely grown within reach of a portrait, to
 * the nearest point on that portrait's edge. It is not a leader line — it only
 * exists where the walk actually produced a junction nearby, it starts at that
 * real node, and a person with no junction in reach simply has no strand.
 */

import type { Tier } from "@/lib/hero/config";
import { NETWORK_SEED } from "@/lib/hero/config";
import {
  measure,
  type KeepOut,
  type NetworkNode,
  type OrganicNetwork,
  type Point,
} from "@/lib/hero/network";
import { generateCascade, type CascadeInlet } from "@/lib/first-growth/cascade";
import { layoutRect, readExits, type Rect } from "@/lib/network/continuity";
import { generateBranchNetwork, readWorkExits } from "@/lib/branches/network";
import {
  COLLECTIVE_DESCENT,
  COLLECTIVE_SHAPE,
  MAX_INLETS,
  MIN_INLETS,
  PORTRAIT_INFLUENCE_CAP,
} from "./config";

/**
 * Moved to `lib/network/continuity` so every section — including the ones above
 * this one — can measure the same way without importing from a sibling section.
 * Re-exported here so existing imports keep resolving.
 */
export type { Rect } from "@/lib/network/continuity";
export { layoutRect } from "@/lib/network/continuity";

/* ------------------------------------------------------------------ *
 * Measuring this field
 *
 * Exported rather than kept inside the component because Section 6 has to
 * re-measure this section to read its exits, and it has to do it *exactly* the
 * way this section did — the same selector list and the same measuring
 * technique — or the network it regrows is not the one on the screen.
 * ------------------------------------------------------------------ */

/** Type growth is steered around. Tight boxes, not the blocks holding them. */
export const COLLECTIVE_COPY_SELECTOR = [
  ".collective__marker",
  ".collective__heading",
  ".collective__standfirst",
  ".collective__intro",
  ".collective-person__name",
  ".collective-person__role",
  ".collective-person__epithet",
  ".collective-person__bio",
].join(",");


/* ------------------------------------------------------------------ *
 * Inheriting Section 4's exits
 * ------------------------------------------------------------------ */

/**
 * The chain is now four sections long, and reading it regrows Sections 3 and 4.
 * Both are pure and cheap, but there is no reason to pay for them on every
 * resize tick — the answer only changes when the measured field changes.
 */
const exitCache = new Map<string, CascadeInlet[]>();

/**
 * Where Section 4's trunks cross its lower edge, normalised 0..1.
 *
 * Reads the live DOM because that is the only place Section 4's field size and
 * card positions are known. Returns null when The Branches is not on the page,
 * so the caller can decide what to do rather than being handed invented
 * geometry.
 */
export function readBranchExits(tier: Tier): CascadeInlet[] | null {
  if (typeof document === "undefined") return null;
  const branches = document.querySelector<HTMLElement>(".branches");
  if (!branches) return null;

  const rect = branches.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  const key = `${tier}|${width}x${height}`;
  const cached = exitCache.get(key);
  if (cached) return cached;

  // MEASURED EXACTLY THE WAY SECTION 4 MEASURES ITSELF — same selector,
  // same `layoutRect`.
  //
  // This used to read `[data-branch-card]` with `getBoundingClientRect()` while
  // Section 4 grew itself from `[data-branch-frame]` with the same call. The
  // card was chosen because the frame carries a transform mid-reveal, but that
  // only swapped one mismatch for another: two different elements, so the
  // network regrown here was never quite the network on the screen, and the
  // inlets handed to this field landed 0.01–0.054 of the width away from
  // Section 4's real trunk tips at every tier — up to 78 CSS px of visible
  // misalignment at 1440, which is precisely the "new branches from nowhere"
  // seam. Both sides now read the same element through pure layout, so the
  // regrown network is byte-identical to the rendered one.
  const cards = Array.from(
    branches.querySelectorAll<HTMLElement>("[data-branch-frame]"),
  ).map((frame) => layoutRect(frame, branches));

  // Section 4's own inlets, which in turn come from Section 3's real exits.
  const inlets = readWorkExits(tier);
  if (!inlets) return null;

  const network = generateBranchNetwork({ tier, width, height, cards, inlets });

  // Section 4's trunks, deepest first — preferring those that crossed its foot,
  // falling back to the next-deepest real ones. The rule itself lives in
  // `lib/network/continuity`, which every seam on the page now shares; this
  // section's own copy of it was correct, but four of the six had drifted and
  // two were broken outright, so there is one implementation rather than six.
  const kept = readExits(network, {
    min: MIN_INLETS,
    max: MAX_INLETS[tier],
    spacing: 0.09,
  });

  if (!kept.length) return null;

  exitCache.set(key, kept);
  return kept;
}

/* ------------------------------------------------------------------ *
 * Growing the continuation
 * ------------------------------------------------------------------ */

export interface CollectiveFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Portrait rectangles in the same pixel space — destinations, and keep-outs. */
  portraits: Rect[];
  /**
   * Type blocks: the opening copy and each person's name/role/biography. Held
   * clear of growth for the same reason the hero holds its headline clear —
   * this is the client's writing, and a strand crossing a line of it costs
   * legibility for nothing.
   */
  copy: Rect[];
  /** Entry points inherited from Section 4. */
  inlets: CascadeInlet[];
}

export function generateCollectiveNetwork(input: CollectiveFieldInput): OrganicNetwork {
  const shape = COLLECTIVE_SHAPE[input.tier];

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
    averageRun * Math.sin(Math.max(0.2, COLLECTIVE_DESCENT[0] - 0.25)),
  );
  const trunkStages = Math.ceil(input.height / dropPerStage) + 1;
  // ×1.35 for the same reason as every other cascade section: offshoots are
  // paid for separately, so the trunks can actually cross the foot and hand
  // The Proof real, visible continuations.
  const segmentBudget =
    Math.round(input.inlets.length * trunkStages * 1.35) + shape.segmentHeadroom;

  // Portraits are destinations, not walls. A moderate field steers growth into
  // the negative space around them — which is what makes a branch appear to
  // arrive at a person — while still letting a strand pass behind one. The
  // radius is capped rather than left proportional to the frame: see
  // PORTRAIT_INFLUENCE_CAP for the measurements behind that.
  const keepOut: KeepOut[] = input.portraits.map((frame) => ({
    ...frame,
    influence: Math.min(
      PORTRAIT_INFLUENCE_CAP,
      Math.max(70, Math.min(frame.width, frame.height) * 0.5),
    ),
    strength: shape.portraitStrength,
  }));

  // Type is held clear more firmly than a portrait but over a much shorter
  // radius: a strand should be turned aside by a paragraph, not routed around
  // the whole block. Strands flagged `behind` by the generator still pass under
  // the copy, which is what keeps growth from matting up along its edges.
  for (const block of input.copy) {
    keepOut.push({ ...block, influence: 72, strength: 0.5 });
  }

  return generateCascade({
    seed: NETWORK_SEED + 251,
    width: input.width,
    height: input.height,
    inlets: input.inlets,
    trunkStages,
    segmentBudget,
    runLength: [input.width * shape.runLength[0], input.width * shape.runLength[1]],
    stepLength: shape.stepLength,
    curl: 0.19,
    tropismStrength: 0.12,
    descent: COLLECTIVE_DESCENT,
    descentSpread: 0.3,
    entryAngle: 1.1,
    offshootChance: shape.offshootChance,
    offshootForkChance: 0.22,
    // Lowered from 0.32: a reversal inside the crowded entry band sent a run
    // straight back into the one it just left, and the three arrivals braided
    // a horizontal mat across the section heading. Reversals are for the open
    // field below, not the band the strands arrive through.
    reverseChance: 0.1,
    baseWidth: shape.baseWidth,
    keepOut,
    margin: 26,
  });
}

/* ------------------------------------------------------------------ *
 * Anchoring people into the network
 * ------------------------------------------------------------------ */

export interface PersonAnchor {
  /** Index into the portrait rectangles handed in. */
  index: number;
  /** Id of the real node this strand leaves from. */
  nodeId: string;
  d: string;
  length: number;
  width: number;
  opacity: number;
  /** Normalised 0..1, just after its node arrives. */
  appearAt: number;
}

/** Nearest point on a rectangle's boundary to an outside point. */
function closestOnRect(p: Point, r: Rect): Point {
  return {
    x: Math.min(Math.max(p.x, r.x), r.x + r.width),
    y: Math.min(Math.max(p.y, r.y), r.y + r.height),
  };
}

function insideRect(p: Point, r: Rect): boolean {
  return (
    p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
  );
}

/** Deterministic ±1 from an id, so a strand curves the same way every render. */
function curveSign(id: string): -1 | 1 {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return (h & 1) === 0 ? 1 : -1;
}

/**
 * A short organic strand from a junction that genuinely grew near a portrait, to
 * the nearest point on that portrait's edge.
 *
 * Rules, in order of importance:
 *   • the strand must start at a REAL node of this network
 *   • that node must already be within `reach` of the frame — nothing is drawn
 *     to bridge a gap the growth did not close on its own
 *   • one node serves one person, so two frames never sprout from the same point
 *   • a person with no node in reach gets nothing
 */
export function anchorPeople(
  network: OrganicNetwork,
  portraits: readonly (Rect & { id: string; connect: boolean })[],
  reach: number,
): PersonAnchor[] {
  const used = new Set<string>();
  const anchors: PersonAnchor[] = [];

  // Junctions first: a fork is a more legible place for the system to hand over
  // to a person than the dead end of a twig.
  const candidates = [...network.nodes].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === "junction" ? -1 : 1,
  );

  portraits.forEach((frame, index) => {
    if (!frame.connect) return;

    let best: NetworkNode | null = null;
    let bestDistance = Infinity;
    let bestTarget: Point | null = null;

    for (const node of candidates) {
      if (used.has(node.id)) continue;
      const point = { x: node.x, y: node.y };
      // A node underneath the frame is already hidden by it; a strand from
      // there would be a stub emerging from nowhere.
      if (insideRect(point, frame)) continue;

      const target = closestOnRect(point, frame);
      const distance = Math.hypot(target.x - point.x, target.y - point.y);
      if (distance > reach || distance < 10) continue;
      // Junctions are preferred, so bias the comparison rather than the sort.
      const score = node.kind === "junction" ? distance : distance * 1.35;
      if (score < bestDistance) {
        bestDistance = score;
        best = node;
        bestTarget = target;
      }
    }

    if (!best || !bestTarget) return;
    used.add(best.id);

    const from = { x: best.x, y: best.y };
    const to = bestTarget;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.hypot(dx, dy);
    // A single gentle bow, perpendicular to the run. Enough that the strand
    // reads as grown rather than ruled, never enough to loop.
    const bow = span * 0.2 * curveSign(frame.id);
    const nx = -dy / span;
    const ny = dx / span;

    const c1 = {
      x: from.x + dx * 0.35 + nx * bow,
      y: from.y + dy * 0.35 + ny * bow,
    };
    const c2 = {
      x: from.x + dx * 0.7 + nx * bow * 0.55,
      y: from.y + dy * 0.7 + ny * bow * 0.55,
    };

    // Sampled rather than assumed, so the stroke-dash length matches the drawn
    // curve and the reveal cannot under- or over-run.
    const samples: Point[] = [];
    for (let i = 0; i <= 12; i += 1) {
      const t = i / 12;
      const u = 1 - t;
      samples.push({
        x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * to.x,
        y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * to.y,
      });
    }

    anchors.push({
      index,
      nodeId: best.id,
      d: `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(
        2,
      )}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
      length: Math.round(measure(samples)),
      width: 0.85,
      opacity: 0.5,
      appearAt: Math.min(0.98, best.appearAt + 0.01),
    });
  });

  return anchors;
}
