/**
 * NETWORK CONTINUITY — the single rule for handing the organism across a seam.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Every section from Selected Work down grows from the previous section's real
 * trunks, and each one used to implement that handoff itself. Six near-identical
 * copies of the same twenty lines drifted apart in exactly the way duplicated
 * code does, and two of them were wrong in ways that broke the organism outright:
 *
 *   • `workInlets` (Section 3) ended with `if (kept.length === 0)
 *     kept.push({ x: 0.5, lean: 1 })` — an INVENTED root at dead centre. When
 *     Section 2's trunks failed to reach its foot (which they did at every
 *     tablet and mobile width), Section 3 silently re-rooted the whole organism
 *     at x = 0.5 and everything below inherited from a point that had never
 *     grown anywhere. Measured: entry x was exactly 0.500 at 834 and 390, against
 *     a genuine 0.777 at 1440.
 *
 *   • `readWorkExits` (Section 4) had the opposite failure: no fallback at all.
 *     It kept only trunks past 0.86 of the field and returned `null` otherwise,
 *     and every section below it renders nothing without inlets. Measured: at
 *     375, 412, 414, 430 and 1024 CSS px, Sections 4–8 rendered ZERO paths —
 *     the whole lower two-thirds of the page had no network at all.
 *
 * So the contract is defined once, here, and it is the one every seam uses.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CONTRACT
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. AN INLET IS ALWAYS A REAL TRUNK TIP. Nothing on this page is ever seeded
 *      at a coordinate the generator did not produce. If the preferred trunks
 *      are not available the answer is the next-deepest REAL ones, never a
 *      synthesised point — that is the difference between an organism and a
 *      drawing of one.
 *   2. PREFER TRUNKS THAT CROSSED THE FOOT, because those are the strands the
 *      reader actually watched leave.
 *   3. NEVER RETURN EMPTY when the network has trunks. Spacing and foot depth
 *      are preferences, not gates; they are relaxed in that order rather than
 *      allowed to blank a section.
 *   4. Offshoots are never inlets. They are short side twigs and would enter the
 *      next field as stubs.
 */

import type { CascadeInlet } from "@/lib/first-growth/cascade";
import type { OrganicNetwork, Point } from "@/lib/hero/network";

/**
 * Which way a strand was leaning as it ended, read off the last curve segment
 * of its path data.
 *
 * Defined here rather than in Section 3, where it used to live, purely so this
 * module does not have to import from a section it is a dependency of.
 * `lib/work/network` re-exports it, so every existing import still resolves.
 */
/**
 * The heading a strand was on as it crossed the seam, read off the last curve
 * segment of its path data. Handed to the next section so its continuation
 * leaves on the SAME tangent — without it every entry restarted at a fixed
 * steep angle, and the join read as two lines meeting at a kink rather than
 * one stroke crossing a boundary.
 */
export function exitAngleOf(d: string): number | undefined {
  const last = d.lastIndexOf("C");
  if (last < 0) return undefined;
  const numbers = d
    .slice(last + 1)
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (numbers.length < 6) return undefined;
  const [, , c2x, c2y, x, y] = numbers;
  const angle = Math.atan2(y - c2y, x - c2x);
  // Only a downward heading can cross a foot; anything else is noise from a
  // degenerate final segment.
  return angle > 0.2 && angle < Math.PI - 0.2 ? angle : undefined;
}

