/**
 * SECTION 07 — JOURNAL & CULTURE
 *
 * The homepage's last movement before the close, and the point where it stops
 * describing Rhubarb and opens outward: not what the collective sells, but what
 * it is curious about.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS VERIFIED, AND WHAT IS NOT
 * ─────────────────────────────────────────────────────────────────────────────
 * NO EDITORIAL EXISTS YET. Not one article, title, date, byline, excerpt, image
 * or URL is present anywhere in the supplied material — the approved homepage
 * copy, the project plan, the case-study deck and the brand guidelines were all
 * read for them. So `JOURNAL_ENTRIES` is empty, every position below resolves to
 * `null`, and nothing is written in their place. A section like this one is the
 * easiest place on a homepage to fabricate a plausible article, and a
 * placeholder title in this file is exactly how one would ship.
 *
 * `JOURNAL_ENTRIES` is the single list of published pieces for the whole site.
 * /insights renders all of it; these four positions take the first four. Adding
 * a piece there fills both.
 *
 * WHAT IS REAL is the section's own writing. `JOURNAL_COPY` is the client's
 * approved "Editorials/ Journals" copy, quoted verbatim from "Rhubarb Website
 * Homepage Content" — the standfirst, the paragraph and the note the client
 * wrote to set the tone of the space. That copy is genuinely the subject here,
 * which is why this section is typography-led rather than image-led.
 *
 * WHAT IS ALSO REAL is the direction. `JOURNAL_STRANDS` is the list of future
 * content areas from section 10 of the client's project plan ("Journal / Future
 * Content"), reproduced in the plan's own words and order. The plan calls them
 * *potential* areas for future phases, so they are rendered as forthcoming and
 * never as live categories — no counts, no filters, no links, nothing implying
 * a single piece of music or film exists behind them today.
 *
 * TO GO LIVE, set `entry` on a position. The renderer already handles every
 * shape the data can take — title only; title + category; with or without date,
 * excerpt, image and link — and promotes the position from its empty state to a
 * real editorial item the moment one exists. No component, stylesheet or
 * timeline needs to be touched, and the composition does not need redesigning
 * to accept images: see `JournalImageAsset`.
 */

/**
 * The strands this space is planned to carry.
 *
 * From the project plan, section 10. Note that the plan lists these as
 * *potential* future content areas, which is exactly how they are rendered —
 * see `JOURNAL_COPY.forthcoming`.
 */
export type JournalCategory =
  | "Journal"
  | "Music"
  | "Literature"
  | "Short documentaries"
  | "Concept art"
  | "Creative experiments"
  | "Cultural projects"
  | "Editorial content";

export const JOURNAL_STRANDS: readonly JournalCategory[] = [
  "Journal",
  "Music",
  "Literature",
  "Short documentaries",
  "Concept art",
  "Creative experiments",
  "Cultural projects",
  "Editorial content",
] as const;

/** A supplied editorial image — artwork, a documentary still, a photograph. */
export interface JournalImageAsset {
  /** Path under `public/`. */
  src: string;
  /** Intrinsic pixel size, so the asset keeps its supplied proportions. */
  width: number;
  height: number;
  /** Describes what is visibly in the frame. Never a claim about the piece. */
  alt: string;
  /** Frame proportion. Falls back to the asset's own ratio when omitted. */
  ratio?: [number, number];
}

/**
 * One published piece. Every field but `title` is optional, because a piece may
 * land before its image, its date or its route does.
 */
export interface JournalEntry {
  title: string;
  /** Which strand it belongs to. Omitted rather than guessed. */
  category?: JournalCategory;
  /** Display date, already formatted. Null where none is set. */
  date?: string | null;
  /**
   * The same date, machine-readable (YYYY-MM-DD), for `<time dateTime>`. Kept
   * separate from `date` because that one is a display string a writer sets by
   * hand, and deriving an ISO date by parsing it is how a piece ends up
   * announcing the wrong day. Null where only a display date is supplied — the
   * archive then emits a plain `<time>`, which is still correct.
   */
  iso?: string | null;
  /** Byline. Null where the piece is unsigned or the name is not yet supplied. */
  author?: string | null;
  excerpt?: string | null;
  image?: JournalImageAsset | null;
  /**
   * Where the piece lives. NULL UNTIL THE ROUTE ACTUALLY EXISTS — the item
   * renders as plain, non-interactive type rather than as a link to a 404. No
   * article routes are built yet, so this is null everywhere today.
   */
  href?: string | null;
}

/**
 * Placement token. The field is art-directed per position rather than
 * generated; these map to the rules in journal.css. There is deliberately no
 * repeating pattern and no shared height — a rule that placed all four the same
 * way would be the blog-card grid this section exists to avoid.
 */
export type JournalSlot = "feature" | "counter" | "aside" | "drift";

/** Weight in the composition. Drives type scale and measure, not styling. */
export type JournalSize = "feature" | "major" | "minor";

