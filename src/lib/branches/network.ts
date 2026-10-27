/**
 * SECTION 04 — THE TURN
 *
 * The one field on the page whose macro composition is ART-DIRECTED rather
 * than emergent. Everywhere else the organism falls; here it stops falling
 * and TRAVELS. Since client round 3 (Oct 2026) the section is a pinned stage
 * the reader scrolls sideways through: one branch runs the length of a track
 * wider than the screen, each discipline grows out of it on a short stem —
 * above, below, above — and at the far end the branch turns back down into
 * the page.
 *
 *   entries (Selected Work's real exits)
 *      │   │
 *      ╰─● ╰─●──────●────────────●────────────●──── … ──●──────●── turn
 *            ╭╯     ╰╮    ╭╯     ╰╮    ╭╯           ╭╯  │      ╱ ╲
 *          [01]     [02] [03]   [04]  [05]        [06]  descents
 *
 * The field is the TRACK, not the screen: x runs along the whole journey and
 * y from the top of the section's intro to the stage's foot. Selected Work's
 * strands arrive in the first screen's width (the track starts where the
 * stage does), and the descents leave through the LAST screen's width (where
 * the track has slid to by the time the pin lets go) — so the next section
 * is handed its inlets as fractions of that last screen.
 *
 * Nothing decorative is invented: the entries are the actual trunks that left
 * Selected Work, every stem starts on a real point of the branch, and the
 * descents are the exits The Collective inherits. Seeded randomness supplies
 * micro-curvature only.
 */

import type { Tier } from "@/lib/hero/config";
import { NETWORK_SEED } from "@/lib/hero/config";
import {
  measure,
  type Branch,
  type NetworkNode,
  type OrganicNetwork,
  type Point,
} from "@/lib/hero/network";
import { chance, createRng, range, type Rng } from "@/lib/hero/random";
import { generateWorkNetwork, measureWorkField } from "@/lib/work/network";
import { closeSeam, layoutRect, readExits } from "@/lib/network/continuity";
import { TURN_EXITS, WORK_EXITS } from "@/lib/network/seams";
import type { CascadeInlet } from "@/lib/first-growth/cascade";
import { BRANCH_SHAPE } from "./config";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const workExitCache = new Map<string, CascadeInlet[]>();

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

  const field = measureWorkField(work, tier);
  if (!field) return null;
  // Every section below reads this one through `measureBranchField`, so on
  // load it is asked five times over; regrowing Selected Work for each held
  // the hero's logo back ~0.5s on phones (round 3). Its network is a pure
  // function of its measured field, so the field is the key.
  const key = JSON.stringify(field);
  const cached = workExitCache.get(key);
  if (cached) return cached;
  const network = generateWorkNetwork(field);

  // Two, never more: everything that arrives here is gathered into ONE
  // branch, so extra entries only crowd the gather. `readExits` treats foot
  // depth and spacing as preferences and relaxes them in order, so the only
  // empty result is a parent with no trunks at all.
  const kept = readExits(network, WORK_EXITS(tier));
  if (!kept.length) return null;
  workExitCache.set(key, kept);
  return kept;
}

export interface BranchFieldInput {
  tier: Tier;
  /** The whole track, CSS px: the journey's full length. */
  width: number;
  /** The intro above the stage plus the stage itself, CSS px. */
  height: number;
  /** Field y of the stage's top edge — everything above it is the intro. */
  stageTop: number;
  /** Width of the stage: the window the track slides behind. */
  view: number;
  /** How far the track slides, i.e. where the stage's left edge ends up. */
  travel: number;
  /** Card frames in field units, in order. Even cards hang below the branch, odd above. */
  cards: Rect[];
  /** Entry points inherited from Selected Work, as fractions of the view. */
  inlets: CascadeInlet[];
}

/** Below the branch (+1) or above it (−1) — the alternation `branches.css` lays out. */
const sideOf = (index: number) => (index % 2 === 0 ? 1 : -1);

