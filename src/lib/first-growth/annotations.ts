/**
 * ANNOTATIONS — the collective, named.
 *
 * The four brand-voice values are not laid out on a grid, and they are not
 * dumped in a card row. They sit at art-directed points down the field in an
 * alternating ladder, and each one reaches back into the network by a hairline
 * leader drawn to the nearest real junction. Individual elements → connections
 * → collective.
 *
 * The direction of that dependency matters. An earlier version chose the label
 * positions *from* the generated nodes, which read well until the generator was
 * retuned — then the anchors moved, the ladder collapsed and labels landed on
 * top of each other. Composition is now fixed and the network attaches to it,
 * so tuning density can change what the leaders point at but never where the
 * words are. The slots below mirror the keep-out rectangles in ./config.ts and
 * the layout percentages in firstGrowth.css; move one, move all three.
 */

import type { KeepOut, NetworkNode, OrganicNetwork } from "@/lib/hero/network";

/** An art-directed resting place for one value. */
export interface AnnotationSlot {
  /** Anchor point — the end of the leader — normalised 0..1 in the field. */
  x: number;
  y: number;
  /** Which way the words run from the anchor. */
  side: "left" | "right";
}

export interface Annotation {
  id: string;
  label: string;
  x: number;
  y: number;
  side: "left" | "right";
  /** Nearest junction, when one is close enough to be worth joining to. */
  anchorNode: NetworkNode | null;
  /** Reveal order, 0..1. */
  at: number;
}

/** Client brand voice, verbatim. Never paraphrase these. */
export const BRAND_VALUES = [
  "Bold, not brash",
  "Warmly irreverent",
  "Relentlessly curious",
  "Boldly modern, firmly rooted",
] as const;

export interface AnnotationOptions {
  slots: readonly AnnotationSlot[];
  /**
   * Furthest a leader may reach, in field units. Past this the label simply
   * stands alone — a leader stretching across open black would claim a
   * connection the network has not actually made.
   */
  maxLeader: number;
}

export function deriveAnnotations(
  network: OrganicNetwork,
  options: AnnotationOptions,
): Annotation[] {
  const { width, height } = network;
  const used = new Set<string>();

  const out: Annotation[] = [];

  BRAND_VALUES.forEach((label, i) => {
    const slot = options.slots[i];
    if (!slot) return;

    const ax = slot.x * width;
    const ay = slot.y * height;

    // Nearest unclaimed junction, preferring real forks over branch tips.
    let best: NetworkNode | null = null;
    let bestScore = Infinity;
    for (const node of network.nodes) {
      if (node.behind || used.has(node.id)) continue;
      const distance = Math.hypot(node.x - ax, node.y - ay);
      if (distance > options.maxLeader) continue;
      const score = distance + (node.kind === "junction" ? 0 : options.maxLeader * 0.25);
      if (score < bestScore) {
        bestScore = score;
        best = node;
      }
    }
    if (best) used.add(best.id);

    out.push({
      id: `a${i}`,
      label,
      x: slot.x,
      y: slot.y,
      side: slot.side,
      anchorNode: best,
      at: i / Math.max(1, BRAND_VALUES.length - 1),
    });
  });

  return out;
}

/** The rectangles the labels occupy, so connections can be told to avoid them. */
export function annotationZones(
  annotations: Annotation[],
  network: OrganicNetwork,
  labelWidth: number,
  labelHeight: number,
): KeepOut[] {
  return annotations.map((a) => {
    const x = a.x * network.width;
    return {
      x: a.side === "right" ? x : x - labelWidth,
      y: a.y * network.height - labelHeight / 2,
      width: labelWidth,
      height: labelHeight,
      influence: 0,
      strength: 0,
    };
  });
}
