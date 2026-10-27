/**
 * SPECIMENS — finding room
 *
 * Given a section as it is actually laid out, find the empty square nearest a
 * preferred corner. "Empty" means clear of every line of type, every picture,
 * card, portrait, control and seam artwork, with a margin — the same things a
 * designer would keep a decorative image off.
 *
 * It is measured rather than declared because the open space in these
 * sections is a by-product of art-directed grids that reflow at every width;
 * a fixed position that is clear at 1440 sits on a caption at 1280.
 */

export interface Box {
  x: number;
  y: number;
  size: number;
}

/** Grid resolution of the search, px. */
const CELL = 16;
/** Clearance kept around type and around pictures, px. */
const TYPE_MARGIN = 20;
const MEDIA_MARGIN = 16;
/** How much a px of distance from the preferred corner costs, in px of size. */
const DISTANCE_COST = 0.4;

const MEDIA = [
  "img",
  "canvas",
  "input",
  "button",
  "[data-work-frame]",
  "[data-branch-card]",
  ".collective-person__frame",
  "[data-contact-bloom-slot]",
].join(",");

/** Rectangles, relative to the section, that a specimen must not touch. */
function obstacles(section: HTMLElement, origin: DOMRect): number[][] {
  const out: number[][] = [];
  const add = (r: DOMRect, margin: number) => {
    if (r.width < 2 || r.height < 2) return;
    if (r.bottom < origin.top || r.top > origin.bottom) return;
    out.push([
      r.left - origin.left - margin,
      r.top - origin.top - margin,
      r.right - origin.left + margin,
      r.bottom - origin.top + margin,
    ]);
  };

  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    const parent = node.parentElement;
    if (!parent || parent.closest("svg, .visually-hidden, [data-specimen]")) continue;
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) add(rect, TYPE_MARGIN);
  }

  section.querySelectorAll<HTMLElement>(MEDIA).forEach((el) => {
    if (!el.closest("[data-specimen]")) add(el.getBoundingClientRect(), MEDIA_MARGIN);
  });
  // The seam bands straddle section boundaries from outside the section. The
  // whole band is kept clear, not just what is drawn in it: the client found a
  // picture beside a section's opening awkward (Oct 2026), and a specimen
  // there would be the same thing again.
  document
    .querySelectorAll<HTMLElement>(".seam__band")
    .forEach((el) => add(el.getBoundingClientRect(), MEDIA_MARGIN));
  // Specimens already placed in this section.
  section.querySelectorAll<HTMLElement>("[data-specimen][data-placed]").forEach((el) => {
    add(el.getBoundingClientRect(), MEDIA_MARGIN);
  });
  return out;
}

/**
 * The best empty square in a section for one placement, or null if there is
 * no room of at least `min`. Coordinates are relative to the section.
 */
export function findRoom(
  section: HTMLElement,
  prefer: { x: number; y: number },
  min: number,
  max: number,
  above?: string,
): Box | null {
  const origin = section.getBoundingClientRect();
  const width = origin.width;
  // With `above`, only the part of the section before the first element it
  // matches is searched — the opening of the team section, say, and never
  // the space between the people in it.
  const limit = above ? section.querySelector(above)?.getBoundingClientRect() : undefined;
  const height = limit ? Math.max(0, limit.top - origin.top) : origin.height;
  if (width < min || height < min) return null;

  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  const taken = new Uint8Array(cols * rows);
  for (const [l, t, r, b] of obstacles(section, origin)) {
    const x0 = Math.max(0, Math.floor(l / CELL));
    const x1 = Math.min(cols, Math.ceil(r / CELL));
    const y0 = Math.max(0, Math.floor(t / CELL));
    const y1 = Math.min(rows, Math.ceil(b / CELL));
    for (let y = y0; y < y1; y++) taken.fill(1, y * cols + x0, y * cols + Math.max(x0, x1));
  }

  // Largest empty square whose bottom-right corner is each cell.
  const reach = new Uint16Array(cols * rows);
  const px = prefer.x * width;
  const py = prefer.y * height;
  let best: Box | null = null;
  let bestScore = -Infinity;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (taken[i]) continue;
      reach[i] = x && y ? 1 + Math.min(reach[i - 1], reach[i - cols], reach[i - cols - 1]) : 1;
      const size = Math.min(reach[i] * CELL, max);
      if (size < min) continue;
      const right = (x + 1) * CELL;
      const bottom = (y + 1) * CELL;
      if (right > width || bottom > height) continue;
      const cx = right - size / 2;
      const cy = bottom - size / 2;
      const score = size - Math.hypot(cx - px, cy - py) * DISTANCE_COST;
      if (score > bestScore) {
        bestScore = score;
        best = { x: right - size, y: bottom - size, size };
      }
    }
  }
  return best;
}
