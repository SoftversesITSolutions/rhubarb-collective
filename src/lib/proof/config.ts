/**
 * SECTION 06 — THE PROOF
 *
 * Why anyone should trust Rhubarb. Section 3 shows what the collective makes,
 * Section 4 what it does and Section 5 who it is; this field is about the
 * relationships those three rest on.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS VERIFIED, AND WHAT IS NOT
 * ─────────────────────────────────────────────────────────────────────────────
 * TESTIMONIALS DO NOT EXIST YET. Every supplied document was read for them —
 * the approved homepage copy ("Rhubarb Website Homepage Content"), the
 * case-study deck ("Case Studies 2026 — Rhubarb Collective", all 18 pages) and
 * the brand guidelines — and none of them contains a client quote, a named
 * client spokesperson, a result, a metric or an award. So `quote`, `person` and
 * `role` are `null` on every item below and nothing is written in their place.
 * A plausible-sounding testimonial is the one thing this section must never
 * ship, and a placeholder string in this file is exactly how one would.
 *
 * CLIENT LOGOS DO NOT EXIST EITHER. The bundle holds Rhubarb's own logo and
 * nothing else; no client mark is present in any form. None is redrawn from
 * memory, substituted with set type, or fetched from a third-party logo pack.
 * `logo` is `null` throughout and the composition is built so that a logo
 * wall was never the shape it needed.
 *
 * WHAT IS REAL is the relationship itself. Every client name, descriptor,
 * engagement and stated timeframe below is transcribed from Rhubarb's own
 * case-study deck, with the source page recorded on each item. Where the deck
 * states no timeframe, `term` is null rather than estimated.
 *
 * TO GO LIVE, fill in `quote` (and `person`/`role` where the client attributes
 * it) on the items that have one. The renderer already handles quote-only,
 * quote + client, and quote + person + role, and promotes the quote to the
 * display face the moment one exists. No component, stylesheet or timeline
 * needs to be touched.
 */

/** A supplied client mark. Never reconstructed — see the file header. */
export interface LogoAsset {
  /** Path under `public/`. */
  src: string;
  /** Intrinsic pixel size, so the mark keeps its supplied proportions. */
  width: number;
  height: number;
  /** The client's name as the mark sets it. Carries the identity for AT. */
  alt: string;
}

/** A supplied photograph — a portrait, a collaboration shot, a brand artifact. */
export interface ProofImageAsset {
  src: string;
  width: number;
  height: number;
  /** Describes what is visibly in the frame. Never a claim about the client. */
  alt: string;
  /** Frame proportion. Falls back to the asset's own ratio when omitted. */
  ratio?: [number, number];
}

/**
 * Placement token. The field is art-directed per item rather than generated;
 * these map to the rules in proof.css. There is deliberately no repeating
 * pattern and no shared height — a rule that placed all five the same way would
 * be the testimonial-card grid this section exists to avoid.
 */
export type ProofSlot = "lead" | "counter" | "aside" | "drift-a" | "drift-b";

/** Weight in the composition. Drives type scale and measure, not styling. */
export type ProofSize = "lead" | "major" | "minor";

export interface ProofItem {
  id: string;
  /** Client name, exactly as the case-study deck titles it. */
  client: string;
  /** What that client is, in the deck's words. Null where it states none. */
  descriptor: string | null;
  /** The nature of the engagement, in the deck's words. */
  relationship: string | null;
  /** A stated timeline or timeframe. Null unless the deck states one. */
  term: string | null;

  /* ---- awaiting the client. See the file header. ---- */
  /** Verbatim client statement. Null until one is actually supplied. */
  quote: string | null;
  /** Who said it. Only ever set alongside a real quote. */
  person: string | null;
  /** Their role. Only ever set alongside a real person. */
  role: string | null;
  /** Supplied client mark. */
  logo: LogoAsset | null;
  /** Supplied photograph. */
  image: ProofImageAsset | null;

  /** Page of the case-study deck the verified fields came from. */
  sourcePage: number;
  slot: ProofSlot;
  size: ProofSize;
  /**
   * Whether this item may take a short connective strand from the nearest real
   * junction. Never a leader line: the strand only exists where a junction has
   * genuinely grown within reach. The rest are related to the network by
   * proximity alone, which is the point — not every relationship is a line.
   */
  node: boolean;
}

