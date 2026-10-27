/**
 * THE GROWTH LINE
 * ===============
 *
 * One rule for how every section's network draws: there is a single line
 * across the viewport, and the mycelium grows as that line passes over it.
 * Above the line the network is grown, below it nothing is drawn yet.
 *
 * Each section used to spread its strands over its own scroll pass in the
 * generator's order. That is scroll-driven on paper, but it puts the growing
 * tips wherever the ordering happens to — measured (Oct 2026) at 1.1–1.8
 * viewport heights down, i.e. below the screen, so everything the reader
 * actually saw had already finished drawing. Timing a strand from where it
 * *is* instead keeps its tip on the line, in view, at every scroll position —
 * and because every section shares the same line, a strand that leaves one
 * section's foot is picked up by the next section's inlet at the same instant.
 * The seam needs no hand-off logic of its own.
 *
 * Everything is one scrubbed timeline per section, so it unwinds exactly as it
 * grew when the reader scrolls back up.
 */

import gsap from "gsap";
import { enliven } from "./life";

/** Where the line sits, as a fraction of the viewport height from the top. */
export const GROWTH_LINE = 0.68;

/** Samples taken along each strand to follow its descent. */
const SAMPLES = 10;
/**
 * A strand running level or back upward has no descent to follow, so it is
 * given scroll in proportion to its length instead: this fraction of the
 * distance it covers. Below 1 so lateral runs keep up with the line.
 */
const LATERAL_PACE = 0.5;
/** The latest timeline position any strand may finish at. */
export const FINISH = 0.985;

export interface Schedule {
  /** Timeline position (0..1) at which each sample along the strand is reached. */
  times: number[];
  /** The sampled points, in the SVG's user units. */
  points: { x: number; y: number }[];
}

/**
 * A point's timeline position. Most sections only need its depth; one that
 * moves sideways (The Turn) also reads where along the field it lies, and
 * which strand it is on.
 */
export type TimeOf = (y: number, x: number, path: SVGPathElement) => number;

/**
 * When the line reaches each point of a strand. `timeOf` maps a depth in the
 * SVG's user units to a timeline position; the result is made monotonic, so a
 * strand that turns level or climbs keeps drawing forward rather than waiting
 * or running backwards. `perUnit` is how much timeline one user unit of scroll
 * is worth, which is what a level run is paced by.
 */
function scheduleOf(
  path: SVGPathElement,
  timeOf: TimeOf,
  perUnit: number,
): Schedule | null {
  let length = 0;
  try {
    length = path.getTotalLength();
  } catch {
    return null;
  }
  if (!length) return null;

  const minStep = (length / SAMPLES) * perUnit * LATERAL_PACE;
  const times: number[] = [];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const p = path.getPointAtLength((length * i) / SAMPLES);
    points.push({ x: p.x, y: p.y });
    const at = Math.min(1, Math.max(0, timeOf(p.y, p.x, path)));
    times.push(i === 0 ? at : Math.max(times[i - 1] + minStep, at));
  }
  // A strand that would run past the end of the pass is squeezed to finish on it.
  // (a little short of it: a scrubbed timeline only approaches its very end).
  const over = times[SAMPLES];
  if (over > FINISH) {
    const start = Math.min(times[0], FINISH - 0.02);
    const scale = (FINISH - start) / (over - start);
    for (let i = 0; i <= SAMPLES; i++) times[i] = start + (times[i] - start) * scale;
  }
  return { times, points };
}

/** Drawn fraction of a strand as a function of its tween's linear progress. */
function easeOf({ times }: Schedule): (p: number) => number {
  const t0 = times[0];
  const span = times[SAMPLES] - t0;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    const t = t0 + p * span;
    let i = 1;
    while (i < SAMPLES && times[i] < t) i++;
    const a = times[i - 1];
    const b = times[i];
    return (i - 1 + (b > a ? (t - a) / (b - a) : 1)) / SAMPLES;
  };
}

/**
 * Draw one strand on a scrubbed timeline so its tip rides the growth line.
 * Returns the schedule, for timing whatever sits on the strand.
 */