export function exitLeanOf(d: string): -1 | 1 {
  const last = d.lastIndexOf("C");
  if (last < 0) return 1;
  const numbers = d
    .slice(last + 1)
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (numbers.length < 6) return 1;
  const [, , c2x, , x] = numbers;
  return x - c2x >= 0 ? 1 : -1;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * An element's box in a root's own coordinates, from LAYOUT rather than PAINT.
 *
 * `getBoundingClientRect()` includes transforms, and almost every element these
 * networks are grown against carries one mid-reveal — so measuring that way
 * makes the generated network a function of scroll position, and the same page
 * grows differently depending on where the reader happens to be.
 * `offsetTop`/`offsetLeft` are pure layout and ignore transforms entirely.
 *
 * THIS IS ALSO A SEAM CORRECTNESS ISSUE, not just a determinism one. A section
 * that measures itself with `getBoundingClientRect()` while the next section
 * re-measures it with `offsetTop` regrows a DIFFERENT network from the one on
 * the screen, so the inlets it hands over do not line up with the strands the
 * reader can actually see. Measured before this was unified: Section 5's entry
 * points sat 0.01–0.054 of the field width away from Section 4's real trunk
 * tips at every tier — 14 to 78 CSS px of visible misalignment at 1440.
 *
 * Lives here so every section can measure the same way without importing from
 * a sibling section; `lib/collective/network` re-exports it for the sections
 * that already import it from there.
 */
export function layoutRect(el: HTMLElement, root: HTMLElement): Rect {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, width: el.offsetWidth, height: el.offsetHeight };
}

export interface ExitOptions {
  /** Fewest entry points to open the next field with. */
  min: number;
  /** Most to take, even when more trunks qualify. */
  max: number;
  /** Least normalised distance between two entries, 0..1. */
  spacing: number;
  /**
   * Only for the last-resort fallback, when no trunk crosses the foot at all:
   * fraction of the field height a trunk tip must reach to be preferred.
   */
  footRatio?: number;
  /** Absolute fallback foot in field units. Overrides `footRatio` when given. */
  foot?: number;
}

/* ------------------------------------------------------------------ *
 * Reading the strands where the reader actually sees them leave
 * ------------------------------------------------------------------ */

/*
 * ROUND 3 (27 Oct 2026) — WHY INLETS ARE NOW READ AT THE CROSSING, NOT THE TIP.
 *
 * Trunks are allowed to run past the foot (the section clips them), so a
 * trunk's TIP lies below and beside the point where it visibly crosses the
 * boundary. Every inlet used to be placed at the tip's x: measured on the
 * rendered page, the continuation began 20–100px away from the strand the
 * reader watched arrive, at every seam and every tier, and twice the 0.94
 * wall clamp moved an entry ~300px. Trunks that crossed but were not
 * inherited were simply cut by the clip. The old seam metric compared inlets
 * with those same tips, which is why it reported dx = 0 throughout.
 *
 * So: an inlet is where a drawn strand crosses y = field height, on that
 * strand's tangent there; and every crossing strand the next field does NOT
 * continue is closed above the foot with a tip node by `closeSeam`, so no
 * strand ever ends on the boundary line.
 */

interface Candidate {
  x: number;
  y: number;
  lean: -1 | 1;
  angle?: number;
}

type Cubic = [number, number, number, number, number, number, number, number];

/** The cubic segments of a path written by `toPath` (one M, then C's). */
function cubicsOf(d: string): Cubic[] {
  const parts = d.match(/[MC][^MC]*/g) ?? [];
  const out: Cubic[] = [];
  let x = 0;
  let y = 0;
  for (const part of parts) {
    const n = part.slice(1).trim().split(/[\s,]+/).map(Number);
    if (part[0] === "M") {
      [x, y] = n;
    } else if (n.length >= 6) {
      out.push([x, y, n[0], n[1], n[2], n[3], n[4], n[5]]);
      x = n[4];
      y = n[5];
    }
  }
  return out;
}

const cubicAt = (c: Cubic, t: number) => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, e = 3 * u * t * t, f = t * t * t;
  return {
    x: a * c[0] + b * c[2] + e * c[4] + f * c[6],
    y: a * c[1] + b * c[3] + e * c[5] + f * c[7],
  };
};

const cubicTangent = (c: Cubic, t: number) => {
  const u = 1 - t;
  return Math.atan2(
    3 * u * u * (c[3] - c[1]) + 6 * u * t * (c[5] - c[3]) + 3 * t * t * (c[7] - c[5]),
    3 * u * u * (c[2] - c[0]) + 6 * u * t * (c[4] - c[2]) + 3 * t * t * (c[6] - c[4]),
  );
};

