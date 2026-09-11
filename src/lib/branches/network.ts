/**
 * SECTION 04 — THE TURN
 *
 * This is the one field on the page whose macro composition is ART-DIRECTED
 * rather than emergent. Everywhere else the organism falls; here it stops
 * falling and TRAVELS — one trunk crossing the composition left to right,
 * six disciplines growing off it as it passes, then a deliberate turn back
 * into descent at the far edge.
 *
 *   entries (Selected Work's real exits)
 *      ╲  ╲
 *       ╲──╲──● gather
 *              ╰────●───── 01
 *                    ╰──●──── 02 ─╮
 *                        03 ──────●────●──── 04
 *                                        ╰──●──── 05 ──●──── 06 ─╮
 *                                            ╰ descent   descent ╯╲
 *                                                                  descent
 *
 * Nothing decorative is invented: the entries are the actual trunks that left
 * Selected Work through its lower edge (readWorkExits regrows that section's
 * pure generator and reads them off), every connection starts at a real point
 * on the trunk's polyline, and the three descents that cross the foot are the
 * exits The Collective inherits. Seeded randomness supplies micro-curvature
 * only — the journey itself is deterministic composition, per the brief:
 * macro path intentional, micro variation seeded.
 */

import type { Tier } from "@/lib/hero/config";
import { NETWORK_SEED } from "@/lib/hero/config";
import {
  measure,
  toPath,
  type Branch,
  type NetworkNode,
  type OrganicNetwork,
  type Point,
} from "@/lib/hero/network";
import { chance, createRng, range, type Rng } from "@/lib/hero/random";
import { generateWorkNetwork } from "@/lib/work/network";
import { readExits } from "@/lib/network/continuity";
import type { CascadeInlet } from "@/lib/first-growth/cascade";
import { LATERAL_SHAPE } from "./config";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where Section 3's trunks cross its lower edge, normalised 0..1.
 *
 * Reads the live DOM because that is the only place Section 3's field size is
 * known. Returns null when Selected Work is not on the page, so the caller can
 * decide what to do rather than being handed invented geometry.
 */
export function readWorkExits(tier: Tier): CascadeInlet[] | null {
  if (typeof document === "undefined") return null;
  const work = document.querySelector<HTMLElement>(".work");
  if (!work) return null;

  const rect = work.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const images = Array.from(
    work.querySelectorAll<HTMLElement>("[data-work-frame]"),
  ).map((frame) => {
    const box = frame.getBoundingClientRect();
    return {
      x: box.left - rect.left,
      y: box.top - rect.top,
      width: box.width,
      height: box.height,
    };
  });

  const network = generateWorkNetwork({
    tier,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    images,
  });

  // Two, never more: everything that arrives here is gathered into ONE
  // lateral trunk, so extra entries only crowd the gather — and at 1440 the
  // third-deepest Work trunk ends 213px above the seam, which is exactly the
  // hung-in-space entry this page must not draw. `readExits` treats foot depth
  // and spacing as preferences and relaxes them in order, so the only empty
  // result is a parent with no trunks at all.
  const kept = readExits(network, { min: 2, max: 2, spacing: 0.09 });
  return kept.length ? kept : null;
}

export interface BranchFieldInput {
  tier: Tier;
  /** Measured section size, in CSS pixels. */
  width: number;
  height: number;
  /** Card rectangles in the same pixel space, in slot order a..f. */
  cards: Rect[];
  /** Entry points inherited from Section 3. */
  inlets: CascadeInlet[];
}

/* ------------------------------------------------------------------ *
 * geometry helpers
 * ------------------------------------------------------------------ */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Insert a jittered midpoint into every span. The originals survive, so any
 * point referenced as a junction stays exactly on the refined polyline —
 * which is what keeps every fork a real fork.
 */