export function drawStrand(
  tl: gsap.core.Timeline,
  path: SVGPathElement,
  timeOf: TimeOf,
  perUnit: number,
): Schedule | null {
  const schedule = scheduleOf(path, timeOf, perUnit);
  if (!schedule) {
    tl.to(path, { strokeDashoffset: 0, duration: 0.05 }, 0);
    return null;
  }
  const { times } = schedule;
  tl.to(
    path,
    {
      strokeDashoffset: 0,
      duration: Math.max(0.001, times[SAMPLES] - times[0]),
      ease: easeOf(schedule),
    },
    times[0],
  );
  return schedule;
}

/**
 * Every strand sampled ONCE, about every 2 units (from its path data — see
 * `samplePath`), and filed in a coarse grid,
 * so "which strand passes through this point" is a lookup, not a walk along
 * every other path. The first version walked every path per strand with
 * `getPointAtLength` and froze the main thread for 4–5s at load, which held
 * the hero's logo wipe back from ~1s to 5–8s.
 */
interface StrandIndex {
  cell: number;
  grid: Map<string, { schedule: Schedule; x: number; y: number; along: number; fraction: number }[]>;
  lengths: Map<Schedule, number>;
}

const indexCache = new WeakMap<Map<SVGPathElement, Schedule>, StrandIndex>();

/**
 * Points every ~`step` units along a path, computed from its own path data.
 * Every network on the page writes paths as one M then cubic C segments, and
 * evaluating those directly is orders of magnitude cheaper than
 * `getPointAtLength`, which re-walks the path on each call — sampling with it
 * cost 1.7s at load. Anything else falls back to the DOM.
 */
function samplePath(path: SVGPathElement, step: number): { x: number; y: number; along: number }[] {
  const d = path.getAttribute("d") ?? "";
  if (/^\s*M[\d\s.,eE+-]*(C[\d\s.,eE+-]*)*$/.test(d)) {
    const parts = d.match(/[MC][^MC]*/g) ?? [];
    const out: { x: number; y: number; along: number }[] = [];
    let x = 0;
    let y = 0;
    let along = 0;
    for (const part of parts) {
      const n = part.slice(1).trim().split(/[\s,]+/).map(Number);
      if (part[0] === "M") {
        [x, y] = n;
        out.push({ x, y, along: 0 });
        continue;
      }
      for (let k = 0; k + 5 < n.length; k += 6) {
        const [x1, y1, x2, y2, x3, y3] = n.slice(k, k + 6);
        const hull = Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2);
        const steps = Math.max(2, Math.ceil(hull / step));
        let px = x;
        let py = y;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const u = 1 - t;
          const qx = u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
          const qy = u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
          along += Math.hypot(qx - px, qy - py);
          out.push({ x: qx, y: qy, along });
          px = qx;
          py = qy;
        }
        x = x3;
        y = y3;
      }
    }
    if (out.length > 1) return out;
  }
  let length = 0;
  try {
    length = path.getTotalLength();
  } catch {
    return [];
  }
  const steps = Math.max(8, Math.ceil(length / step));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const q = path.getPointAtLength((length * i) / steps);
    return { x: q.x, y: q.y, along: (length * i) / steps };
  });
}

function indexOf(schedules: Map<SVGPathElement, Schedule>): StrandIndex {
  const cached = indexCache.get(schedules);
  if (cached) return cached;
  const cell = 16;
  const grid: StrandIndex["grid"] = new Map();
  const lengths = new Map<Schedule, number>();
  schedules.forEach((schedule, path) => {
    const samples = samplePath(path, 2);
    const length = samples[samples.length - 1]?.along ?? 0;
    if (!length) return;
    lengths.set(schedule, length);
    for (const q of samples) {
      const key = `${Math.floor(q.x / cell)},${Math.floor(q.y / cell)}`;
      let bucket = grid.get(key);
      if (!bucket) grid.set(key, (bucket = []));
      bucket.push({ schedule, x: q.x, y: q.y, along: q.along, fraction: q.along / length });
    }
  });
  const index = { cell, grid, lengths };
  indexCache.set(schedules, index);
  return index;
}

/** Every sample of every strand within `r` of a point. */
function samplesNear(index: StrandIndex, x: number, y: number, r: number) {
  const out: { schedule: Schedule; d: number; along: number; fraction: number }[] = [];
  const { cell, grid } = index;
  const reach = Math.ceil(r / cell);
  const gx = Math.floor(x / cell);
  const gy = Math.floor(y / cell);
  for (let dx = -reach; dx <= reach; dx++) {
    for (let dy = -reach; dy <= reach; dy++) {
      const bucket = grid.get(`${gx + dx},${gy + dy}`);
      if (!bucket) continue;
      for (const s of bucket) {
        const d = Math.hypot(s.x - x, s.y - y);
        if (d <= r) out.push({ schedule: s.schedule, d, along: s.along, fraction: s.fraction });
      }
    }
  }
  return out;
}

