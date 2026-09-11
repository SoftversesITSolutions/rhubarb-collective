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
import type { OrganicNetwork } from "@/lib/hero/network";

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
   * Fraction of the field height a trunk must reach to count as having crossed
   * the foot. Trunks past it are preferred; trunks short of it are the fallback.
   */
  footRatio?: number;
  /** Absolute foot in field units. Overrides `footRatio` when given. */
  foot?: number;
}

interface Candidate {
  x: number;
  y: number;
  lean: -1 | 1;
  angle?: number;
}

/**
 * The trunks leaving a network through its lower edge, deepest first, as the
 * next field's entry points.
 *
 * Returns an empty array only when the network genuinely has no trunks at all —
 * in which case the caller has nothing to continue and should render nothing,
 * which is the one honest response to an absent parent.
 */
export function readExits(network: OrganicNetwork, options: ExitOptions): CascadeInlet[] {
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

  // 1 — the strands that actually crossed the foot of the field above.
  take(
    trunks.filter((t) => t.y >= foot),
    max,
    spacing,
  );

  // 2 — not enough of them: the next-deepest trunks of the SAME network. Still
  //     that section's own geometry, just read further up its field.
  if (kept.length < min) take(trunks, min, spacing);

  // 3 — still short because the field is too narrow for the preferred spacing.
  //     Relax it rather than open a field with fewer entries than it needs; a
  //     seam that hands over one strand where three left reads as a reset.
  if (kept.length < min) {
    for (let gap = spacing * 0.6; kept.length < min && gap > 0.005; gap *= 0.5) {
      take(trunks, min, gap);
    }
  }

  // 4 — a last resort that still cannot invent anything: the deepest trunk.
  if (!kept.length)
    kept.push({ x: trunks[0].x, lean: trunks[0].lean, angle: trunks[0].angle });

  return kept;
}
