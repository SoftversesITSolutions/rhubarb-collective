/**
 * CASCADE GROWTH — the hero's grammar, carried downward
 * =====================================================
 *
 * The hero grows LATERALLY: strands creep sideways with a weak restoring pull
 * toward horizontal, and the composition travels across the frame. Section two
 * has to make net downward progress because the reader is scrolling — and the
 * first attempt got that by simply pointing every strand down. That produced
 * long near-vertical filaments with nothing happening along them: hanging
 * roots, not mycelium. It changed the organism's character at the seam, which
 * is the one thing this section must not do.
 *
 * This model fixes it by separating the two motions:
 *
 *   • an individual strand always runs LATERALLY, exactly like the hero —
 *     a curved walk held to a near-horizontal heading with a shallow descent
 *   • downward progress is EMERGENT, produced by the cascade: a run resolves at
 *     a junction, its children set off laterally again a little lower, and the
 *     structure steps down the field
 *
 *          ╲
 *           ╲────●
 *                 ╲
 *                  ●──────╮
 *                         ╲
 *                          ●
 *                        ╱
 *                  ●─────╯
 *
 * No strand travels far without resolving into something. `runLength` is the
 * hard cap on unsupported continuation: past it a run must reach a junction,
 * fork, or end. That single rule is what removes the hanging-root reading.
 *
 * Structure is trunks plus offshoots, not a uniform fractal:
 *   TRUNK    one per hero inlet, descending the field in lateral stages
 *   OFFSHOOT a shorter lateral run leaving a trunk junction, which may fork
 *            once more and then ends
 *
 * Curves, smoothing and measurement all come from the hero's own primitives, so
 * the drawing grammar is identical by construction rather than by imitation.
 */

import {
  angleDelta,
  measure,
  repulsion,
  toPath,
  type Branch,
  type KeepOut,
  type NetworkNode,
  type OrganicNetwork,
  type Point,
} from "@/lib/hero/network";
import { chance, createRng, range, type Rng } from "@/lib/hero/random";

/** An entry point inherited from the section above. */
export interface CascadeInlet {
  /** Normalised 0..1 position on the top edge. */
  x: number;
  /** Which way the strand was leaning as it left the section above. */
  lean: -1 | 1;
  /**
   * The heading the strand crossed the seam on, radians. When present the
   * continuation leaves on this exact tangent, so the join reads as one
   * stroke; without it the entry falls back to the section's `entryAngle`.
   */
  angle?: number;
}

export interface CascadeConfig {
  seed: number;
  width: number;
  height: number;
  inlets: readonly CascadeInlet[];
  /** Lateral stages a trunk descends through. */
  trunkStages: number;
  /** Hard ceiling on segments. */
  segmentBudget: number;
  /**
   * MAX UNBRANCHED DISTANCE, in field units. A run may not travel further than
   * this without resolving — this is the parameter that keeps strands from
   * reading as hanging roots.
   */
  runLength: [number, number];
  /** Field units advanced per step along a run. */
  stepLength: number;
  /** Radians of random wander per step. */
  curl: number;
  /** How firmly a run is held to its lateral heading. */
  tropismStrength: number;
  /** Radians below horizontal that a lateral run descends at. */
  descent: [number, number];
  /**
   * Total spread of per-trunk descent bias, in radians. Trunks are fanned
   * across this range so neighbouring hero exits separate as they fall instead
   * of travelling together.
   */
  descentSpread: number;
  /** Heading a strand arrives on, inherited from the section above. */
  entryAngle: number;
  /** Chance a trunk junction also throws an offshoot. */
  offshootChance: number;
  /** Chance an offshoot forks once more before ending. */
  offshootForkChance: number;
  /** Chance a child reverses its lateral direction at a junction. */
  reverseChance: number;
  /** Stroke width of a trunk run. */
  baseWidth: number;
  keepOut: readonly KeepOut[];
  /** Field-unit inset growth is held within. */
  margin: number;
}

interface Segment {
  id: string;
  /** Radians added to this lineage's descent, spreading trunks apart. */
  descentBias: number;
  /** Trunk lineage this segment belongs to. */
  lineage: string;
  parentId: string | null;
  /** 0 for a trunk run, 1+ for offshoots. */
  rank: number;
  stage: number;
  start: Point;
  heading: number;
  direction: -1 | 1;
  /** Absolute (pre-normalisation) time this run begins. */
  startTime: number;
  behind: boolean;
}