/** When the line reaches a strand's point at `fraction` of its length. */
function timeAt({ times }: Schedule, fraction: number): number {
  const f = fraction * SAMPLES;
  const i = Math.min(SAMPLES - 1, Math.floor(f));
  return times[i] + (times[i + 1] - times[i]) * (f - i);
}

/**
 * A strand may not start drawing before the strand it grows from has reached
 * the point it leaves from (round 3).
 *
 * Depth alone used to time every strand, and a strand that leaves the end of
 * a CLIMBING run starts higher up the page than that run finishes — so it was
 * drawn first and hung in the air until its parent caught up. Measured mid-
 * scroll, in The Collective, Proof and Contact, at up to ~50px from any
 * drawn line.
 *
 * The parent is found geometrically, so this works for every section's
 * renderer: the strand whose path passes through this one's start point.
 * Passes repeat until nothing moves, so a delay carries down a whole lineage.
 */
function orderByLineage(
  schedules: Map<SVGPathElement, Schedule>,
  perUnit: number,
): void {
  const index = indexOf(schedules);
  const entries = [...schedules.values()].map((schedule) => ({
    schedule,
    length: index.lengths.get(schedule) ?? 0,
  }));
  // A fork's two strands start at the SAME point, so another strand's own
  // start never counts as a parent — siblings would otherwise vouch for each
  // other and both draw before the strand they fork from arrives. Ties go to
  // the later point, so a strand leaving another's end is timed from its end.
  const TOUCH = 2.5;
  const attach = new Map<Schedule, { parent: Schedule; fraction: number } | null>();
  for (const child of entries) {
    const start = child.schedule.points[0];
    let best: { parent: Schedule; fraction: number } | null = null;
    let bestD = TOUCH;
    let bestF = -1;
    for (const s of samplesNear(index, start.x, start.y, TOUCH)) {
      if (s.schedule === child.schedule || s.along < TOUCH * 2) continue;
      if (s.d < bestD - 1e-6 || (s.d <= bestD && s.fraction > bestF)) {
        bestD = s.d;
        bestF = s.fraction;
        best = { parent: s.schedule, fraction: s.fraction };
      }
    }
    attach.set(child.schedule, best);
  }

  // Until nothing moves: a trunk is a chain of dozens of segments, and a delay
  // has to carry all the way down it. Each pass only ever moves strands later,
  // so this ends; the cap is a guard, not a budget.
  for (let pass = 0; pass <= entries.length; pass++) {
    let moved = false;
    for (const child of entries) {
      const link = attach.get(child.schedule);
      if (!link) continue;
      const ready = timeAt(link.parent, link.fraction);
      const { times } = child.schedule;
      if (times[0] >= ready - 1e-4) continue;
      const minStep = (child.length / SAMPLES) * perUnit * LATERAL_PACE;
      times[0] = ready;
      for (let i = 1; i <= SAMPLES; i++) times[i] = Math.max(times[i], times[i - 1] + minStep);
      // Squeezed to finish on the pass, as in `scheduleOf` — but never by
      // moving the start earlier than the parent's arrival, or near the foot
      // the squeeze undid the wait.
      const over = times[SAMPLES];
      if (over > FINISH) {
        const start = Math.min(times[0], FINISH - 0.001);
        const scale = (FINISH - start) / (over - start);
        for (let i = 0; i <= SAMPLES; i++) times[i] = start + (times[i] - start) * scale;
      }
      moved = true;
    }
    if (!moved) break;
  }
}

/**
 * Draw a whole network: every strand rides the growth line, and none starts
 * before the strand it grows from reaches it. Returns the schedules, for
 * timing whatever sits on the strands.
 */