function refine(rng: Rng, pts: Point[], amp: number, passes: number): Point[] {
  let current = pts;
  for (let pass = 0; pass < passes; pass += 1) {
    const out: Point[] = [current[0]];
    for (let i = 1; i < current.length; i += 1) {
      const a = current[i - 1];
      const b = current[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      // Perpendicular offset, capped so a short span cannot buckle.
      const off = range(rng, -amp, amp) * Math.min(1, len / (amp * 6));
      out.push(
        { x: (a.x + b.x) / 2 + (-dy / len) * off, y: (a.y + b.y) / 2 + (dx / len) * off },
        b,
      );
    }
    current = out;
  }
  return current;
}

/** Cumulative polyline length up to each point. */
function cumulative(pts: Point[]): number[] {
  const acc = [0];
  for (let i = 1; i < pts.length; i += 1) {
    acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  return acc;
}

/* ------------------------------------------------------------------ *
 * the journey
 * ------------------------------------------------------------------ */

interface Waypoint extends Point {
  /** What resolves at this point, if anything. */
  tag?: "connector-side" | "connector-under" | "descent" | "turn";
  card?: number;
}

export function generateBranchNetwork(input: BranchFieldInput): OrganicNetwork {
  const rng = createRng(NETWORK_SEED + 173);
  const shape = LATERAL_SHAPE[input.tier];
  const { width, height, cards, inlets } = input;
  const jit = (amt: number) => range(rng, -amt, amt);
  const clampX = (x: number) => Math.min(width - 14, Math.max(14, x));

  const branches: Branch[] = [];
  const nodes: NetworkNode[] = [];
  const rawStart: number[] = [];

  const empty: OrganicNetwork = {
    width,
    height,
    seedPoint: { x: width / 2, y: 0 },
    branches,
    nodes,
    halftone: [],
    descenders: [],
  };
  if (!inlets.length || !cards.length) return empty;

  const push = (
    id: string,
    parentId: string | null,
    depth: number,
    pts: Point[],
    strokeWidth: number,
    opacity: number,
    startTime: number,
  ): { id: string; end: number; length: number } => {
    const length = measure(pts);
    branches.push({
      id,
      parentId,
      depth,
      d: toPath(pts),
      length: Math.round(length),
      width: Math.round(strokeWidth * 100) / 100,
      opacity,
      behind: false,
      growthStart: 0,
      growthDuration: length, // raw for now; normalised at the end
      tip: pts[pts.length - 1],
    });
    rawStart.push(startTime);
    return { id, end: startTime + length, length };
  };

  const node = (
    branchId: string,
    p: Point,
    kind: "junction" | "tip",
    r: number,
    opacity: number,
    appearAt: number,
    ring = false,
    hollow = false,
  ) => {
    nodes.push({
      id: `n-${branchId}-${nodes.length}`,
      branchId,
      x: Math.round(p.x * 100) / 100,
      y: Math.round(p.y * 100) / 100,
      r: Math.round(r * 100) / 100,
      depth: kind === "junction" ? 0 : 1,
      kind,
      ring,
      hollow,
      opacity,
      behind: false,
      appearAt,
    });
  };

  /* ---- 1. the macro waypoints, card by card -------------------------- */

  // The staircase's columns overlap, so the trunk never excurses past a
  // card's right edge only to double back — it hugs each station's left
  // flank, passes beneath it, and glides to the next flank. The card
  // positions themselves carry the rightward travel.
  const waypoints: Waypoint[] = [];
  cards.forEach((card, i) => {
    const flankX = clampX(card.x - shape.clearance + jit(shape.jitter * 0.5));
    // A card sitting against the left rail leaves no room for a side flank,
    // so its connection comes up from beneath instead. Elsewhere the two
    // alternate so no two neighbours attach alike.
    const under = card.x < shape.clearance * 2.5 || i % 2 === 1;
    waypoints.push(
      {
        x: flankX,
        y: card.y - shape.drop * 0.7 + jit(shape.jitter * 0.6),
      },
      {
        x: flankX + jit(shape.jitter * 0.4),
        y: card.y + card.height * 0.68 + jit(shape.jitter * 0.6),
        tag: under ? undefined : "connector-side",
        card: under ? undefined : i,
      },
      {
        x: clampX(card.x + card.width * 0.42 + jit(shape.jitter)),
        y: card.y + card.height + shape.drop * 0.85 + jit(shape.jitter * 0.5),
        // The organism starts resolving before the lateral run finishes: the
        // first descent leaves from beneath the fifth station. (That card's
        // own connection is a side one, so the under point is free.)
        tag: under
          ? "connector-under"
          : i === Math.max(0, cards.length - 2)
            ? "descent"
            : undefined,
        card: under ? i : undefined,
      },
    );
  });

  const last = cards[cards.length - 1];
  const turn: Waypoint = {
    x: clampX(Math.min(width - 60, last.x + last.width + shape.clearance * 1.3)),
    y: last.y + last.height + shape.drop * 2.2 + jit(shape.jitter * 0.6),
    tag: "turn",
  };
  waypoints.push(turn);

  // The trunk's root sits above the first station's flank; everything that
  // arrives from Selected Work bends into the journey at or just past it.
  const gather: Point = { x: waypoints[0].x, y: waypoints[0].y };

  /* ---- 2. the trunk, segmented at every resolution ------------------- */

  interface TrunkSeg {
    pts: Point[];
    tag?: Waypoint["tag"];
    card?: number;
  }
  const segments: TrunkSeg[] = [];
  let macro: Point[] = [gather];
  for (const wp of waypoints.slice(1)) {
    macro.push({ x: wp.x, y: wp.y });
    if (wp.tag) {
      segments.push({ pts: macro, tag: wp.tag, card: wp.card });
      macro = [{ x: wp.x, y: wp.y }];
    }
  }
  if (macro.length > 1) segments.push({ pts: macro });

  // Refined AFTER segmentation, so every junction stays a shared exact point.
  segments.forEach((seg) => {
    seg.pts = refine(rng, seg.pts, shape.wobble, seg.pts.length < 4 ? 2 : 1);
  });

  /* ---- 3. entries — Selected Work's strands bending into the run ----- */

  // The deepest entry becomes the trunk's own root. Later entries merge at
  // staggered arc distances DOWN the journey — real refined-polyline points,
  // far enough apart that the confluence reads as strands joining a road,
  // never as a starburst or a knot.
  const mergeArcs = input.tier === "mobile" ? [90, 210] : [130, 320];
  const merges: { p: Point; arc: number }[] = [];
  {
    let offset = 0;
    let m = 0;
    for (const seg of segments) {
      const acc = cumulative(seg.pts);
      const total = acc[acc.length - 1];
      while (m < mergeArcs.length && mergeArcs[m] <= offset + total) {
        const local = mergeArcs[m] - offset;
        let idx = acc.findIndex((d) => d >= local);
        idx = Math.min(Math.max(idx, 1), seg.pts.length - 2);
        merges.push({ p: seg.pts[idx], arc: offset + acc[idx] });
        m += 1;
      }
      offset += total;
      if (m >= mergeArcs.length) break;
    }
    while (merges.length < inlets.length - 1) {
      merges.push({ p: gather, arc: 0 });
    }
  }

  const entryEnds: { end: number; length: number }[] = [];
  inlets.forEach((inlet, k) => {
    const x0 = clampX(inlet.x * width);
    const target = k === 0 ? gather : merges[k - 1].p;
    // Leave on the tangent the strand crossed the seam with, so the join
    // reads as one stroke; the sweep toward the gather begins after it.
    const a =
      inlet.angle !== undefined
        ? Math.min(Math.PI - 0.3, Math.max(0.3, inlet.angle))
        : inlet.lean === 1
          ? 1.1
          : Math.PI - 1.1;
    const leadLen = range(rng, 46, 68);
    const lead: Point = {
      x: clampX(x0 + Math.cos(a) * leadLen),
      y: Math.max(30, Math.sin(a) * leadLen),
    };
    const pts = refine(
      rng,
      [
        { x: x0, y: 0 },
        lead,
        // Falls first, turns late: the eye watches the inherited strand keep
        // falling, then bend into the lateral journey.
        {
          x: clampX(lerp(lead.x, target.x, 0.3) + jit(shape.jitter)),
          y: lerp(lead.y, target.y, 0.52),
        },
        {
          x: clampX(lerp(lead.x, target.x, 0.72) + jit(shape.jitter * 0.7)),
          y: lerp(lead.y, target.y, 0.86),
        },
        target,
      ],
      shape.wobble,
      1,
    );
    const length = measure(pts);
    entryEnds.push({ end: length, length });
    push(`e${k}`, null, 0, pts, shape.trunkWidth * 0.94, 0.86, 0);
  });

  /* ---- 4. timing: the trunk sets off when the first entry lands ------ */

  const clock = entryEnds[0].end;
  // A quiet node where the inherited strand turns into the journey.
  node("e0", gather, "junction", shape.trunkWidth * 1.6, 0.8, clock);

  const segStart: number[] = [];
  let segClock = clock;
  const segEnds: { id: string; end: number }[] = [];
  segments.forEach((seg, i) => {
    segStart.push(segClock);
    const id = `t${i}`;
    const parent = i === 0 ? "e0" : `t${i - 1}`;
    const res = push(id, parent, 0, seg.pts, shape.trunkWidth, 0.9, segClock);
    segEnds.push({ id, end: res.end });
    segClock = res.end;
  });

  // Later entries are re-timed to arrive as the trunk passes their merge;
  // the first confluence carries the section's one ringed node.
  for (let k = 1; k < inlets.length; k += 1) {
    const merge = merges[k - 1];
    const at = clock + merge.arc;
    rawStart[k] = Math.max(0, at - entryEnds[k].length);
    node(`e${k}`, merge.p, "junction", shape.trunkWidth * (k === 1 ? 2.4 : 2), 0.9, at,
      k === 1);
  }

  /* ---- 5. the six connections — grown, not drawn --------------------- */

  segments.forEach((seg, i) => {
    if (seg.card === undefined || !seg.tag?.startsWith("connector")) return;
    const card = cards[seg.card];
    const junction = seg.pts[seg.pts.length - 1];
    const at = segEnds[i].end;

    // The strand lands a little INSIDE the card's edge and disappears under
    // it — attachment as consequence, no leader line, no floating endpoint.
    const landing: Point =
      seg.tag === "connector-side"
        ? { x: card.x + 14, y: card.y + card.height * range(rng, 0.32, 0.6) }
        : { x: card.x + card.width * range(rng, 0.2, 0.38), y: card.y + card.height - 12 };

    const pts = refine(
      rng,
      [
        junction,
        {
          x: (junction.x + landing.x) / 2 + jit(shape.jitter * 0.5),
          y: (junction.y + landing.y) / 2 + jit(shape.jitter * 0.5),
        },
        landing,
      ],
      shape.wobble * 0.55,
      1,
    );
    push(`c${seg.card}`, segEnds[i].id, 1, pts, shape.trunkWidth * 0.62, 0.68, at);
    node(segEnds[i].id, junction, "junction", range(rng, 2.6, 3.8), range(rng, 0.8, 1), at,
      chance(rng, 0.3));
  });

  /* ---- 6. resolution — three real descents cross the foot ------------ */

  // Pulled well off the right wall: an arrival hugging the edge of The
  // Collective gets pinned between the wall and the portrait keep-outs and
  // never reaches that field's foot — swept in Node against the measured
  // 1440 layout, entries at 0.84+ stalled at half depth while 0.80 and left
  // crossed every time.
  const exitBase = Math.min(0.8, Math.max(0.5, turn.x / width - 0.13));
  const exitXs = [exitBase, exitBase - 0.18, exitBase - 0.34].map((x) =>
    Math.max(0.36, x),
  );

  const dive = (
    id: string,
    parentId: string,
    from: Point,
    exitX: number,
    startTime: number,
    over: number,
  ) => {
    const end = { x: clampX(exitX * width), y: height + over };
    const pts = refine(
      rng,
      [
        from,
        {
          x: clampX(lerp(from.x, end.x, 0.3) + jit(shape.jitter * 0.7)),
          y: lerp(from.y, end.y, 0.38),
        },
        {
          x: clampX(lerp(from.x, end.x, 0.72) + jit(shape.jitter * 0.7)),
          y: lerp(from.y, end.y, 0.74),
        },
        end,
      ],
      // Committed, calm descents — this is the organism resolving, and a
      // final descent that snakes reads as indecision.
      shape.wobble * 0.7,
      2,
    );
    push(id, parentId, 0, pts, shape.trunkWidth * 0.94, 0.88, startTime);
  };

  const turnSeg = segEnds[segEnds.length - 1];
  const turnPoint = segments[segments.length - 1].pts.at(-1) as Point;
  node(turnSeg.id, turnPoint, "junction", shape.trunkWidth * 2.4, 0.95, turnSeg.end,
    chance(rng, 0.4));
  dive("d0", turnSeg.id, turnPoint, exitXs[0], turnSeg.end, 44);
  dive("d1", turnSeg.id, turnPoint, exitXs[1], turnSeg.end, 40);

  const early = segments.findIndex((seg) => seg.tag === "descent");
  if (early >= 0) {
    const from = segments[early].pts.at(-1) as Point;
    node(segEnds[early].id, from, "junction", shape.trunkWidth * 2.1, 0.9,
      segEnds[early].end);
    dive("d2", segEnds[early].id, from, exitXs[2], segEnds[early].end, 36);
  }

  /* ---- 7. a few twigs into negative space, and nothing more ---------- */

  // Twigs leave from the MIDDLE of a trunk segment, never from a boundary —
  // the boundaries are already junctions, and stacking a twig on a connector
  // fork would turn a legible node into a knot.
  const gapPoints = segments
    .slice(1, Math.max(2, segments.length - 3))
    .map((seg) => seg.pts[Math.floor(seg.pts.length / 2)]);
  for (let t = 0; t < Math.min(shape.twigCount, gapPoints.length); t += 1) {
    const start = gapPoints.splice(
      Math.floor(range(rng, 0, gapPoints.length - 0.001)),
      1,
    )[0];
    const angle = range(rng, -2.4, -0.7);
    const len = range(rng, 55, 110) * (input.tier === "mobile" ? 0.7 : 1);
    const mid: Point = {
      x: clampX(start.x + Math.cos(angle) * len * 0.55 + jit(shape.jitter * 0.6)),
      y: start.y + Math.sin(angle) * len * 0.55 + jit(shape.jitter * 0.6),
    };
    const tip: Point = {
      x: clampX(start.x + Math.cos(angle + jit(0.4)) * len),
      y: Math.max(20, start.y + Math.sin(angle + jit(0.4)) * len),
    };
    const at = segClock * range(rng, 0.4, 0.8);
    const res = push(`w${t}`, null, 1, refine(rng, [start, mid, tip], shape.wobble * 0.5, 1),
      shape.trunkWidth * 0.53, 0.5, at);
    node(`w${t}`, tip, "tip", range(rng, 1.2, 1.8), range(rng, 0.5, 0.75), res.end,
      false, chance(rng, 0.5));
  }

  /* ---- 8. normalise the growth timeline to 0..1 ---------------------- */

  const span = Math.max(
    1,
    ...branches.map((b, i) => rawStart[i] + b.growthDuration),
    ...nodes.map((n) => n.appearAt),
  );
  branches.forEach((b, i) => {
    b.growthStart = Math.round((rawStart[i] / span) * 1000) / 1000;
    b.growthDuration = Math.round((b.growthDuration / span) * 1000) / 1000;
  });
  nodes.forEach((n) => {
    n.appearAt = Math.round(Math.min(1, n.appearAt / span) * 1000) / 1000;
  });

  return {
    width,
    height,
    seedPoint: gather,
    branches,
    nodes,
    halftone: [],
    descenders: [],
  };
}
