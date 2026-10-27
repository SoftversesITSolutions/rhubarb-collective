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
  /**
   * Below this fraction of the field height a trunk continues BEHIND the copy
   * (keep-outs ignored), so a full-width block at the foot cannot stall it
   * short of the seam (round 3: the narrow Journal's trunk stopped above its
   * taxonomy list, and Contact opened on a strand from nowhere).
   */
  behindBelow?: number;
  /**
   * A trunk whose run ends inside the bottom margin band — past the margin
   * line, short of the foot — drops on through the foot instead of stopping
   * there, so it crosses the seam rather than dying a few px above it (round 3:
   * measured 16px short at 390 in Proof, and Journal opened on a strand from
   * nowhere). Opt-in, so the sections above The Turn grow exactly as before.
   */
  finishInMargin?: boolean;
  /**
   * Calm growth (round 3, see lib/network/calm): a run is steered to keep
   * `spacing` from strands already grown and may not cross one. An offshoot
   * that cannot get past ends where it is; a trunk always goes on, crossing
   * only when no turn would avoid it, so every seam still connects. Absent,
   * growth is exactly as before.
   */
  avoid?: {
    spacing: number;
    /** How hard a run is pushed off strands within `spacing`; 0 for none. */
    push: number;
  };
}

/** Every grown span, filed by grid cell, for the calm-growth checks. */
interface Grown {
  cell: number;
  grid: Map<string, number[][]>;
}

function fileSpans(grown: Grown, points: Point[]): void {
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const span = [a.x, a.y, b.x, b.y];
    const x0 = Math.floor(Math.min(a.x, b.x) / grown.cell);
    const x1 = Math.floor(Math.max(a.x, b.x) / grown.cell);
    const y0 = Math.floor(Math.min(a.y, b.y) / grown.cell);
    const y1 = Math.floor(Math.max(a.y, b.y) / grown.cell);
    for (let gx = x0; gx <= x1; gx += 1) {
      for (let gy = y0; gy <= y1; gy += 1) {
        const key = `${gx},${gy}`;
        const list = grown.grid.get(key);
        if (list) list.push(span);
        else grown.grid.set(key, [span]);
      }
    }
  }
}

function spansNear(grown: Grown, p: Point, r: number): number[][] {
  const out = new Set<number[]>();
  const reach = Math.ceil(r / grown.cell);
  const gx = Math.floor(p.x / grown.cell);
  const gy = Math.floor(p.y / grown.cell);
  for (let dx = -reach; dx <= reach; dx += 1) {
    for (let dy = -reach; dy <= reach; dy += 1) {
      grown.grid.get(`${gx + dx},${gy + dy}`)?.forEach((span) => out.add(span));
    }
  }
  return [...out];
}

/** Whether p→q crosses a span strictly inside both (touching ends is a junction). */
function crosses(p: Point, q: Point, spans: number[][]): boolean {
  for (const [x3, y3, x4, y4] of spans) {
    const d = (q.x - p.x) * (y4 - y3) - (q.y - p.y) * (x4 - x3);
    if (Math.abs(d) < 1e-9) continue;
    const t = ((x3 - p.x) * (y4 - y3) - (y3 - p.y) * (x4 - x3)) / d;
    const u = ((x3 - p.x) * (q.y - p.y) - (y3 - p.y) * (q.x - p.x)) / d;
    if (t > 1e-3 && t < 1 - 1e-3 && u > 1e-3 && u < 1 - 1e-3) return true;
  }
  return false;
}

/** Nearest point of a span to p. */
function closestOn([x1, y1, x2, y2]: number[], p: Point): Point {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / len));
  return { x: x1 + dx * t, y: y1 + dy * t };
}

/**
 * A trunk lineage's own vertical band (calm growth). Every run is lateral,
 * so two trunks sharing the full width cross each other at every stage —
 * measured, trunk-on-trunk crossings were nearly all that the no-crossing
 * rule left. Each lineage, offshoots included, keeps to its band instead.
 */
interface Lane {
  lo: number;
  hi: number;
}