/**
 * The first point where a path passes through `y = line` — descending, or
 * with `up`, ascending.
 */
function descentThrough(cubics: Cubic[], line: number, up = false) {
  // "Before the line" is above it for a descent and below it for an ascent.
  const before = (y: number) => (up ? y > line : y < line);
  for (let k = 0; k < cubics.length; k += 1) {
    const c = cubics[k];
    // Sample, then bisect inside the first sample interval that crosses.
    let prev = cubicAt(c, 0);
    for (let s = 1; s <= 16; s += 1) {
      const t1 = s / 16;
      const next = cubicAt(c, t1);
      if (before(prev.y) && !before(next.y)) {
        let lo = t1 - 1 / 16;
        let hi = t1;
        for (let i = 0; i < 24; i += 1) {
          const mid = (lo + hi) / 2;
          if (before(cubicAt(c, mid).y)) lo = mid;
          else hi = mid;
        }
        const t = (lo + hi) / 2;
        return { segment: k, t, point: cubicAt(c, t), angle: cubicTangent(c, t) };
      }
      prev = next;
    }
  }
  return null;
}

/** De Casteljau: the part of a cubic from 0 to t. */
function cubicHead(c: Cubic, t: number): Cubic {
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const [x0, y0, x1, y1, x2, y2, x3, y3] = c;
  const ax = lerp(x0, x1), ay = lerp(y0, y1);
  const bx = lerp(x1, x2), by = lerp(y1, y2);
  const cx = lerp(x2, x3), cy = lerp(y2, y3);
  const dx = lerp(ax, bx), dy = lerp(ay, by);
  const ex = lerp(bx, cx), ey = lerp(by, cy);
  const fx = lerp(dx, ex), fy = lerp(dy, ey);
  return [x0, y0, ax, ay, dx, dy, fx, fy];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function pathOf(cubics: Cubic[]): string {
  if (!cubics.length) return "";
  const head = `M${r2(cubics[0][0])} ${r2(cubics[0][1])}`;
  return (
    head +
    cubics
      .map((c) => `C${r2(c[2])} ${r2(c[3])} ${r2(c[4])} ${r2(c[5])} ${r2(c[6])} ${r2(c[7])}`)
      .join("")
  );
}

interface Crossing {
  branchId: string;
  /** Field units. */
  x: number;
  angle: number;
  /** How far the strand ran on past the foot — the strongest leavers first. */
  depth: number;
}

/** Every trunk that visibly leaves the field through its lower edge. */
function crossingsOf(network: OrganicNetwork): Crossing[] {
  const out: Crossing[] = [];
  for (const branch of network.branches) {
    if (branch.depth !== 0) continue;
    const hit = descentThrough(cubicsOf(branch.d), network.height);
    if (!hit) continue;
    // A crossing outside the canvas is not one the reader can see.
    if (hit.point.x < 0 || hit.point.x > network.width) continue;
    out.push({ branchId: branch.id, x: hit.point.x, angle: hit.angle, depth: branch.tip.y });
  }
  return out.sort((a, b) => b.depth - a.depth);
}

/** The crossings the next field continues: the one selection both sides use. */
function selectCrossings(network: OrganicNetwork, options: ExitOptions): Crossing[] {
  const { min, max, spacing } = options;
  const crossings = crossingsOf(network);
  const kept: Crossing[] = [];
  const take = (gap: number, limit: number) => {
    for (const c of crossings) {
      if (kept.length >= limit) return;
      if (kept.includes(c)) continue;
      if (kept.some((k) => Math.abs(k.x - c.x) / network.width < gap)) continue;
      kept.push(c);
    }
  };
  take(spacing, max);
  // Fewer than `min` at the preferred spacing: relax the spacing, never the
  // rule that an entry continues a strand that really crossed.
  for (let gap = spacing * 0.6; kept.length < min && gap > 0.005; gap *= 0.5) take(gap, min);
  return kept;
}

const leanOf = (angle: number): -1 | 1 => (Math.cos(angle) >= 0 ? 1 : -1);

/**
 * The trunks leaving a network through its lower edge, as the next field's
 * entry points: the x where each visibly crosses the foot, and its heading
 * there.
 *
 * Returns an empty array only when the network genuinely has no trunks at all —
 * in which case the caller has nothing to continue and should render nothing,
 * which is the one honest response to an absent parent.
 */
export function readExits(network: OrganicNetwork, options: ExitOptions): CascadeInlet[] {
  const crossed = selectCrossings(network, options);
  if (crossed.length) {
    return crossed.map((c) => ({ x: c.x / network.width, lean: leanOf(c.angle), angle: c.angle }));
  }
  return deepestTips(network, options);
}

/**
 * The last resort, for a parent none of whose trunks reaches its foot: the
 * deepest REAL trunk tips. Such an entry cannot read as continuous — which is
 * why every generator is budgeted to cross its foot — but a blank section
 * below would be worse.
 */
function deepestTips(network: OrganicNetwork, options: ExitOptions): CascadeInlet[] {
  const { min, max, spacing } = options;

  const trunks: Candidate[] = network.branches
    .filter((branch) => branch.depth === 0)
    .sort((a, b) => b.tip.y - a.tip.y)
    .map((branch) => ({
      // Clamped off the side walls: an inlet at x = 0.99 walks the continuation
      // straight off the canvas in three steps.
      x: Math.min(0.94, Math.max(0.06, branch.tip.x / network.width)),
      y: branch.tip.y,
      lean: exitLeanOf(branch.d),
      angle: exitAngleOf(branch.d),
    }));

  if (!trunks.length) return [];

  const foot = options.foot ?? network.height * (options.footRatio ?? 0.86);
  const kept: CascadeInlet[] = [];

  const take = (source: Candidate[], limit: number, gap: number) => {
    for (const exit of source) {
      if (kept.length >= limit) return;
      if (kept.some((k) => Math.abs(k.x - exit.x) < gap)) continue;
      kept.push({ x: exit.x, lean: exit.lean, angle: exit.angle });
    }
  };

  take(trunks.filter((t) => t.y >= foot), max, spacing);
  if (kept.length < min) take(trunks, min, spacing);
  if (kept.length < min) {
    for (let gap = spacing * 0.6; kept.length < min && gap > 0.005; gap *= 0.5) {
      take(trunks, min, gap);
    }
  }
  if (!kept.length)
    kept.push({ x: trunks[0].x, lean: trunks[0].lean, angle: trunks[0].angle });

  return kept;
}

/**
 * Closes every strand that crosses the foot but is NOT continued below, so
 * nothing on the page ends sliced on a section boundary: it is cut `margin`
 * above the foot and finished with a tip node, and anything that grew from
 * the part removed goes with it. Must be given the same options the next
 * field reads with — `selectCrossings` is the single selection both use, so
 * `readExits` on the result returns exactly the strands left crossing.
 *
 * Offshoots that reach the foot are closed the same way; only selected
 * trunks may cross. So are offshoots that bend up through the top edge.
 */
export function closeSeam(
  network: OrganicNetwork,
  options: ExitOptions,
  margin = 44,
): OrganicNetwork {
  const keep = new Set(selectCrossings(network, options).map((c) => c.branchId));
  const line = network.height - margin;
  const template = network.nodes.find((n) => n.kind === "tip" && n.depth === 0) ?? network.nodes[0];

  const removed = new Set<string>();
  const trimmed = new Map<string, { d: string; tip: Point }>();

  // The top edge too: an offshoot leaving near the head of the field can bend
  // up through it and be sliced there just the same.
  const ceiling = margin / 2;

  // A continued strand ends where it first crosses the foot. Past it the
  // walk may wander on inside the clipped margin and come back up through
  // the boundary — measured at 1280 in Journal: a loop poking back into the
  // field and cut at the edge, beside the strand Contact really continues.
  const handedOn = new Map<string, string>();

  for (const branch of network.branches) {
    const cubics = cubicsOf(branch.d);
    if (keep.has(branch.id)) {
      // Just past the foot, not on it: the written path is rounded to 0.01,
      // and an end rounded up onto the line no longer reads as a crossing.
      const first = descentThrough(cubics, network.height + 2);
      if (first) {
        const head = cubics.slice(0, first.segment);
        head.push(cubicHead(cubics[first.segment], first.t));
        handedOn.set(branch.id, pathOf(head));
      }
      continue;
    }
    let hit: ReturnType<typeof descentThrough> = null;
    if (descentThrough(cubics, network.height)) {
      hit = descentThrough(cubics, line);
    } else if (branch.depth > 0 && descentThrough(cubics, 0, true)) {
      hit = descentThrough(cubics, ceiling, true);
    } else {
      continue;
    }
    if (!hit) {
      // Already past the cut where it starts: it goes, and its parent's end
      // becomes the tip.
      removed.add(branch.id);
      continue;
    }
    const head = cubics.slice(0, hit.segment);
    head.push(cubicHead(cubics[hit.segment], hit.t));
    trimmed.set(branch.id, { d: pathOf(head), tip: hit.point });
  }
  if (!removed.size && !trimmed.size && !handedOn.size) return network;

  // Whatever started on a removed part of a strand is removed with it.
  const startOf = (d: string) => {
    const c = cubicsOf(d)[0];
    return c ? { x: c[0], y: c[1] } : null;
  };
  let grew = true;
  while (grew) {
    grew = false;
    for (const branch of network.branches) {
      if (removed.has(branch.id) || !branch.parentId) continue;
      const start = startOf(branch.d);
      const parentGone = removed.has(branch.parentId);
      const cut = trimmed.get(branch.parentId);
      const fromCutPart =
        cut !== undefined &&
        start !== null &&
        Math.hypot(start.x - cut.tip.x, start.y - cut.tip.y) > 0.5 &&
        (start.y > line + 0.5 || start.y < ceiling - 0.5);
      if (parentGone || fromCutPart) {
        removed.add(branch.id);
        trimmed.delete(branch.id);
        grew = true;
      }
    }
  }

  const branches = network.branches
    .filter((b) => !removed.has(b.id))
    .map((b) => {
      const t = trimmed.get(b.id);
      if (t) return { ...b, d: t.d, tip: t.tip };
      const on = handedOn.get(b.id);
      return on ? { ...b, d: on } : b;
    });

  const nodes = network.nodes.filter((n) => {
    if (removed.has(n.branchId)) return false;
    if (trimmed.has(n.branchId) && (n.y > line + 0.5 || n.y < ceiling - 0.5)) return false;
    return true;
  });

  // A tip node at every new end: each trimmed strand, and each surviving
  // strand whose continuation was removed and that has nothing left at its end.
  const ends: { branchId: string; at: Point; depth: number; behind: boolean; appearAt: number }[] = [];
  for (const b of branches) {
    const t = trimmed.get(b.id);
    if (t) ends.push({ branchId: b.id, at: t.tip, depth: b.depth, behind: b.behind, appearAt: b.growthStart + b.growthDuration });
  }
  for (const b of branches) {
    if (trimmed.has(b.id)) continue;
    const lostChild = network.branches.some((c) => c.parentId === b.id && removed.has(c.id));
    const keptChild = branches.some((c) => c.parentId === b.id);
    if (lostChild && !keptChild) {
      ends.push({ branchId: b.id, at: b.tip, depth: b.depth, behind: b.behind, appearAt: b.growthStart + b.growthDuration });
    }
  }
  for (const end of ends) {
    if (!template) break;
    if (nodes.some((n) => Math.hypot(n.x - end.at.x, n.y - end.at.y) < 3)) continue;
    nodes.push({
      ...template,
      id: `${end.branchId}-closed`,
      branchId: end.branchId,
      x: r2(end.at.x),
      y: r2(end.at.y),
      depth: end.depth,
      kind: "tip",
      ring: false,
      behind: end.behind,
      appearAt: Math.min(1, end.appearAt),
    });
  }

  return { ...network, branches, nodes };
}
