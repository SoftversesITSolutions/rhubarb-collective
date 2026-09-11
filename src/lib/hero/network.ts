/**
 * PROCEDURAL ORGANIC NETWORK
 * ==========================
 *
 * Generates the mycelial system that carries the Rhubarb hero. Everything is
 * produced from a single integer seed, so a given configuration always yields
 * the identical composition (no per-load reshuffling, no hydration drift).
 *
 * HOW IT GROWS  (read this before art-directing)
 * ---------------------------------------------
 * 1. A seed point sits deliberately off-centre in a normalised field.
 * 2. A small number of *primary* branches leave the seed. Each one is given an
 *    explicit launch angle and a `tropism` — the heading it keeps trying to
 *    return to. Tropism is what makes growth read as LATERAL rather than
 *    radial: hyphae creep sideways across a substrate, they do not radiate
 *    evenly like a firework or a spider web.
 * 3. A branch is grown one step at a time. Each step the heading is perturbed
 *    by four forces, in order of authority:
 *      a. wander      — small random curl, the source of irregularity
 *      b. tropism     — restoring pull back toward the branch's target heading
 *      c. repulsion   — steering away from the typography keep-out zones
 *      d. containment — soft pressure back inside the field margins
 *    Step length decays with depth, so tertiary growth is visibly finer.
 * 4. While walking, a branch may spawn children. Spawn probability is zero near
 *    the base (branches do not fork immediately), peaks around mid-length, and
 *    falls off near the tip. Children inherit a rotated tropism, so each
 *    generation fans outward without ever becoming a symmetric fractal.
 * 5. The resulting polyline is converted to a smooth Catmull-Rom cubic path.
 *    The curvature is therefore a property of the walk, not a decoration.
 *
 * HOW IT ANIMATES
 * ---------------
 * Every branch carries `growthStart` / `growthDuration`, normalised to 0..1
 * across the whole system. A child's start time is the moment the parent's tip
 * physically reaches the junction — so growth genuinely propagates outward from
 * the seed instead of being a staggered fade. Nodes inherit the timing of the
 * junction or tip they belong to. `length` is measured here so the animation
 * layer never has to call getTotalLength() on the DOM.
 */

import { bell, chance, createRng, pick, range, sign, type Rng } from "./random";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A typography zone the network reacts to. */
export interface KeepOut extends Rect {
  /** Distance (field units) over which the zone deflects growth. */
  influence: number;
  /** 0..1 — how hard growth is pushed away. */
  strength: number;
}

export interface PrimarySeed {
  /** Launch heading in radians (0 = right, negative = up). */
  angle: number;
  /** Heading the branch keeps returning to. Drives lateral character. */
  tropism: number;
  /** Multiplier on the branch's step budget. */
  lengthScale: number;
  /** 0..1 position along the germ stem this branch leaves from. */
  at: number;
  /** When true this branch ignores keep-out zones and runs *behind* the type. */
  behind?: boolean;
}

export interface NetworkConfig {
  seed: number;
  /** Field size — also the SVG viewBox. */
  width: number;
  height: number;
  /** Seed position, normalised 0..1 within the field. */
  origin: Point;
  /**
   * The germ stem: a single short filament that leaves the seed before
   * anything else. Primaries launch from points along it, which is what keeps
   * the origin from reading as a starburst.
   */
  stemAngle: number;
  stemSteps: number;
  /** Explicit art direction for the branches leaving the stem. */
  primaries: readonly PrimarySeed[];
  maxDepth: number;
  /** Hard ceiling on branch count, protects the DOM budget. */
  branchBudget: number;
  /** Steps in a depth-0 branch before scaling. */
  baseSteps: number;
  /** Field units advanced per step at depth 0. */
  stepLength: number;
  /** Radians of random wander per step. */
  curl: number;
  /** 0..1 restoring force toward the branch tropism. */
  tropismStrength: number;
  /** Global multiplier on child spawn probability. */
  density: number;
  /** Max angular offset of a child from its parent, radians. */
  spread: number;
  /**
   * How much of the parent's step budget a child inherits. Raising this on the
   * smaller tiers keeps a sparse network from collapsing into stubs.
   */
  childLengthRange: readonly [number, number];
  /** Stroke width of a depth-0 branch. */
  baseWidth: number;
  /** Chance a junction or tip carries a visible node. */
  nodeProbability: number;
  /** Chance a node gets a surrounding ring. */
  ringProbability: number;
  /** Number of halftone accent clusters. */
  halftoneClusters: number;
  /** Keep-out zones reserved for typography. */
  keepOut: readonly KeepOut[];
  /** Field-unit inset the growth is contained within. */
  margin: number;
}