interface Walk {
  points: Point[];
  headings: number[];
  /** Left through a side wall — the run ends, but the lineage carries on. */
  escapedSide: boolean;
  /** Left through the foot of the field — the lineage is done here. */
  escapedFoot: boolean;
}

/**
 * One lateral run. Identical in spirit to the hero's walk: wander, a restoring
 * pull toward the run's target heading, repulsion from typography, and a soft
 * vertical containment. The target heading is near-horizontal, which is what
 * keeps the grammar lateral.
 */
function runSegment(
  rng: Rng,
  cfg: CascadeConfig,
  start: Point,
  heading: number,
  target: number,
  steps: number,
  ignoreKeepOut: boolean,
  foot: number,
): Walk {
  const points: Point[] = [start];
  const headings: number[] = [heading];
  const zones = ignoreKeepOut ? [] : cfg.keepOut;
  let p = start;
  let a = heading;
  let escapedSide = false;
  let escapedFoot = false;

  for (let i = 0; i < steps; i += 1) {
    a += (rng() - 0.5) * cfg.curl;
    a += angleDelta(a, target) * cfg.tropismStrength;

    const push = repulsion(p, zones);
    if (push.x !== 0 || push.y !== 0) {
      a = Math.atan2(Math.sin(a) + push.y * 1.5, Math.cos(a) + push.x * 1.5);
    }

    // Containment curves a run away from an edge rather than letting it drive
    // into one. A strand that skids along a wall reads as a mistake; a strand
    // that turns reads as the organism finding room.
    if (p.y < cfg.margin) a += angleDelta(a, 0.35) * 0.2;
    if (p.y > cfg.height - cfg.margin) a += angleDelta(a, -0.2) * 0.2;
    // Only steer when the run is actually heading at the wall. Applying it
    // unconditionally kept rotating strands that had already turned away, and
    // they curled right round into teardrops.
    const rail = cfg.margin * 3;
    const goingRight = Math.cos(a) > 0;
    if (p.x < rail && !goingRight) a += angleDelta(a, 0.3) * 0.22;
    if (p.x > cfg.width - rail && goingRight) a += angleDelta(a, Math.PI - 0.3) * 0.22;

    const len = cfg.stepLength * range(rng, 0.85, 1.15);
    const next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };

    if (next.y > foot) {
      escapedFoot = true;
      break;
    }
    if (next.x < -cfg.margin || next.x > cfg.width + cfg.margin) {
      escapedSide = true;
      break;
    }

    p = next;
    points.push(p);
    headings.push(a);
  }

  return { points, headings, escapedSide, escapedFoot };
}

/** Target heading for a lateral run: horizontal in `direction`, tilted down. */
function lateralTarget(direction: -1 | 1, descent: number): number {
  return direction === 1 ? descent : Math.PI - descent;
}