/**
 * Measure the section exactly as both readers need it: the section itself,
 * and The Collective regrowing it to read its exits.
 *
 * It also SETS one thing first — where the first card sits (`--lead`). The
 * entries fall wherever Selected Work's strands crossed its foot, anywhere
 * from the far left to the far right, and the branch they gather into can
 * only start from the leftmost of them; so the first stem has to be to the
 * right of that, and the first card hung ABOVE the branch has to be clear of
 * every falling entry. That is a function of the inlets, so it is decided
 * here, before the cards are measured, and it is idempotent — whichever
 * reader comes first, both measure the same layout.
 */
export function measureBranchField(root: HTMLElement, tier: Tier): BranchFieldInput | null {
  const intro = root.querySelector<HTMLElement>("[data-branches-intro]");
  const stage = root.querySelector<HTMLElement>("[data-branches-stage]");
  const track = root.querySelector<HTMLElement>("[data-branches-track]");
  if (!intro || !stage || !track) return null;

  const view = stage.clientWidth;
  const stageHeight = stage.offsetHeight;
  if (view < 1 || stageHeight < 1) return null;

  // Inherited from Selected Work. If that section is not on the page there is
  // nothing to continue, and inventing a root would be exactly the orphan
  // geometry this system avoids.
  const inlets = readWorkExits(tier);
  if (!inlets) return null;

  const frames = Array.from(track.querySelectorAll<HTMLElement>("[data-branch-frame]"));
  const cardEls = Array.from(track.querySelectorAll<HTMLElement>("[data-branch-card]"));
  if (cardEls.length < 2) return null;

  const shape = BRANCH_SHAPE[tier];
  const xs = inlets.map((inlet) => inlet.x * view);
  const cardWidth = cardEls[0].offsetWidth;
  // Independent of the lead: every card is placed from the same origin.
  const step = cardEls[1].offsetLeft - cardEls[0].offsetLeft;
  const gather = landingX(Math.min(...xs), shape.bend, view);
  const lead = Math.round(
    Math.max(
      view * 0.06,
      // The first stem leaves the branch a little after the gather…
      gather + 40 - cardWidth * STEM_AT,
      // …and the first card above the branch clears every falling entry.
      Math.max(...xs) + shape.clear - step,
    ),
  );
  if (track.style.getPropertyValue("--lead") !== `${lead}px`) {
    track.style.setProperty("--lead", `${lead}px`);
  }

  const stageTop = intro.offsetHeight;
  const width = track.offsetWidth;
  const cards = frames.map((frame) => {
    const rect = layoutRect(frame, track);
    return { ...rect, y: rect.y + stageTop };
  });

  return {
    tier,
    width,
    height: stageTop + stageHeight,
    stageTop,
    view,
    travel: Math.max(0, width - view),
    cards,
    inlets,
  };
}

/**
 * The exits The Collective inherits, as fractions of the LAST screen — the
 * one the stage shows when the pin lets go and the page carries on down.
 */
export function readTurnExits(network: OrganicNetwork, input: BranchFieldInput): CascadeInlet[] {
  return readExits(network, TURN_EXITS(input.tier)).map((exit) => ({
    ...exit,
    x: (exit.x * input.width - input.travel) / input.view,
  }));
}

/* ------------------------------------------------------------------ *
 * geometry helpers
 * ------------------------------------------------------------------ */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Where along a card's width its stem leaves the branch. */
const STEM_AT = 0.1;

/**
 * Where an entry falling at `x` lands on the branch: a little downstream,
 * but always inside the first screen — at translate 0 the stage's right edge
 * clips the track, and an entry near the wall used to run off it.
 */
const landingX = (x: number, run: number, view: number) =>
  Math.max(x + 12, Math.min(x + run, view - 24));

/**
 * Insert a jittered midpoint into every span. The originals survive, so any
 * point referenced as a junction stays exactly on the refined polyline —
 * which is what keeps every fork a real fork. The first span is left
 * straight: it carries the heading a strand arrived with.
 */
