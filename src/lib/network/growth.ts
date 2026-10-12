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
const FINISH = 0.985;

export interface Schedule {
  /** Timeline position (0..1) at which each sample along the strand is reached. */
  times: number[];
  /** The sampled points, in the SVG's user units. */
  points: { x: number; y: number }[];
}

/**
 * When the line reaches each point of a strand. `timeOf` maps a depth in the
 * SVG's user units to a timeline position; the result is made monotonic, so a
 * strand that turns level or climbs keeps drawing forward rather than waiting
 * or running backwards. `perUnit` is how much timeline one user unit of scroll
 * is worth, which is what a level run is paced by.
 */
function scheduleOf(
  path: SVGPathElement,
  timeOf: (y: number) => number,
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
    const at = Math.min(1, Math.max(0, timeOf(p.y)));
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
  timeOf: (y: number) => number,
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
  const schedules = new Map<SVGPathElement, Schedule>();
  const draw = (path: SVGPathElement) => {
    const schedule = drawStrand(tl, path, timeOf, 1 / height);
    if (schedule) schedules.set(path, schedule);
  };

  strands.forEach(draw);
  reaches.forEach(draw);

  const appear = (el: SVGGElement, at: number) => {
    tl.to(
      el,
      { opacity: 1, scale: 1, duration: 0.03, ease: "power2.out" },
      Math.min(0.97, Math.max(0, at)),
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

  junctions.forEach((junction) => {
    const centre = centreOf(junction);
    appear(junction, centre ? timeOf(centre.y) - 0.01 : 0);
  });

  // And once grown, the primaries keep moving at rest.
  enliven(root, strands);

  return tl;
}