export const PROOF_ITEMS: ProofItem[] = [
  {
    id: "embassy",
    client: "Italian Embassy Cultural Centre",
    descriptor: "Italian Embassy India Cultural Centre",
    relationship:
      "Complete website redesign, creative direction and visual assets, and a full revamp of the Membership & Language Student portal.",
    term: "4 – 5 months · 4 website modules, 9 portal development modules",
    quote: null,
    person: null,
    role: null,
    logo: null,
    image: null,
    sourcePage: 6,
    slot: "lead",
    size: "lead",
    node: true,
  },
  {
    id: "sitar",
    client: "Himalayan Sitar Gurukul",
    descriptor: "Pandit Abhishek Adhikary & Dr Murchana Adhikary Barthakur",
    relationship:
      "A collaboration with Hindustani classical sitar artistes, educators, composers and researchers — on their portfolio website, their branding, and the creative brainstorming that became the Gurukul itself.",
    term: "Ongoing marketing partnership",
    quote: null,
    person: null,
    role: null,
    logo: null,
    image: null,
    sourcePage: 10,
    slot: "counter",
    size: "major",
    node: true,
  },
  {
    id: "dietxp",
    client: "DietXP",
    descriptor: "Science-backed nutrition",
    relationship:
      "A collaboration with a digital-first health and wellness brand built by local nutritionists and engineers: brand identity, a social media ecosystem, and the landing page experience.",
    term: null,
    quote: null,
    person: null,
    role: null,
    logo: null,
    image: null,
    sourcePage: 13,
    slot: "aside",
    size: "major",
    node: true,
  },
  {
    id: "kismat",
    client: "Cakes by Kismat",
    descriptor: "Bakery based in Sydney, Australia",
    relationship:
      "A logo revamp with a fresh colour palette, and a design and typography system to carry it.",
    term: null,
    quote: null,
    person: null,
    role: null,
    logo: null,
    image: null,
    sourcePage: 12,
    slot: "drift-a",
    size: "minor",
    node: false,
  },
  {
    id: "ritam",
    client: "Ritam",
    descriptor: "Organic honey & beekeeping",
    relationship:
      "A hand-drawn logo style and symbol system, and ongoing work across packaging, print collateral, digital assets and the website.",
    term: null,
    quote: null,
    person: null,
    role: null,
    logo: null,
    image: null,
    sourcePage: 16,
    slot: "drift-b",
    size: "minor",
    node: false,
  },
];

/**
 * The section's words, isolated from every renderer so they can be replaced
 * without opening a component.
 *
 * The heading, standfirst and introduction are the client's approved copy for
 * this exact section — "Our Experience" in "Rhubarb Website Homepage Content" —
 * quoted verbatim, curly quotes and all. Nothing is written for them, and the
 * section deliberately carries no marketing statement of its own.
 *
 * `index` continues the page's own 01 / 02 / 03 / 04 marker run rather than the
 * build order; the hero is unnumbered, so the on-page markers sit one behind the
 * section numbers.
 */
export const PROOF_COPY = {
  index: "05",
  marker: "The proof",
  heading: "Our Experience",
  standfirst: "Brands that trust us for our “no-fluff” attitude",
  intro:
    "We have worked with both global brands that have a lot at stake, and hyperlocal brands that are open to experimenting, and we love shifting between the two modes. Brands trust us because we deliver real results minus the fluff. The following brands show the range and mettle of our collective’s professional experience.",
} as const;

/**
 * Growth shape per tier.
 *
 * Calmer than Section 4 at every tier, and calmer again than Section 5: longer
 * unbranched runs, fewer offshoots, a steeper descent and a lighter stroke. The
 * organism is not growing here so much as arriving — it has reached the people
 * it was looking for, and the reading order is the quote first, the client
 * second, the network third.
 */
export interface ProofShape {
  /**
   * MAX UNBRANCHED DISTANCE, as fractions of the field width.
   *
   * The single most consequential number in this file. Section 5's proportions
   * ([0.20, 0.30] of a much taller field) applied here produced two enormous
   * smooth sweeps across the whole section — measured at 546px for one
   * unbranched run against 14 paths and 6 nodes in the entire 1440 field, which
   * reads as a decorative ribbon rather than as the organism. Bringing the runs
   * back to Section 4's desktop proportion resolves growth roughly twice as
   * often and restores the junction density the network is made of: 43 paths
   * and 29 nodes over the same field, with the longest run down to 360px.
   */
  runLength: [number, number];
  stepLength: number;
  offshootChance: number;
  baseWidth: number;
  /** Headroom above the stages needed to reach the foot of the field. */
  segmentHeadroom: number;
  /** How firmly a proof item pushes growth aside, 0..1. */
  itemStrength: number;
  /**
   * How far, and how hard, a line of type turns growth aside.
   *
   * The most surprising measurement in this section: WIDE FIELDS WANT A WEAK
   * COPY ZONE AND NARROW FIELDS WANT A STRONG ONE, and getting it backwards is
   * what produced the first version's tangled mat along the top edge.
   *
   * On a wide field the opening copy is a broad, low wall directly under the
   * inlets. A 96-unit influence reflects arriving trunks straight back up into
   * the top margin, where they mill: measured at 1440, 70% of the network's
   * whole length ended up inside the top fifth of the field, and one lone
   * strand carried the remaining four fifths. Dropping the influence to 44 lets
   * a trunk round the block instead of bouncing off it, and the distribution
   * evens out to 22/45/9/12/11 across the fifths (18/20/17/25/20 at 1920).
   *
   * On a 390 column the opposite holds. There is no route around a paragraph
   * there, so a wide, firm zone is what squeezes growth out into the margins
   * either side; weakening it to 44 pushed strands back through the type and
   * nearly doubled the length running over live glyphs (5.3% → 9.2%).
   */
  copyInfluence: number;
  copyStrength: number;
  /**
   * Least normalised distance between two entry points. Wider than Section 5's
   * 0.09 because this field takes fewer of them and they have to open it
   * across its width rather than arrive together.
   */
  inletSpacing: number;
  /**
   * Furthest a junction may sit from an item and still be connected to it, in
   * CSS pixels. Beyond this the item simply has no strand and belongs to the
   * network by proximity — inventing one would be the leader line this system
   * refuses to draw.
   */
  anchorReach: number;
}