/** Turns a trunk tries, smallest first, when a step would cross a grown strand. */
const DEFLECTIONS = [0.3, -0.3, 0.6, -0.6];

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
  /** An offshoot stopped by a grown strand (calm growth): it ends here. */
  blocked?: boolean;
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
  grown: Grown | null = null,
  isTrunk = true,
  lane: Lane | null = null,
): Walk {
  const points: Point[] = [start];
  const headings: number[] = [heading];
  const zones = ignoreKeepOut ? [] : cfg.keepOut;
  let p = start;
  let a = heading;
  let escapedSide = false;
  let escapedFoot = false;
  let blocked = false;
  // A run held to its lane only once it is in it: an entry that arrives
  // outside its lane travels there first.
  let inLane = lane !== null && start.x >= lane.lo && start.x <= lane.hi;

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
    // The pull grows as the wall gets closer (round 3): strands now have to
    // turn ON the canvas, so the turn has to begin in good time.
    // The walls are the lane's, once the run is in it (calm growth).
    if (lane && !inLane && p.x >= lane.lo && p.x <= lane.hi) inLane = true;
    const left = lane && inLane ? lane.lo : 0;
    const right = lane && inLane ? lane.hi : cfg.width;
    const rail = Math.min(cfg.margin * 3, (right - left) / 4);
    const goingRight = Math.cos(a) > 0;
    const near = (gap: number) => 0.22 + 0.45 * Math.max(0, 1 - gap / rail) ** 2;
    if (p.x - left < rail && !goingRight) a += angleDelta(a, 0.3) * near(p.x - left);
    if (right - p.x < rail && goingRight) a += angleDelta(a, Math.PI - 0.3) * near(right - p.x);

    // Calm growth: keep room from what has already grown. Not at the very
    // start of a run, which leaves a junction those strands also meet at.
    const spacing = cfg.avoid?.spacing ?? 0;
    const nearby =
      grown && cfg.avoid?.push && Math.hypot(p.x - start.x, p.y - start.y) > spacing * 1.5
        ? spansNear(grown, p, spacing)
        : [];
    if (nearby.length) {
      let px = 0;
      let py = 0;
      for (const span of nearby) {
        const q = closestOn(span, p);
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 1e-6 || d >= spacing) continue;
        const w = 1 - d / spacing;
        px += ((p.x - q.x) / d) * w;
        py += ((p.y - q.y) / d) * w;
      }
      if (px !== 0 || py !== 0) {
        const k = cfg.avoid?.push ?? 0;
        a = Math.atan2(Math.sin(a) + py * k, Math.cos(a) + px * k);
      }
    }

    const len = cfg.stepLength * range(rng, 0.85, 1.15);
    let next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };

    // …and never cross it. An offshoot ends here; a trunk takes the
    // smallest gentle turn that clears, or crosses once rather than stop.
    if (grown) {
      const spans = spansNear(grown, p, len + 2);
      if (spans.length && crosses(p, next, spans)) {
        // An offshoot simply ends: weaving one round an obstacle is exactly
        // the wandering the client asked to lose.
        // A trunk only takes a gentle turn that still heads down the field:
        // hard turns sent trunks climbing back up into loops, which read far
        // busier than the one clean crossing they avoided.
        const turn = !isTrunk ? undefined : DEFLECTIONS.find((da) => {
          const b = a + da;
          const q = { x: p.x + Math.cos(b) * len, y: p.y + Math.sin(b) * len };
          return (
            Math.sin(b) > 0.05 && q.x > 0 && q.x < cfg.width && !crosses(p, q, spans)
          );
        });
        if (turn !== undefined) {
          a += turn;
          next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };
        } else if (!isTrunk) {
          blocked = true;
          break;
        }
      }
    }

    if (next.y > foot) {
      escapedFoot = true;
      break;
    }
    // Inside the canvas, not past it (round 3). The walk used to be allowed a
    // margin beyond each side wall and above the head; the section clips
    // there, so the strand vanished off the edge, its continuation started
    // out of sight, and the reader saw two loose pieces where there was one
    // strand. A step that would leave is mirrored back in and the run goes
    // on — breaking off instead cost the trunk its descent, and on the
    // narrow tier Work's trunks then never reached their foot at all.
    const wall = cfg.margin * 0.25;
    if (next.x < left + wall || next.x > right - wall) {
      a = Math.PI - a;
      next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };
    }
    if (next.y < wall) {
      a = -a;
      next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };
    }
    if (next.x < left + wall || next.x > right - wall || next.y < wall) {
      escapedSide = true;
      break;
    }

    p = next;
    points.push(p);
    headings.push(a);
  }

  return { points, headings, escapedSide, escapedFoot, blocked };
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

  // Lanes in the order the entries arrive, so no two need to pass each
  // other on the way into theirs; equal widths, a little apart.
  const lanes = new Map<string, Lane>();
  if (cfg.avoid && cfg.inlets.length > 1) {
    const order = cfg.inlets
      .map((inlet, i) => ({ x: inlet.x, lineage: `t${i}` }))
      .sort((a, b) => a.x - b.x);
    const share = cfg.width / order.length;
    const apart = cfg.avoid.spacing / 2;
    order.forEach(({ lineage }, k) => {
      lanes.set(lineage, {
        lo: k === 0 ? 0 : k * share + apart,
        hi: k === order.length - 1 ? cfg.width : (k + 1) * share - apart,
      });
    });
  }

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
    let lean = cornered ? inward : inlet.lean;
    // An entry outside its lane (calm growth) opens toward it.
    const lane = lanes.get(`t${i}`);
    if (lane && inlet.x * cfg.width > lane.hi) lean = -1;
    else if (lane && inlet.x * cfg.width < lane.lo) lean = 1;
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
  const grown: Grown | null = cfg.avoid ? { cell: 32, grid: new Map() } : null;

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
      grown,
      isTrunk,
      lanes.get(item.lineage) ?? null,
    );
    // A lane is a preference, not a cage: a trunk whose run made no
    // headway down the field — boxed in by copy inside its band — is let
    // out of it for good, rather than ping-ponging between the walls.
    if (
      isTrunk &&
      lanes.has(item.lineage) &&
      (walk.points.length < 4 ||
        walk.points[walk.points.length - 1].y - item.start.y < cfg.stepLength)
    ) {
      lanes.delete(item.lineage);
    }

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

    // A trunk that stops inside the bottom margin band can never continue
    // (the band is where runs are turned level), so with `finishInMargin` it
    // drops on through the foot instead: a few straight steps, steepening
    // from its own heading, and no randomness, so nothing else in the field
    // changes. It then ends like any trunk that crossed.
    if (
      cfg.finishInMargin &&
      isTrunk &&
      !walk.escapedFoot &&
      walk.points[walk.points.length - 1].y >= cfg.height - cfg.margin
    ) {
      let p = walk.points[walk.points.length - 1];
      let a = walk.headings[walk.headings.length - 1];
      const down = lateralTarget(Math.cos(a) >= 0 ? 1 : -1, 1.25);
      while (p.y <= cfg.height + cfg.margin) {
        a += angleDelta(a, down) * 0.5;
        p = { x: p.x + Math.cos(a) * cfg.stepLength, y: p.y + Math.sin(a) * cfg.stepLength };
        walk.points.push(p);
        walk.headings.push(a);
      }
      walk.escapedFoot = true;
    }

    if (grown) fileSpans(grown, walk.points);

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
        : !walk.blocked && item.rank < 2 && chance(rng, cfg.offshootForkChance));

    const children: Segment[] = [];
    let reversedHere = false;
    let turnedHere = false;

    if (continues) {
      // Reverse when the field edge is close, so the structure turns back into
      // the composition instead of grinding along the margin.
      const lane = lanes.get(item.lineage);
      const lo = lane?.lo ?? 0;
      const hi = lane?.hi ?? cfg.width;
      const nearRight = tip.x > lo + (hi - lo) * 0.82;
      const nearLeft = tip.x < lo + (hi - lo) * 0.18;
      let direction = item.direction;
      if (lane && tip.x > hi) direction = -1;
      else if (lane && tip.x < lo) direction = 1;
      else if (walk.escapedSide) direction = (item.direction * -1) as -1 | 1;
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
        behind:
          item.behind ||
          (isTrunk && cfg.behindBelow !== undefined && tip.y > cfg.height * cfg.behindBelow),
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