function refine(rng: Rng, pts: Point[], amp: number): Point[] {
  const out: Point[] = [pts[0]];
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    // Perpendicular offset, capped so a short span cannot buckle.
    const off = i === 1 ? 0 : range(rng, -amp, amp) * Math.min(1, len / (amp * 6));
    out.push(
      { x: (a.x + b.x) / 2 + (-dy / len) * off, y: (a.y + b.y) / 2 + (dx / len) * off },
      b,
    );
  }
  return out;
}

/**
 * `toPath`'s Catmull-Rom spline over part of a polyline, using the points
 * either side of the range as its neighbours. Cutting one smooth line into
 * strands this way leaves no kink at the cuts — the entry, the branch and the
 * turn read as one stroke — and a stem given the branch's previous point as
 * its first neighbour leaves on the branch's own heading.
 */
function spline(points: Point[], from: number, to: number): string {
  const parts = [`M${r2(points[from].x)} ${r2(points[from].y)}`];
  for (let i = from; i < to; i += 1) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    parts.push(
      `C${r2(p1.x + (p2.x - p0.x) / 6)} ${r2(p1.y + (p2.y - p0.y) / 6)} ` +
        `${r2(p2.x - (p3.x - p1.x) / 6)} ${r2(p2.y - (p3.y - p1.y) / 6)} ` +
        `${r2(p2.x)} ${r2(p2.y)}`,
    );
  }
  return parts.join("");
}

/* ------------------------------------------------------------------ *
 * the journey
 * ------------------------------------------------------------------ */

interface Station extends Point {
  kind: "gather" | "merge" | "stem" | "early" | "turn" | "pass";
  /** The entry (merge) or the card (stem) it serves. */
  ref?: number;
}

/**
 * The section's network with its seam closed: every strand crossing the foot
 * that the next section does not continue ends above the boundary instead of
 * being cut by it (`closeSeam`, round 3). The section's own component and the
 * next section's exit reader both come through here, so they agree exactly.
 */
export function generateBranchNetwork(input: BranchFieldInput): OrganicNetwork {
  return closeSeam(growBranchNetwork(input), TURN_EXITS(input.tier));
}