export function drawStrands(
  tl: gsap.core.Timeline,
  paths: SVGPathElement[],
  timeOf: TimeOf,
  perUnit: number,
): Map<SVGPathElement, Schedule> {
  const schedules = new Map<SVGPathElement, Schedule>();
  for (const path of paths) {
    const schedule = scheduleOf(path, timeOf, perUnit);
    if (schedule) schedules.set(path, schedule);
    else tl.to(path, { strokeDashoffset: 0, duration: 0.05 }, 0);
  }
  orderByLineage(schedules, perUnit);
  schedules.forEach((schedule, path) => {
    const { times } = schedule;
    tl.to(
      path,
      {
        strokeDashoffset: 0,
        duration: Math.max(0.001, times[SAMPLES] - times[0]),
        ease: easeOf(schedule),
      },
      times[0],
    );
  });
  return schedules;
}

/** When the line reaches the sample of a strand nearest to a point. */
export function timeNear({ times, points }: Schedule, x: number, y: number): number {
  let best = 0;
  let bestD = Infinity;
  points.forEach((p, i) => {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return times[best];
}

/** Centre of an SVG element in user units, ignoring its own transform. */
export function centreOf(el: SVGGraphicsElement): { x: number; y: number } | null {
  try {
    const b = el.getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  } catch {
    return null;
  }
}

export interface GrowNetworkOptions {
  /** The section. Its network SVG must cover it exactly (viewBox = its pixel box). */
  root: HTMLElement;
  /** The strands, drawn by stroke-dashoffset. */
  strands: SVGPathElement[];
  /** Short dashed-in reaches from a strand to a piece of content. */
  reaches?: SVGPathElement[];
  /** Node marks, each a sibling of the strand it sits on. */
  marks?: SVGGElement[];
  /** Free-standing meeting points. */
  junctions?: SVGGElement[];
  /**
   * The page's last section cannot scroll its foot up to the line, so its pass
   * closes on the document's end instead.
   */
  last?: boolean;
}

/**
 * Grow a section's network along the shared growth line. Call inside the
 * section's `gsap.context`; initial hidden states of marks and junctions stay
 * with the caller.
 */
export function growNetwork({
  root,
  strands,
  reaches = [],
  marks = [],
  junctions = [],
  last = false,
}: GrowNetworkOptions): gsap.core.Timeline {
  const line = `${GROWTH_LINE * 100}%`;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: `top ${line}`,
      end: last ? "bottom bottom" : `bottom ${line}`,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  tl.to({}, { duration: 1 }, 0);

  const height = strands[0]?.ownerSVGElement?.viewBox.baseVal.height || 1;
  // Time is simply depth: a point `y` units down a field `height` tall is
  // reached at `y / height`.
  const timeOf = (y: number) => y / height;
  const schedules = drawStrands(tl, [...strands, ...reaches], timeOf, 1 / height);

  // Capped at FINISH like the strands, not at an earlier fixed point: strands
  // near the foot can start late now that they wait for their parents, and a
  // node capped before its strand began appeared at the end of nothing. The
  // pop is shortened instead, so it still ends inside the pass.
  const appear = (el: SVGGElement, at: number) => {
    const start = Math.min(FINISH, Math.max(0, at));
    tl.to(
      el,
      { opacity: 1, scale: 1, duration: Math.max(0.005, Math.min(0.03, 1 - start)), ease: "power2.out" },
      start,
    );
  };

  // A node appears as its strand's tip arrives at it, never before.
  marks.forEach((mark) => {
    const centre = centreOf(mark);
    const path = mark.parentElement?.querySelector<SVGPathElement>("path");
    const schedule = path ? schedules.get(path) : undefined;
    if (schedule && centre) appear(mark, timeNear(schedule, centre.x, centre.y));
    else appear(mark, centre ? timeOf(centre.y) : 0);
  });

  // A meeting point appears when the first strand actually reaches it. Depth
  // alone was a fine guess until strands began waiting for their parents
  // (`orderByLineage`); then a junction could show before any line arrived.
  junctions.forEach((junction) => {
    const centre = centreOf(junction);
    if (!centre) return appear(junction, 0);
    let first = Infinity;
    for (const hit of samplesNear(indexOf(schedules), centre.x, centre.y, 4)) {
      first = Math.min(first, timeAt(hit.schedule, hit.fraction));
    }
    appear(junction, Number.isFinite(first) ? first : timeOf(centre.y) - 0.01);
  });

  // And once grown, the primaries keep moving at rest.
  enliven(root, strands);

  return tl;
}