/**
 * A place in the field where an editorial sits — filled or not.
 *
 * The position exists independently of the piece, which is what lets the
 * composition be complete and honest at the same time: the field is real
 * architecture, and every slot in it is visibly waiting rather than faked.
 */
export interface JournalPosition {
  id: string;
  slot: JournalSlot;
  size: JournalSize;
  /**
   * Whether this position may take a short connective strand from the nearest
   * real junction. Never a leader line: the strand only exists where a junction
   * has genuinely grown within reach. The rest belong to the network by
   * proximity alone — the network connects ideas, not cards.
   */
  node: boolean;
  /** The published piece. Null until one actually exists. */
  entry: JournalEntry | null;
}

/**
 * EVERY PUBLISHED PIECE, IN PUBLICATION ORDER — newest first.
 *
 * THE ONE SOURCE OF TRUTH for editorial on this site. /insights renders this
 * whole list as its archive, and the four homepage positions below take the
 * first four of it, so a piece added here appears in both places and can never
 * say two different things in them.
 *
 * IT IS EMPTY, AND THAT IS THE ACCURATE STATE OF THE PROJECT. Not one article,
 * title, byline, date, excerpt, image or URL exists in any supplied material —
 * the approved homepage copy, the case-study deck, the brand guidelines and the
 * project plan were each read for them. The plan is explicit about why: section
 * 10 lists the strands as "potential future content areas" and says the initial
 * website should "establish a flexible foundation so these areas can be
 * incorporated in future phases". This list is that foundation.
 *
 * TO PUBLISH, add an entry. `title` is the only required field; category, date,
 * author, excerpt, image and href are each optional and each renders only when
 * present, on the homepage and in the archive alike. No component, stylesheet or
 * timeline needs to be touched, and /insights promotes itself out of its empty
 * state, derives its category filter and composes its grid from whatever is
 * here.
 */
export const JOURNAL_ENTRIES: JournalEntry[] = [];

/**
 * The homepage's four art-directed places in the editorial field.
 *
 * `entry` reads from `JOURNAL_ENTRIES` rather than being declared here, so the
 * homepage and the archive cannot drift apart. With the list empty every
 * position resolves to `null`, which is exactly what these four were declared
 * as before — this section renders identically today and fills itself the day a
 * piece is published.
 */
export const JOURNAL_POSITIONS: JournalPosition[] = [
  { id: "j1", slot: "feature", size: "feature", node: true, entry: JOURNAL_ENTRIES[0] ?? null },
  { id: "j2", slot: "counter", size: "major", node: true, entry: JOURNAL_ENTRIES[1] ?? null },
  { id: "j3", slot: "aside", size: "minor", node: false, entry: JOURNAL_ENTRIES[2] ?? null },
  { id: "j4", slot: "drift", size: "minor", node: false, entry: JOURNAL_ENTRIES[3] ?? null },
];

/**
 * The section's words, isolated from every renderer so they can be replaced
 * without opening a component.
 *
 * `standfirst`, `intro` and `note` are the client's approved copy for this exact
 * section — "Editorials/ Journals" in "Rhubarb Website Homepage Content" —
 * quoted verbatim, curly punctuation and all. Nothing is written for them.
 *
 * `heading` is the one word here that is not the client's: their document titles
 * the section "Editorials/ Journals", and the site sets it as "Journal &
 * Culture" to match the homepage stage the project plan names ("Journal /
 * Culture", plan section 3) and the wider space the plan describes. Swap this
 * one line to run the client's own title instead — nothing else depends on it.
 *
 * `index` continues the page's own 01 / 02 / 03 / 04 / 05 marker run rather than
 * the build order; the hero is unnumbered, so the on-page markers sit one behind
 * the section numbers.
 */
export const JOURNAL_COPY = {
  index: "06",
  marker: "Journal & Culture",
  heading: "Journal & Culture",
  standfirst: "Stories, Insights, and Musings",
  intro:
    "This is the space where our interval discussions find a platform. From origin stories, philosophical musings, to uncomfortable political stances and real-world insights, this is where the organic mess of our minds find some semblance of coherence.",
  note: "Note: not SEO-friendly blogs, enter if you’re comfortable exploring non-linear narratives and curveballs disguised as insights.",
  /**
   * Label for the strand list. The wording carries the plan's own tense — these
   * are areas the space is *planned* to grow into, and the label has to say so,
   * because a bare list of eight categories under a journal heading reads as
   * eight sections that already have something in them.
   */
  forthcoming: "The space is being built to carry",
  /** The empty state of a position. Structural, not an editorial claim. */
  unwritten: "Unwritten",
} as const;

/**
 * Growth shape per tier.
 *
 * The calmest field on the page. Section 6 had already settled the organism;
 * here it spreads sideways rather than pushing on, which is the whole reading of
 * the section — an ecosystem connecting ideas, not wires connecting cards. So:
 * longer unbranched runs than any section above (growth travels before it
 * resolves), the lowest offshoot rate on the page, and the lightest stroke.
 */
