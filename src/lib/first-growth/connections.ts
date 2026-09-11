/**
 * CONNECTIONS — the collective, expressed as geometry.
 *
 * The hero's motion verb is GROWTH: strands extend from a seed. This section's
 * verb is CONNECTION, and this file is where that difference is made real.
 *
 * A connection is a chord drawn between two nodes that grew on *different
 * lineages* — separate strands descending from separate inlets. Linking within
 * one lineage would only re-describe a branch that already exists; linking
 * across lineages is what turns a set of individual filaments into a single
 * interconnected system. That is the collective, stated in the network rather
 * than in a sentence.
 *
 * Rules, in order:
 *   1. Both endpoints must be on different root lineages.
 *   2. The gap must be plausible — near enough to read as a link, far enough
 *      that the chord is not lost against the branch it came from.
 *   3. No node may anchor more than `maxPerNode` chords, so the result is a
 *      distributed mesh and never a hub-and-spoke diagram.
 *   4. A chord whose midpoint falls in a typography zone is discarded outright.
 *      Readability is not negotiable.
 *   5. A chord can only form once both of its endpoints exist, so its position
 *      in the reveal order is inherited from the later of the two.
 */

import type { KeepOut, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import { createRng, range, type Rng } from "@/lib/hero/random";

export interface Connection {
  id: string;
  /** Bowed quadratic between the two nodes. */
  d: string;
  length: number;
  /** 0..1 position in the connection reveal order. */
  at: number;
  /** Endpoint node ids, so the animation can weight them as the chord lands. */
  from: string;
  to: string;
}

export interface ConnectionOptions {
  seed: number;
  /** Hard ceiling on chords — the mesh must stay legible. */
  max: number;
  minDistance: number;
  maxDistance: number;
  maxPerNode: number;
  keepOut: readonly KeepOut[];
}

/** Root lineage of a branch id: "i2-7-3" belongs to inlet 2. */
function lineage(branchId: string): string {
  return branchId.split("-")[0];
}

function inAnyZone(x: number, y: number, zones: readonly KeepOut[], pad: number): boolean {
  return zones.some(
    (z) =>
      x > z.x - pad &&
      x < z.x + z.width + pad &&
      y > z.y - pad &&
      y < z.y + z.height + pad,
  );
}

/** A gently bowed quadratic, so a link never reads as a straight technical wire. */
function chord(a: NetworkNode, b: NetworkNode, bow: number, rng: Rng): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular offset — the sign alternates with the pair so the mesh does
  // not develop a uniform lean.
  const dir = (a.x + a.y + b.x + b.y) % 2 < 1 ? 1 : -1;
  const amount = bow * range(rng, 0.6, 1.25) * dir;
  const cx = mx + (-dy / len) * len * amount;
  const cy = my + (dx / len) * len * amount;
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M${r(a.x)} ${r(a.y)}Q${r(cx)} ${r(cy)} ${r(b.x)} ${r(b.y)}`;
}

export function deriveConnections(
  network: OrganicNetwork,
  options: ConnectionOptions,
): Connection[] {
  const rng = createRng(options.seed);

  // Every junction is a candidate, including those on strands that run behind
  // the copy. Excluding them looked tidy but halved the number of lineages
  // available to link across — and a chord joining a strand that passed behind
  // the statement to one that went around it is precisely the interconnection
  // this section is about. Chords that would cross type are rejected below on
  // their own merits, which is the check that actually matters.
  const nodes = network.nodes;
  const lineageOf = new Map<string, string>();
  for (const node of nodes) lineageOf.set(node.id, lineage(node.branchId));

  interface Candidate {
    a: NetworkNode;
    b: NetworkNode;
    distance: number;
  }

  const candidates: Candidate[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (lineageOf.get(a.id) === lineageOf.get(b.id)) continue;

      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      if (distance < options.minDistance || distance > options.maxDistance) continue;

      // Rule 4 — never bridge across a block of type.
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      if (inAnyZone(mx, my, options.keepOut, 0)) continue;
      if (inAnyZone(a.x, a.y, options.keepOut, 0)) continue;
      if (inAnyZone(b.x, b.y, options.keepOut, 0)) continue;

      candidates.push({ a, b, distance });
    }
  }

  // Shortest links first: proximity is the most believable reason for two
  // filaments to have found each other.
  candidates.sort((p, q) => p.distance - q.distance || (p.a.id < q.a.id ? -1 : 1));

  const used = new Map<string, number>();
  const chosen: Connection[] = [];

  for (const candidate of candidates) {
    if (chosen.length >= options.max) break;
    const usedA = used.get(candidate.a.id) ?? 0;
    const usedB = used.get(candidate.b.id) ?? 0;
    if (usedA >= options.maxPerNode || usedB >= options.maxPerNode) continue;

    used.set(candidate.a.id, usedA + 1);
    used.set(candidate.b.id, usedB + 1);

    chosen.push({
      id: `c${chosen.length}`,
      d: chord(candidate.a, candidate.b, 0.11, rng),
      // Over-estimated so the dash always covers the curve before it draws.
      length: Math.round(candidate.distance * 1.3 + 2),
      // Rule 5 — a link cannot precede the nodes it joins.
      at: Math.max(candidate.a.appearAt, candidate.b.appearAt),
      from: candidate.a.id,
      to: candidate.b.id,
    });
  }

  // Re-spread the reveal order across the full 0..1 range. Without this the
  // chords bunch wherever the underlying growth happened to be busiest.
  chosen.sort((p, q) => p.at - q.at);
  const span = Math.max(1, chosen.length - 1);
  chosen.forEach((connection, i) => {
    connection.at = Math.round((i / span) * 1000) / 1000;
  });

  return chosen;
}