function growBranchNetwork(input: BranchFieldInput): OrganicNetwork {
  const rng = createRng(NETWORK_SEED + 173);
  const shape = BRANCH_SHAPE[input.tier];
  const { width, height, view, travel, cards, inlets } = input;
  const jit = (amt: number) => range(rng, -amt, amt);
  const clampX = (x: number) => Math.min(width - 14, Math.max(14, x));

  const branches: Branch[] = [];
  const nodes: NetworkNode[] = [];
  const empty: OrganicNetwork = {
    width,
    height,
    seedPoint: { x: 0, y: 0 },
    branches,
    nodes,
    halftone: [],
    descenders: [],
  };
  if (!inlets.length || cards.length < 2) return empty;

  /* ---- 1. the branch's line: halfway between the two rows of cards ---- */

  const belowTop = Math.min(...cards.filter((_, i) => sideOf(i) > 0).map((c) => c.y));
  const aboveFoot = Math.max(
    ...cards.filter((_, i) => sideOf(i) < 0).map((c) => c.y + c.height),
  );
  const line = (belowTop + aboveFoot) / 2;
  const gap = Math.max(10, (belowTop - aboveFoot) / 2);

  /* ---- 2. stations along it, left to right ---------------------------- */

  const entries = inlets
    .map((inlet) => ({ inlet, x: clampX(inlet.x * view) }))
    .sort((a, b) => a.x - b.x);

  const gather: Station = {
    x: landingX(entries[0].x, shape.bend, view),
    y: line,
    kind: "gather",
  };
  const stations: Station[] = [gather];

  // A stem leaves where the branch leans toward its card.
  cards.forEach((card, i) => {
    stations.push({
      x: card.x + card.width * STEM_AT,
      y: line + sideOf(i) * gap * shape.lean,
      kind: "stem",
      ref: i,
    });
  });

  // The descents leave through the last screen, off its right wall — an
  // arrival hugging the edge of The Collective gets pinned between the wall
  // and the portraits and stalls (measured in round 1).
  const count = Math.min(shape.exits.length, TURN_EXITS(input.tier).max);
  const exitXs = shape.exits.slice(0, count).map((f) => clampX(travel + f * view));
  const turn: Station = { x: travel + shape.turn * view, y: line + gap * 0.45, kind: "turn" };
  const early: Station | null =
    count >= 3 ? { x: travel + shape.early * view, y: line + gap * 0.2, kind: "early" } : null;
  if (early) stations.push(early);
  stations.push(turn);

  // The other entries fall onto the branch a little downstream of where they
  // arrive — never onto a stem's own fork, which would make a knot of it.
  entries.slice(1).forEach((entry, k) => {
    let x = Math.max(landingX(entry.x, shape.bend * 0.8, view), gather.x + 36);
    for (const s of stations) {
      if (s.kind !== "stem" || Math.abs(s.x - x) >= 36) continue;
      // Past the fork if the screen has room, otherwise before it.
      x = s.x + 36 <= view - 24 ? s.x + 36 : Math.max(entry.x + 12, s.x - 36);
    }
    stations.push({ x, y: line + jit(gap * 0.12), kind: "merge", ref: k + 1 });
  });
  stations.sort((a, b) => a.x - b.x);

  // Plain points between stations, so the branch undulates gently instead of
  // running ruler-straight between forks.
  const trunk: Station[] = [];
  stations.forEach((s, i) => {
    const prev = stations[i - 1];
    if (prev) {
      const span = s.x - prev.x;
      const n = Math.floor(span / shape.span);
      for (let j = 1; j <= n; j += 1) {
        trunk.push({
          x: lerp(prev.x, s.x, j / (n + 1)),
          y: line + jit(gap * 0.14),
          kind: "pass",
        });
      }
    }
    trunk.push(s);
  });

  /* ---- 3. one line: the first entry, the branch, the turn's descent ---- */

  const entryPoints = (x: number, inlet: CascadeInlet, target: Point): Point[] => {
    // Leave on the tangent the strand crossed the seam with, so the join
    // reads as one stroke; then fall, and turn into the branch late.
    const a = Math.min(Math.PI - 0.5, Math.max(0.5, inlet.angle ?? Math.PI / 2));
    const lead: Point = { x: clampX(x + Math.cos(a) * 50), y: Math.sin(a) * 50 };
    return [
      { x, y: 0 },
      lead,
      { x: clampX(lead.x + jit(shape.jitter)), y: lerp(lead.y, target.y, 0.56) },
      // Never back past where it fell: a landing squeezed against the
      // screen's edge would otherwise kink the entry into an S.
      { x: Math.max(x, target.x - shape.bend * 0.7), y: target.y - shape.bend * 0.45 },
      target,
    ];
  };

  const finalExit: Point = { x: exitXs[0], y: height + 44 };
  const master = refine(
    rng,
    [
      ...entryPoints(entries[0].x, entries[0].inlet, gather).slice(0, -1),
      ...trunk,
      { x: lerp(turn.x, finalExit.x, 0.55), y: lerp(turn.y, height, 0.32) },
      { x: finalExit.x + jit(4), y: lerp(turn.y, height, 0.72) },
      finalExit,
    ],
    shape.wobble,
  );
  const at = (p: Point) => master.indexOf(p);

  const add = (
    id: string,
    parentId: string | null,
    depth: number,
    d: string,
    pts: Point[],
    strokeWidth: number,
    opacity: number,
  ) => {
    const xs = pts.map((p) => p.x);
    branches.push({
      id,
      parentId,
      depth,
      d,
      length: Math.round(measure(pts)),
      width: r2(strokeWidth),
      opacity,
      behind: false,
      // Timing is the animation's (it is drawn by where it is, see
      // lib/branches/animation); these only order it for anything generic.
      growthStart: r2(Math.min(...xs) / width),
      growthDuration: r2(Math.max(0.01, (Math.max(...xs) - Math.min(...xs)) / width)),
      tip: pts[pts.length - 1],
    });
  };

  const node = (
    branchId: string,
    p: Point,
    kind: "junction" | "tip",
    r: number,
    opacity: number,
    ring = false,
  ) => {
    nodes.push({
      id: `n-${branchId}-${nodes.length}`,
      branchId,
      x: r2(p.x),
      y: r2(p.y),
      r: r2(r),
      depth: kind === "junction" ? 0 : 1,
      kind,
      ring,
      hollow: false,
      opacity,
      behind: false,
      appearAt: Math.min(1, p.x / width),
    });
  };

  const iGather = at(gather);
  const iTurn = at(turn);
  add("e0", null, 0, spline(master, 0, iGather), master.slice(0, iGather + 1),
    shape.trunkWidth * 0.94, 0.86);
  add("trunk", "e0", 0, spline(master, iGather, iTurn), master.slice(iGather, iTurn + 1),
    shape.trunkWidth, 0.9);
  add("d0", "trunk", 0, spline(master, iTurn, master.length - 1), master.slice(iTurn),
    shape.trunkWidth * 0.94, 0.88);
  node("e0", gather, "junction", shape.trunkWidth * 1.6, 0.8);
  node("d0", turn, "junction", shape.trunkWidth * 2.4, 0.95, chance(rng, 0.4));

  /* ---- 4. the other entries, joining the branch on its heading -------- */

  stations
    .filter((s) => s.kind === "merge")
    .forEach((merge) => {
      const k = merge.ref as number;
      const entry = entries[k];
      const pts = refine(rng, entryPoints(entry.x, entry.inlet, merge), shape.wobble);
      // The branch's next point as the last neighbour: it arrives running
      // the same way the branch does, like a strand joining a road.
      const next = master[at(merge) + 1];
      add(`e${k}`, null, 0, spline([...pts, next], 0, pts.length - 1), pts,
        shape.trunkWidth * 0.9, 0.84);
      node(`e${k}`, merge, "junction", shape.trunkWidth * (k === 1 ? 2.4 : 2), 0.9, k === 1);
    });

  /* ---- 5. the six stems — each card arises from the branch ------------ */

  stations
    .filter((s) => s.kind === "stem")
    .forEach((stem) => {
      const i = stem.ref as number;
      const card = cards[i];
      const side = sideOf(i);
      const iStem = at(stem);
      const prev = master[iStem - 1];
      const next = master[iStem + 1];
      const len = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
      const edge = side > 0 ? card.y : card.y + card.height;
      // It lands a little INSIDE the card's edge and vanishes under it, so
      // the card reads as growing on the stem, with no endpoint showing.
      const landing: Point = { x: card.x + card.width * 0.36, y: edge + side * 12 };
      const pts: Point[] = [
        stem,
        {
          x: stem.x + ((next.x - prev.x) / len) * 26,
          y: stem.y + ((next.y - prev.y) / len) * 26 + side * 6,
        },
        { x: landing.x - card.width * 0.05, y: edge - side * 7 },
        landing,
      ];
      add(`card-${i}`, "trunk", 1, spline([prev, ...pts], 1, pts.length), pts,
        shape.trunkWidth * 0.66, 0.72);
      node(`card-${i}`, stem, "junction", range(rng, 2.6, 3.6), range(rng, 0.85, 1),
        chance(rng, 0.3));
    });

  /* ---- 6. the other descents, out of the last screen ------------------ */

  const descent = (id: string, from: Station, exitX: number, over: number) => {
    const end: Point = { x: exitX, y: height + over };
    const pts = refine(
      rng,
      [
        from,
        { x: from.x + 10, y: lerp(from.y, height, 0.3) },
        { x: end.x + jit(4), y: lerp(from.y, height, 0.7) },
        end,
      ],
      // Committed, calm descents — the organism resolving into the page.
      shape.wobble * 0.7,
    );
    add(id, "trunk", 0, spline([master[at(from) - 1], ...pts], 1, pts.length), pts,
      shape.trunkWidth * 0.94, 0.88);
  };

  if (count >= 2) descent("d1", turn, exitXs[1], 40);
  if (early && count >= 3) {
    descent("d2", early, exitXs[2], 36);
    node("d2", early, "junction", shape.trunkWidth * 2.1, 0.9);
  }

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