export interface Branch {
  id: string;
  parentId: string | null;
  depth: number;
  /** Smoothed cubic path data. */
  d: string;
  /** Measured path length, used for stroke-dasharray growth. */
  length: number;
  width: number;
  opacity: number;
  /** True when the branch is drawn beneath the typography layer. */
  behind: boolean;
  /** 0..1 position in the normalised growth timeline. */
  growthStart: number;
  growthDuration: number;
  /** Tip position — used for halftone and continuation cues. */
  tip: Point;
}

export interface NetworkNode {
  id: string;
  /** Branch this node sits on, so the SVG can nest it inside that group. */
  branchId: string;
  x: number;
  y: number;
  r: number;
  depth: number;
  /** "junction" nodes sit where a branch forks, "tip" nodes end a branch. */
  kind: "junction" | "tip";
  ring: boolean;
  /** Hollow nodes are stroked only — keeps the node family non-uniform. */
  hollow: boolean;
  opacity: number;
  behind: boolean;
  appearAt: number;
}

export interface HalftoneDot {
  x: number;
  y: number;
  r: number;
}

export interface HalftoneCluster {
  id: string;
  dots: HalftoneDot[];
  appearAt: number;
}

/**
 * A strand that leaves the hero through its lower edge. Expressed in a
 * normalised 0..100 square so the boundary band can render it at any height
 * without knowing the network's field proportions.
 */
export interface Descender {
  id: string;
  d: string;
  length: number;
  /**
   * Where the strand crosses the lower edge, 0..100. The next section reads
   * this to place its inlets, which is what makes the seam invisible.
   */
  exitX: number;
  /**
   * Which way the strand was leaning as it left, -1 or 1. The continuation
   * enters on the same lean, so the eye can follow an individual strand across
   * the seam instead of seeing a new line attached to it.
   */
  exitLean: -1 | 1;
}

export interface OrganicNetwork {
  width: number;
  height: number;
  seedPoint: Point;
  branches: Branch[];
  nodes: NetworkNode[];
  halftone: HalftoneCluster[];
  /** Strands continuing past the hero into the next section. */
  descenders: Descender[];
}

/* ------------------------------------------------------------------ *
 * geometry helpers
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;

/** Shortest signed angular distance from `a` to `b`. */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Nearest point on a rect to p (p itself if inside). */
function closestOnRect(p: Point, r: Rect): Point {
  return {
    x: Math.min(Math.max(p.x, r.x), r.x + r.width),
    y: Math.min(Math.max(p.y, r.y), r.y + r.height),
  };
}

/**
 * Steering away from typography. Returns a normalised push vector.
 * Points inside a zone are pushed toward the nearest edge, points near a zone
 * are pushed along the outward normal with a squared falloff — the squared
 * term is what makes branches *curve* around the type instead of kinking.
 */