export function generateCascade(cfg: CascadeConfig): OrganicNetwork {
  const rng = createRng(cfg.seed);

  const branches: Branch[] = [];
  const nodes: NetworkNode[] = [];
  const rawStart: number[] = [];
  const rawDuration: number[] = [];

  const queue: Segment[] = cfg.inlets.map((inlet, i) => {
    // The strand arrives on the heading it left the section above with, then
    // the lateral target pulls it round inside the first run — the eye follows
    // it across the seam and watches it turn, rather than meeting a new line.
    //
    // The one override: an entry sitting hard against a side wall is turned
    // inward regardless of its lean. Honouring a rightward lean at x = 0.96
    // just walks the strand off the canvas in three steps.
    const inward: -1 | 1 = inlet.x > 0.5 ? -1 : 1;
    const cornered = inlet.x > 0.82 || inlet.x < 0.18;
    const lean = cornered ? inward : inlet.lean;
    const spread = cfg.inlets.length > 1 ? i / (cfg.inlets.length - 1) - 0.5 : 0;

    // Continue on the tangent the strand crossed the seam with, clamped into
    // a downward cone; the resolved lean still decides which way the strand
    // opens, so a cornered entry mirrors the tangent instead of walking off
    // the canvas.
    let heading = lean === 1 ? cfg.entryAngle : Math.PI - cfg.entryAngle;
    if (inlet.angle !== undefined) {
      heading = Math.min(Math.PI - 0.3, Math.max(0.3, inlet.angle));
      if ((Math.cos(heading) >= 0 ? 1 : -1) !== lean) heading = Math.PI - heading;
    }

    return {
      id: `t${i}`,
      lineage: `t${i}`,
      parentId: null,
      rank: 0,
      stage: 0,
      descentBias: spread * cfg.descentSpread,
      start: { x: inlet.x * cfg.width, y: 0 },
      heading,
      direction: lean,
      startTime: i * 0.35,
      // Alternate strands pass behind the copy. The statement runs nearly the
      // full width; without a route through it the arriving strands mat up
      // along its upper edge.
      behind: i % 2 === 1,
    };
  });

  let cursor = 0;

  while (cursor < queue.length && branches.length < cfg.segmentBudget) {
    const item = queue[cursor];
    cursor += 1;

    const isTrunk = item.rank === 0;
    const lengthScale = isTrunk ? 1 : range(rng, 0.45, 0.72);
    const runDistance = range(rng, ...cfg.runLength) * lengthScale;
    const steps = Math.max(4, Math.round(runDistance / cfg.stepLength));
    const descent = range(rng, ...cfg.descent) + item.descentBias;
    const target = lateralTarget(item.direction, descent);

    // Only a trunk may cross the foot — a trunk that leaves is a candidate
    // exit the next section can continue. An offshoot that crossed was just
    // SLICED by the section clip mid-stroke, a broken line ending on the
    // boundary that nothing below ever picks up; it terminates with its tip
    // node above the edge instead.
    const walk = runSegment(
      rng,
      cfg,
      item.start,
      item.heading,
      target,
      steps,
      item.behind,
      isTrunk ? cfg.height + cfg.margin * 2 : cfg.height - cfg.margin,
    );
    if (walk.points.length < 4) {
      // A walk cut short inside a pocket — wall on one side, keep-out on the
      // other — used to end the lineage SILENTLY: the trunk died mid-field
      // with stages to spare, and every seam below it starved. A trapped
      // strand turns back into the field instead. The retry consumes a stage,
      // so a cornered trunk winds down rather than ping-ponging forever.
      if (
        item.rank === 0 &&
        // Same extended cap as an unfinished trunk's continuation below: a
        // pocket usually traps a strand high in the field, exactly where the
        // extra stages are needed.
        item.stage + 1 <
          (item.start.y < cfg.height * 0.92
            ? Math.ceil(cfg.trunkStages * 1.7)
            : cfg.trunkStages) &&
        branches.length + queue.length - cursor < cfg.segmentBudget
      ) {
        const turned = (item.direction * -1) as -1 | 1;
        queue.push({
          ...item,
          id: `${item.id}r`,
          stage: item.stage + 1,
          direction: turned,
          heading: lateralTarget(turned, range(rng, ...cfg.descent)),
          startTime: item.startTime + 0.2,
        });
      }
      continue;
    }

    const length = measure(walk.points);
    const duration = Math.max(0.5, length / cfg.stepLength) * 0.3;
    const tip = walk.points[walk.points.length - 1];
    const tipHeading = walk.headings[walk.headings.length - 1];

    branches.push({
      id: item.id,
      parentId: item.parentId,
      depth: item.rank,
      d: toPath(walk.points),
      length: Math.round(length),
      width: Math.round(cfg.baseWidth * (isTrunk ? 1 : 0.66) * 100) / 100,
      opacity: isTrunk ? 0.86 : 0.6,
      behind: item.behind,
      growthStart: 0,
      growthDuration: 0,
      tip,
    });
    rawStart.push(item.startTime);
    rawDuration.push(duration);

    const endTime = item.startTime + duration;
    const canContinue =
      !walk.escapedFoot &&
      tip.y < cfg.height - cfg.margin &&
      branches.length + queue.length - cursor < cfg.segmentBudget;

    // A trunk keeps stepping down for its allotted stages — and a trunk whose
    // descent is UNFINISHED may run over the estimate by up to 70%, because
    // `trunkStages` is a prediction and a run truncated by a wall or a
    // keep-out drops less than predicted. A trunk that dies mid-field leaves
    // a dead end the next section can never continue; the budget ceiling in
    // `canContinue` still bounds everything. An offshoot is short by design —
    // usually a single run, occasionally one fork more.
    const stageCap =
      tip.y < cfg.height * 0.92
        ? Math.ceil(cfg.trunkStages * 1.7)
        : cfg.trunkStages;
    const continues =
      canContinue &&
      (isTrunk
        ? item.stage + 1 < stageCap
        : item.rank < 2 && chance(rng, cfg.offshootForkChance));

    const children: Segment[] = [];
    let reversedHere = false;
    let turnedHere = false;

    if (continues) {
      // Reverse when the field edge is close, so the structure turns back into
      // the composition instead of grinding along the margin.
      const nearRight = tip.x > cfg.width * 0.82;
      const nearLeft = tip.x < cfg.width * 0.18;
      let direction = item.direction;
      if (walk.escapedSide) direction = (item.direction * -1) as -1 | 1;
      else if (nearRight) direction = -1;
      else if (nearLeft) direction = 1;
      else if (chance(rng, cfg.reverseChance)) direction = (item.direction * -1) as -1 | 1;
      turnedHere = direction !== item.direction;

      // Rotate most of the way onto the new heading immediately. The spline
      // still renders it as a curve, but the change of direction happens at the
      // node instead of being smeared across the next 400 units — which is what
      // makes a junction legible as a junction.
      const turned =
        tipHeading +
        angleDelta(tipHeading, lateralTarget(direction, range(rng, ...cfg.descent))) *
          0.6;

      children.push({
        id: `${item.id}-c${item.stage + 1}`,
        lineage: item.lineage,
        parentId: item.id,
        rank: isTrunk ? 0 : item.rank + 1,
        stage: item.stage + 1,
        descentBias: item.descentBias,
        start: tip,
        heading: turned,
        direction,
        startTime: endTime,
        behind: item.behind,
      });

      if (isTrunk && chance(rng, cfg.offshootChance)) {
        children.push({
          id: `${item.id}-o${item.stage + 1}`,
          lineage: item.lineage,
          parentId: item.id,
          rank: 1,
          stage: item.stage + 1,
          descentBias: item.descentBias,
          start: tip,
          heading: tipHeading,
          // An offshoot always leaves the other way, so a fork reads as a fork.
          direction: (direction * -1) as -1 | 1,
          startTime: endTime,
          behind: item.behind,
        });
        reversedHere = true;
      }
    }

    queue.push(...children);

    // NODE RULE: a node marks a fork, a meaningful termination, or a real
    // change of direction. Nothing decorative, nothing floating mid-run.
    const isJunction = children.length > 1;
    const isTermination = children.length === 0;
    const isTurn = !isJunction && !isTermination && (turnedHere || reversedHere);
    if (isJunction || isTermination || isTurn) {
      nodes.push({
        id: `n-${item.id}`,
        branchId: item.id,
        x: Math.round(tip.x * 100) / 100,
        y: Math.round(tip.y * 100) / 100,
        r:
          Math.round(
            cfg.baseWidth *
              (isJunction ? range(rng, 2.1, 3) : isTurn ? range(rng, 1.5, 2.1) : range(rng, 1.2, 1.9)) *
              100,
          ) / 100,
        depth: item.rank,
        kind: isJunction || isTurn ? "junction" : "tip",
        ring: isJunction && chance(rng, 0.3),
        hollow: isTermination && chance(rng, 0.5),
        opacity: isJunction ? range(rng, 0.8, 1) : range(rng, 0.55, 0.85),
        behind: item.behind,
        appearAt: endTime,
      });
    }
  }

  /* ---- normalise the growth timeline to 0..1 ---- */
  const span = Math.max(
    ...rawStart.map((s, i) => s + rawDuration[i]),
    ...nodes.map((n) => n.appearAt),
    1,
  );
  branches.forEach((b, i) => {
    b.growthStart = Math.round((rawStart[i] / span) * 1000) / 1000;
    b.growthDuration = Math.round((rawDuration[i] / span) * 1000) / 1000;
  });
  nodes.forEach((n) => {
    n.appearAt = Math.round(Math.min(1, n.appearAt / span) * 1000) / 1000;
  });

  return {
    width: cfg.width,
    height: cfg.height,
    seedPoint: { x: cfg.width / 2, y: 0 },
    branches,
    nodes,
    // Section two's network is purely organic: paths, junctions and the
    // connections between them. No dot fields, no decorative texture.
    halftone: [],
    descenders: [],
  };
}

/** Lineage root of a segment id, for cross-lineage connection tests. */
export function segmentLineage(id: string): string {
  return id.split("-")[0];
}