export interface JournalShape {
  /**
   * MAX UNBRANCHED DISTANCE, as fractions of the field width. Longer than
   * Section 6's at every tier: this section is the one place lateral travel is
   * the point, and shorter runs resolve growth into a busy mat rather than
   * letting it cross the field.
   */
  runLength: [number, number];
  stepLength: number;
  offshootChance: number;
  baseWidth: number;
  /** Headroom above the stages needed to reach the foot of the field. */
  segmentHeadroom: number;
  /** How firmly an editorial position pushes growth aside, 0..1. */
  itemStrength: number;
  /**
   * How far, and how hard, a line of type turns growth aside.
   *
   * Carried over from Section 6 with its inversion intact — WIDE FIELDS WANT A
   * WEAK COPY ZONE AND NARROW FIELDS WANT A STRONG ONE. On a wide field the
   * opening copy is a low wall directly under the inlets and a large influence
   * reflects arriving trunks back up into the top margin; on a 390 column there
   * is no route around a paragraph, so only a wide firm zone squeezes growth out
   * into the margins either side.
   */
  copyInfluence: number;
  copyStrength: number;
  /** Least normalised distance between two entry points. */
  inletSpacing: number;
  /**
   * Furthest a junction may sit from a position and still be connected to it,
   * in CSS pixels. Beyond this the position simply has no strand and belongs to
   * the network by proximity — inventing one would be the leader line this
   * system refuses to draw.
   */
  anchorReach: number;
}

export const JOURNAL_SHAPE: Record<"desktop" | "tablet" | "mobile", JournalShape> = {
  desktop: {
    runLength: [0.19, 0.28],
    stepLength: 26,
    offshootChance: 0.18,
    baseWidth: 1.05,
    segmentHeadroom: 8,
    itemStrength: 0.28,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.15,
    anchorReach: 190,
  },
  tablet: {
    runLength: [0.32, 0.44],
    stepLength: 26,
    offshootChance: 0.16,
    baseWidth: 1.05,
    segmentHeadroom: 8,
    itemStrength: 0.26,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.14,
    anchorReach: 155,
  },
  mobile: {
    runLength: [0.3, 0.42],
    stepLength: 24,
    offshootChance: 0.1,
    baseWidth: 1.15,
    segmentHeadroom: 5,
    itemStrength: 0.22,
    copyInfluence: 100,
    copyStrength: 0.7,
    inletSpacing: 0.2,
    anchorReach: 120,
  },
};

/**
 * Radians below horizontal a lateral run descends at.
 *
 * Shallower than Section 6 on the wide tiers. This is the last field the
 * organism crosses on the homepage, and it should be seen travelling across it
 * rather than dropping through it; the shallower angle keeps a trunk inside the
 * field for more stages, so it spreads across the width and resolves into
 * junctions on the way down. The 390 column keeps the steeper angle for the
 * usual reason: the network's job there is to travel down the margin beside the
 * items, not across them.
 */
export const JOURNAL_DESCENT: Record<"desktop" | "tablet" | "mobile", [number, number]> = {
  desktop: [0.4, 0.62],
  tablet: [0.42, 0.66],
  mobile: [0.56, 0.82],
};

/**
 * Allowance for offshoots in the segment budget.
 *
 * `generateCascade` walks its queue breadth-first, so the budget is spent from
 * the top of the field down and every offshoot spends a segment a trunk stage
 * would otherwise have had. Budgeting exactly `inlets × stages` therefore
 * starves the deepest stages and the field ends short of its own foot.
 */
export const SEGMENT_BUDGET_MULTIPLIER = 1.35;

/**
 * Ceiling on an editorial position's repulsion radius, in CSS pixels, for the
 * same reason Section 6 caps a proof item's: influence derived from the
 * destination's own size turns a large block into a wall, and the feature
 * position is the largest block in any field on this page.
 */
export const ITEM_INFLUENCE_CAP = 130;

/**
 * Entry points this field opens with, per tier.
 *
 * Matched to Section 6's, so the seam carries the same number of strands across
 * it that arrived at it. Fewer would leave the widest field on the page opening
 * from a single point; more would have to be invented, since Section 6 does not
 * produce them.
 */
  // Mobile carries ONE spine: the 390 column cannot land two spread trunks
  // on the seam reliably, and one true continuation beats two where one
  // hangs mid-air. The wide tiers keep the pair.
export const MIN_INLETS: Record<"desktop" | "tablet" | "mobile", number> = {
  desktop: 2,
  tablet: 2,
  mobile: 1,
};

export const MAX_INLETS: Record<"desktop" | "tablet" | "mobile", number> = {
  desktop: 2,
  tablet: 2,
  mobile: 1,
};