export function repulsion(p: Point, zones: readonly KeepOut[]): Point {
  let fx = 0;
  let fy = 0;
  for (const z of zones) {
    const c = closestOnRect(p, z);
    const inside =
      p.x > z.x && p.x < z.x + z.width && p.y > z.y && p.y < z.y + z.height;
    let vx = p.x - c.x;
    let vy = p.y - c.y;
    let d = Math.hypot(vx, vy);

    if (inside) {
      // Escape along the shortest axis out of the zone.
      const left = p.x - z.x;
      const right = z.x + z.width - p.x;
      const top = p.y - z.y;
      const bottom = z.y + z.height - p.y;
      const min = Math.min(left, right, top, bottom);
      vx = min === left ? -1 : min === right ? 1 : 0;
      vy = min === top ? -1 : min === bottom ? 1 : 0;
      d = 0;
    } else if (d > 0) {
      vx /= d;
      vy /= d;
    } else {
      continue;
    }

    if (d > z.influence) continue;
    const falloff = inside ? 1 : (1 - d / z.influence) ** 2;
    fx += vx * falloff * z.strength;
    fy += vy * falloff * z.strength;
  }
  return { x: fx, y: fy };
}

/**
 * Catmull-Rom through the walk points, emitted as cubic Béziers.
 * Uses the standard 1/6 tangent so the curve passes through every step point —
 * the organic character comes from the walk, the spline just removes corners.
 */