export const PROOF_SHAPE: Record<"desktop" | "tablet" | "mobile", ProofShape> = {
  desktop: {
    runLength: [0.15, 0.23],
    stepLength: 26,
    offshootChance: 0.22,
    baseWidth: 1.1,
    segmentHeadroom: 8,
    itemStrength: 0.3,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.16,
    anchorReach: 190,
  },
  tablet: {
    // Longer than the desktop proportion rather than shorter. The 834 field is
    // the tallest of the four (2502px against 1873 at 1440), so the shorter
    // proportion spent its budget resolving 76 times on the way down and the
    // field came out busier than the section it is meant to calm from.
    runLength: [0.3, 0.42],
    stepLength: 26,
    offshootChance: 0.18,
    baseWidth: 1.1,
    segmentHeadroom: 8,
    itemStrength: 0.28,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.14,
    anchorReach: 155,
  },
  mobile: {
    runLength: [0.28, 0.4],
    stepLength: 24,
    offshootChance: 0.1,
    baseWidth: 1.2,
    segmentHeadroom: 5,
    itemStrength: 0.24,
    copyInfluence: 100,
    copyStrength: 0.7,
    inletSpacing: 0.2,
    anchorReach: 120,
  },
};

/**
 * Radians below horizontal a lateral run descends at.
 *
 * Per tier, because the fields are shaped very differently. A wide field is
 * short relative to its width, and a steep descent plunges a trunk through it
 * in a few stages — leaving one long diagonal thread and no network. The
 * shallower angle keeps a trunk inside the field for more stages, so it spreads
 * across the width and resolves into junctions on the way down. The 390 column
 * is the opposite shape and keeps the steeper angle: the network's job there is
 * to travel down the margin between two items, not across them.
 */
export const PROOF_DESCENT: Record<"desktop" | "tablet" | "mobile", [number, number]> = {
  desktop: [0.44, 0.68],
  tablet: [0.44, 0.68],
  mobile: [0.56, 0.82],
};

/**
 * Allowance for offshoots in the segment budget.
 *
 * `generateCascade` walks its queue breadth-first, so the budget is spent from
 * the top of the field down and every offshoot spends a segment a trunk stage
 * would otherwise have had. Budgeting exactly `inlets × stages` therefore
 * starves the deepest stages and the field ends short of its own foot. The
 * multiplier buys the trunks their full descent with the offshoots on top.
 */
export const SEGMENT_BUDGET_MULTIPLIER = 1.35;

/**
 * Ceiling on a proof item's repulsion radius, in CSS pixels, for the same
 * reason Section 5 caps a portrait's: influence derived from the destination's
 * own size turns a large block into a wall. A lead item is over 600px wide on
 * a 1920 field, and an uncapped `min(w, h) × 0.5` would stall the trunks in it.
 */
export const ITEM_INFLUENCE_CAP = 130;

/**
 * Entry points this field opens with, per tier.
 *
 * Lower than Section 5 everywhere, because this section reads as the network
 * settling rather than spreading — but not as low as it first looks like it
 * could be. Section 5's trunks reach the foot of its own field in a cluster on
 * the right at desktop widths (measured at 1440: the four deepest all land
 * between 0.71 and 0.86 of the width), so entering on those alone leaves the
 * left two-thirds of this field empty and every left-hand relationship
 * unconnected — 14 paths, 6 nodes and no anchors at all. Taking the next
 * deepest of Section 5's *own* trunks to make up the minimum reaches across
 * the field instead: 43 paths, 29 nodes, all three anchors. Nothing invented;
 * the top-up candidates are the same real geometry, just further up the field.
 */
export const MIN_INLETS: Record<"desktop" | "tablet" | "mobile", number> = {
  // Two, down from three: The Collective reliably lands two trunks ON the
  // seam, and its third-deepest ends hundreds of px above it. Two genuine
  // continuations beat three where one hangs in space — and this is the
  // calmest field on the page by design.
  desktop: 2,
  tablet: 2,
  mobile: 2,
};

export const MAX_INLETS: Record<"desktop" | "tablet" | "mobile", number> = {
  desktop: 2,
  tablet: 2,
  mobile: 2,
};