export function toPath(points: Point[]): string {
  if (points.length < 2) return "";
  const parts: string[] = [`M${round(points[0].x)} ${round(points[0].y)}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    parts.push(
      `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2.x)} ${round(p2.y)}`,
    );
  }
  return parts.join("");
}

/**
 * Polyline length of the walk, padded to safely exceed the spline length.
 * Over-estimating is intentional: stroke-dasharray only needs to be at least
 * as long as the path for the dash-offset reveal to start fully hidden.
 */
export function measure(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += dist(points[i - 1], points[i]);
  return total * 1.06 + 1;
}

/* ------------------------------------------------------------------ *
 * growth
 * ------------------------------------------------------------------ */

interface Walk {
  points: Point[];
  /** Heading at each point, needed to launch children tangentially. */
  headings: number[];
}

function walkBranch(
  rng: Rng,
  cfg: NetworkConfig,
  start: Point,
  angle: number,
  tropism: number,
  depth: number,
  lengthScale: number,
  ignoreKeepOut: boolean,
): Walk {
  const decay = 0.74 ** depth;
  const steps = Math.max(
    3,
    Math.round(cfg.baseSteps * decay * lengthScale * bell(rng, 0.65, 1.35)),
  );
  const step = cfg.stepLength * decay;
  const zones = ignoreKeepOut ? [] : cfg.keepOut;

  const points: Point[] = [start];
  const headings: number[] = [angle];
  let p = start;
  let a = angle;

  for (let i = 0; i < steps; i += 1) {
    // (a) wander — deeper growth wanders more, finer structure is twitchier
    a += (rng() - 0.5) * cfg.curl * (1 + depth * 0.45);

    // (b) tropism — the lateral restoring force
    a += angleDelta(a, tropism) * cfg.tropismStrength;

    // (c) typography repulsion
    const push = repulsion(p, zones);
    if (push.x !== 0 || push.y !== 0) {
      const dx = Math.cos(a) + push.x * 1.9;
      const dy = Math.sin(a) + push.y * 1.9;
      a = Math.atan2(dy, dx);
    }

    // (d) soft containment — steer back toward the field before the edge is hit
    const m = cfg.margin;
    if (p.y < m) a += angleDelta(a, 0.85) * 0.26;
    if (p.y > cfg.height - m) a += angleDelta(a, -0.85) * 0.26;
    // Growth that reaches the right edge climbs it rather than bouncing back,
    // which is what wraps the system up and around the typography.
    if (p.x > cfg.width - m) a += angleDelta(a, -Math.PI * 0.45) * 0.34;
    if (p.x < m) a += angleDelta(a, 0) * 0.36;

    const len = step * range(rng, 0.78, 1.24);
    const next = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };

    // Hard stop rather than clamp — a truncated branch reads as natural.
    if (
      next.x < -m * 0.5 ||
      next.x > cfg.width + m * 0.5 ||
      next.y < -m * 0.5 ||
      next.y > cfg.height + m * 0.5
    ) {
      break;
    }

    p = next;
    points.push(p);
    headings.push(a);
  }

  return { points, headings };
}

/** Spawn probability along a branch: none at the base, peaking mid-length. */
function spawnProbability(cfg: NetworkConfig, depth: number, t: number): number {
  if (t < 0.24) return 0;
  const curve = Math.sin((t - 0.24) / 0.76 * Math.PI) ** 0.8;
  return cfg.density * curve * (0.34 - depth * 0.09);
}

interface Pending {
  id: string;
  parentId: string | null;
  depth: number;
  start: Point;
  angle: number;
  tropism: number;
  lengthScale: number;
  behind: boolean;
  /** Absolute (pre-normalisation) time at which this branch begins growing. */
  startTime: number;
}

export function generateOrganicNetwork(cfg: NetworkConfig): OrganicNetwork {
  const rng = createRng(cfg.seed);
  const seedPoint: Point = {
    x: cfg.origin.x * cfg.width,
    y: cfg.origin.y * cfg.height,
  };

  const branches: Branch[] = [];
  const nodes: NetworkNode[] = [];

  // Timing is accumulated in arbitrary units first, then normalised to 0..1.
  const rawStart: number[] = [];
  const rawDuration: number[] = [];

  /* ---- germ stem ---- */
  // The very first filament. Everything else hangs off it, so growth reads as
  // one organism extending rather than several rays leaving a dot.
  const stemWalk = walkBranch(
    rng,
    cfg,
    seedPoint,
    cfg.stemAngle,
    cfg.stemAngle,
    0,
    (cfg.stemSteps / cfg.baseSteps) * 1.35,
    true,
  );
  const stemLength = measure(stemWalk.points);
  const stemDuration = Math.max(0.5, stemLength / cfg.stepLength) * 0.34;

  branches.push({
    id: "stem",
    parentId: null,
    depth: 0,
    d: toPath(stemWalk.points),
    length: Math.round(stemLength),
    width: round(cfg.baseWidth * 1.15),
    opacity: 0.95,
    behind: false,
    growthStart: 0,
    growthDuration: 0,
    tip: stemWalk.points[stemWalk.points.length - 1],
  });
  rawStart.push(0);
  rawDuration.push(stemDuration);

  /** Point and heading a fraction of the way along the stem. */
  const onStem = (t: number) => {
    const i = Math.min(
      stemWalk.points.length - 1,
      Math.max(1, Math.round(t * (stemWalk.points.length - 1))),
    );
    return { point: stemWalk.points[i], heading: stemWalk.headings[i], t: i / (stemWalk.points.length - 1) };
  };

  const queue: Pending[] = cfg.primaries.map((seed, i) => {
    const at = onStem(seed.at);
    nodes.push({
      id: `n-stem-${i}`,
      branchId: "stem",
      x: round(at.point.x),
      y: round(at.point.y),
      r: round(cfg.baseWidth * range(rng, 1.9, 3.1)),
      depth: 0,
      kind: "junction",
      ring: chance(rng, cfg.ringProbability * 1.6),
      hollow: false,
      opacity: round(range(rng, 0.7, 1)),
      behind: false,
      appearAt: at.t * stemDuration,
    });
    return {
      id: `b${i}`,
      parentId: "stem",
      depth: 0,
      start: at.point,
      angle: at.heading + seed.angle,
      tropism: seed.tropism,
      lengthScale: seed.lengthScale,
      behind: Boolean(seed.behind),
      // A primary starts growing when the stem tip reaches its junction.
      startTime: at.t * stemDuration,
    };
  });

  return grow(rng, cfg, queue, branches, nodes, rawStart, rawDuration, 1, seedPoint);
}

/**
 * The shared growth engine.
 *
 * Both entry modes — a seeded germ stem, or inlets inherited from the section
 * above — converge here, so a continuation is grown by exactly the same rules
 * that grew the original. Timing, branching, nodes, halftone and the outgoing
 * descenders are all produced identically.
 */
function grow(
  rng: Rng,
  cfg: NetworkConfig,
  queue: Pending[],
  branches: Branch[],
  nodes: NetworkNode[],
  rawStart: number[],
  rawDuration: number[],
  createdSoFar: number,
  seedPoint: Point,
): OrganicNetwork {
  let created = createdSoFar;
  let cursor = 0;

  // Breadth-first: the system fills out generation by generation, which keeps
  // the branch budget spent on structure rather than one runaway lineage.
  while (cursor < queue.length && created < cfg.branchBudget) {
    const item = queue[cursor];
    cursor += 1;

    const walk = walkBranch(
      rng,
      cfg,
      item.start,
      item.angle,
      item.tropism,
      item.depth,
      item.lengthScale,
      item.behind,
    );
    if (walk.points.length < 3) continue;

    const length = measure(walk.points);
    // Longer branches take proportionally longer to draw — constant speed
    // growth is the single biggest contributor to the "alive" reading.
    const duration = Math.max(0.6, length / cfg.stepLength) * 0.34;

    const branch: Branch = {
      id: item.id,
      parentId: item.parentId,
      depth: item.depth,
      d: toPath(walk.points),
      length: Math.round(length),
      width: round(cfg.baseWidth * 0.7 ** item.depth * bell(rng, 0.82, 1.2)),
      opacity: round(Math.max(0.22, (0.92 - item.depth * 0.19) * bell(rng, 0.8, 1.12))),
      behind: item.behind,
      growthStart: 0,
      growthDuration: 0,
      tip: walk.points[walk.points.length - 1],
    };
    branches.push(branch);
    rawStart.push(item.startTime);
    rawDuration.push(duration);
    created += 1;

    // --- children -------------------------------------------------------
    if (item.depth < cfg.maxDepth) {
      for (let i = 2; i < walk.points.length - 1; i += 1) {
        const t = i / (walk.points.length - 1);
        if (!chance(rng, spawnProbability(cfg, item.depth, t))) continue;
        if (queue.length >= cfg.branchBudget) break;

        const offset = sign(rng) * range(rng, cfg.spread * 0.35, cfg.spread);
        const childAngle = walk.headings[i] + offset;
        // Children keep a memory of the parent tropism but drift off it, so
        // successive generations spread without repeating the parent shape.
        const childTropism =
          item.tropism + offset * range(rng, 0.35, 0.8) + (rng() - 0.5) * 0.3;

        queue.push({
          id: `${item.id}-${i}`,
          parentId: item.id,
          depth: item.depth + 1,
          start: walk.points[i],
          angle: childAngle,
          tropism: childTropism,
          lengthScale: item.lengthScale * range(rng, ...cfg.childLengthRange),
          behind: item.behind,
          startTime: item.startTime + t * duration,
        });

        // A junction is a real connection point in the system.
        if (chance(rng, cfg.nodeProbability)) {
          nodes.push({
            id: `n-${item.id}-${i}`,
            branchId: item.id,
            x: round(walk.points[i].x),
            y: round(walk.points[i].y),
            r: round(cfg.baseWidth * range(rng, 1.5, 2.9) * 0.82 ** item.depth),
            depth: item.depth,
            kind: "junction",
            ring: chance(rng, cfg.ringProbability),
            hollow: chance(rng, 0.28),
            opacity: round(range(rng, 0.55, 1)),
            behind: item.behind,
            appearAt: item.startTime + t * duration,
          });
        }
      }
    }

    // --- tip node -------------------------------------------------------
    if (chance(rng, cfg.nodeProbability * 0.8)) {
      nodes.push({
        id: `n-${item.id}-tip`,
        branchId: item.id,
        x: round(branch.tip.x),
        y: round(branch.tip.y),
        r: round(cfg.baseWidth * range(rng, 1.1, 2.1) * 0.8 ** item.depth),
        depth: item.depth,
        kind: "tip",
        ring: chance(rng, cfg.ringProbability * 0.6),
        hollow: chance(rng, 0.45),
        opacity: round(range(rng, 0.45, 0.9)),
        behind: item.behind,
        appearAt: item.startTime + duration,
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
    b.growthStart = round(rawStart[i] / span);
    b.growthDuration = round(rawDuration[i] / span);
  });
  nodes.forEach((n) => {
    n.appearAt = round(Math.min(1, n.appearAt / span));
  });

  /* ---- halftone accents ---- */
  // Dot fields anchored to a few deep tips. They are an accent that echoes the
  // brand's print halftone language, never a full-screen texture.
  const halftone: HalftoneCluster[] = [];
  const anchors = branches.filter((b) => b.depth >= 1 && !b.behind);
  for (let i = 0; i < cfg.halftoneClusters && anchors.length > 0; i += 1) {
    const anchor = pick(rng, anchors);
    const cx = anchor.tip.x + range(rng, -18, 18);
    const cy = anchor.tip.y + range(rng, -18, 18);
    const cols = 8;
    const rows = 5;
    const gap = cfg.baseWidth * range(rng, 6, 8.5);
    const dir = sign(rng);
    const dots: HalftoneDot[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        // Radius falls off across the cluster, mimicking a halftone ramp.
        const fall = 1 - c / cols;
        const rad = cfg.baseWidth * 1.05 * fall * range(rng, 0.55, 1.05);
        if (rad < 0.18) continue;
        dots.push({
          x: round(cx + dir * (c * gap + (r % 2) * gap * 0.5) + range(rng, -1, 1)),
          y: round(cy + (r - rows / 2) * gap + range(rng, -1, 1)),
          r: round(rad),
        });
      }
    }
    halftone.push({
      id: `h${i}`,
      dots,
      appearAt: round(Math.min(0.98, anchor.growthStart + anchor.growthDuration)),
    });
  }

  /* ---- continuation into the next section ---- */
  // The lowest tips are carried into a normalised 0..100 band so the hero can
  // hand the system off across its bottom edge rather than stopping dead.
  const descenders: Descender[] = branches
    .filter((b) => b.tip.y > cfg.height * 0.6)
    .sort((a, b) => b.tip.y - a.tip.y)
    .slice(0, 4)
    .map((b, i) => {
      const x = round((b.tip.x / cfg.width) * 100);
      // The band is a 100-unit square stretched to 100vw x 16vh, so one x unit
      // renders ~10x wider than one y unit. The old swing of 5-14 units became
      // a 70-200px horizontal zigzag squashed into a 144px-tall strip - the
      // strands read as stray squiggles, and the section below appeared to
      // start from nothing. A swing of ~1-3 units renders as the gentle
      // near-vertical drop the seam needs.
      const swing = (i % 2 === 0 ? 1 : -1) * (1.1 + i * 0.5);
      const end = Math.min(96, Math.max(4, x + swing * 0.5));
      return {
        id: `d${i}`,
        d: `M${x} 0C${round(x + swing)} 34 ${round(x - swing * 0.6)} 66 ${end} 100`,
        // Chord length padded generously: dash-offset reveal only needs the
        // dash to be at least as long as the path.
        length: Math.round(Math.hypot(end - x, 100) * 1.35),
        exitX: end,
        exitLean: swing >= 0 ? 1 : -1,
      };
    });

  return {
    width: cfg.width,
    height: cfg.height,
    seedPoint: { x: round(seedPoint.x), y: round(seedPoint.y) },
    branches,
    nodes,
    halftone,
    descenders,
  };
}
