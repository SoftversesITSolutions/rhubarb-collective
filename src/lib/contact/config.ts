/**
 * SECTION 08 — CONTACT / ROUTES
 *
 * The last field on the page, and the only one that points off it. Everything
 * above establishes what Rhubarb is, makes, does, who makes it, why it can be
 * trusted and what it is curious about; this one answers where to go next.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERYTHING HERE IS THE CLIENT'S OWN
 * ─────────────────────────────────────────────────────────────────────────────
 * Every string below is transcribed from the client's approved footer copy in
 * "Rhubarb Website Homepage Content" — the closing statement, the invitation,
 * both email addresses, the phone number, the company name, the GSTIN and the
 * address, exactly as supplied and in the client's own capitalisation.
 *
 * NOTHING IS ADDED. No social handles, no second office, no map link, no
 * availability or response-time claim, no "let's talk" line written for them.
 *
 * NO WHATSAPP LINK. The client labels the number "Phone/ Whatsapp", which is a
 * statement about the number rather than a destination — no wa.me URL, deep
 * link or WhatsApp Business id exists anywhere in the supplied material, and the
 * project has no canonical WhatsApp destination to reuse. So the label carries
 * the client's own wording and the route links to `tel:` only. Constructing a
 * wa.me URL from the phone number would be inventing a destination.
 *
 * THE CONTACT FORM DOES NOT LIVE HERE. /contact now carries one, but it is
 * additive: it did not take a route, a value or a line of copy from this file,
 * and this section renders exactly what it always did on every route. Its
 * fields, options and submission seam are in `lib/contact/enquiry`, and it
 * still obeys the rule this file set — a form that silently discards an enquiry
 * is worse than an address that works, so that one never reports a delivery it
 * did not make.
 */

/**
 * Placement token. The composition is art-directed per route rather than
 * generated; these map to the rules in contact.css. No two routes share a
 * width, a baseline or a weight, because a rule that placed all four the same
 * way would be the boxed contact card this section exists to avoid.
 */
export type ContactSlot = "primary" | "counter" | "aside" | "drift";

/** Weight in the composition. Drives type scale and measure, not styling. */
export type ContactSize = "major" | "minor";

export interface ContactRoute {
  id: string;
  /** The kind of route, in the client's own words where they name it. */
  label: string;
  /** The destination itself — the thing worth reading. */
  value: string;
  /** A second line, where the destination genuinely has one. */
  detail: string | null;
  /**
   * Where it goes. NULL where the route is a place rather than an action: the
   * address is not a link, because no map URL was supplied and guessing one is
   * inventing a destination.
   */
  href: string | null;
  slot: ContactSlot;
  size: ContactSize;
  /**
   * Whether this route may take a short connective strand from the nearest real
   * junction. Never a leader line: the strand only exists where a junction has
   * genuinely grown within reach.
   */
  node: boolean;
}

/**
 * SOURCE ORDER IS THE MOBILE READING ORDER — email, business, phone, location —
 * because that is the order the narrow column presents them in and DOM order is
 * what a screen reader and the tab sequence follow. The wide tiers place them
 * asymmetrically with explicit grid rows rather than by reordering, so the
 * reading order never diverges from the visual one in a way that matters.
 */
export const CONTACT_ROUTES: ContactRoute[] = [
  {
    id: "email",
    label: "Email",
    value: "wearerhubarb@gmail.com",
    detail: null,
    href: "mailto:wearerhubarb@gmail.com",
    slot: "primary",
    size: "major",
    node: true,
  },
  {
    id: "business",
    label: "Business",
    value: "Contact@rhubarbcollective.com",
    detail: null,
    href: "mailto:Contact@rhubarbcollective.com",
    slot: "aside",
    size: "minor",
    node: true,
  },
  {
    id: "phone",
    // The client's own label for this number. It is not a WhatsApp link — see
    // the file header.
    label: "Phone / WhatsApp",
    value: "+91 99900 16866",
    detail: null,
    href: "tel:+919990016866",
    slot: "counter",
    size: "major",
    node: true,
  },
  {
    id: "location",
    label: "Location",
    value: "Dehradun, Uttarakhand",
    detail: "India",
    // Deliberately not a link. No map URL was supplied.
    href: null,
    slot: "drift",
    size: "minor",
    node: false,
  },
];

/**
 * The section's words, isolated from every renderer so they can be replaced
 * without opening a component.
 *
 * `statement` and `invitation` are the client's approved footer copy, quoted
 * verbatim ("Text > We make brands harder to ignore. Connect with us."). The
 * full stop on the statement is the client's.
 *
 * `index` continues the page's own 01 / 02 / 03 / 04 / 05 / 06 marker run rather
 * than the build order; the hero is unnumbered, so the on-page markers sit one
 * behind the section numbers.
 */
export const CONTACT_COPY = {
  index: "07",
  marker: "Contact / Routes",
  statement: "We make brands harder to ignore.",
  /**
   * The same sentence, broken where the composition breaks it. Joining these
   * with a single space reproduces `statement` exactly — the break is a
   * typographic decision about this one section, not an edit to the client's
   * words, and it lives here rather than in the component so the copy stays in
   * one place.
   */
  statementLines: ["We make brands", "harder to ignore."],
  invitation: "Connect with us.",
} as const;

/**
 * The registered entity, its address and its tax registration, exactly as
 * supplied. Supporting information — it belongs at the foot of the ecosystem,
 * not among the routes, and the GSTIN is the quietest line on the page.
 */
export const CONTACT_COLOPHON = {
  company: "Rhubarb Collective Private Limited",
  /** The postal address, line by line as the client sets it. */
  address: [
    "Rhubarb Collective Pvt. Ltd.",
    "Khata no. 00130, Bharatwala,",
    "Bisht Gaon,",
    "Dehradun, Uttarakhand,",
    "248003, India",
  ],
  gstinLabel: "GSTIN",
  gstin: "05AAPCR4175D1ZA",
} as const;

/**
 * Growth shape per tier.
 *
 * THE SIMPLEST FIELD ON THE PAGE, and deliberately so: the organism has arrived,
 * and the section's job is to resolve into a few outward routes rather than to
 * keep exploring. So this field takes the fewest entry points anywhere (see
 * `MAX_INLETS`), runs the longest unbranched distances, throws the fewest
 * offshoots and draws the lightest stroke. Complexity reduces as the page ends.
 */
export interface ContactShape {
  /**
   * MAX UNBRANCHED DISTANCE, as fractions of the field width. The longest on the
   * page. A run that resolves rarely is what reads as a route travelling
   * somewhere, where a run that resolves often reads as a network still
   * searching — which is the section above's job, not this one's.
   */
  runLength: [number, number];
  stepLength: number;
  offshootChance: number;
  baseWidth: number;
  /** Headroom above the stages needed to reach the foot of the field. */
  segmentHeadroom: number;
  /** How firmly a route pushes growth aside, 0..1. */
  itemStrength: number;
  /**
   * How far, and how hard, a line of type turns growth aside.
   *
   * Carried over from Sections 6 and 7 with its inversion intact — WIDE FIELDS
   * WANT A WEAK COPY ZONE AND NARROW FIELDS WANT A STRONG ONE. The closing
   * statement is the largest block of display type on the page below the hero,
   * so on a wide field a large influence would reflect arriving trunks straight
   * back up into the top margin; on a 390 column only a wide, firm zone squeezes
   * growth out into the margins either side of it.
   */
  copyInfluence: number;
  copyStrength: number;
  /** Least normalised distance between two entry points. */
  inletSpacing: number;
  /**
   * Furthest a junction may sit from a route and still be connected to it, in
   * CSS pixels. Beyond this the route simply has no strand and belongs to the
   * network by proximity — inventing one would be the leader line this system
   * refuses to draw, and this section is the one most tempted to draw them.
   */
  anchorReach: number;
}

export const CONTACT_SHAPE: Record<"desktop" | "tablet" | "mobile", ContactShape> = {
  desktop: {
    runLength: [0.22, 0.32],
    stepLength: 26,
    offshootChance: 0.14,
    baseWidth: 0.95,
    segmentHeadroom: 6,
    itemStrength: 0.26,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.18,
    anchorReach: 180,
  },
  tablet: {
    runLength: [0.34, 0.46],
    stepLength: 26,
    offshootChance: 0.12,
    baseWidth: 0.95,
    segmentHeadroom: 6,
    itemStrength: 0.24,
    copyInfluence: 44,
    copyStrength: 0.42,
    inletSpacing: 0.16,
    anchorReach: 150,
  },
  mobile: {
    runLength: [0.32, 0.44],
    stepLength: 24,
    offshootChance: 0.08,
    baseWidth: 1.05,
    segmentHeadroom: 4,
    itemStrength: 0.2,
    copyInfluence: 100,
    copyStrength: 0.7,
    inletSpacing: 0.22,
    anchorReach: 115,
  },
};

/**
 * Radians below horizontal a lateral run descends at.
 *
 * The shallowest on the page at the wide tiers. This field is short by design
 * (see the height note in contact.css), and a steep descent would drop a trunk
 * through it in two stages and out of the bottom of the document without ever
 * travelling between the routes. The shallow angle is what lets the last of the
 * organism spread across the closing composition instead of falling past it.
 */
export const CONTACT_DESCENT: Record<"desktop" | "tablet" | "mobile", [number, number]> = {
  desktop: [0.34, 0.54],
  tablet: [0.38, 0.6],
  mobile: [0.54, 0.8],
};

/**
 * Allowance for offshoots in the segment budget.
 *
 * `generateCascade` walks its queue breadth-first, so the budget is spent from
 * the top of the field down and every offshoot spends a segment a trunk stage
 * would otherwise have had.
 */
export const SEGMENT_BUDGET_MULTIPLIER = 1.35;

/**
 * Ceiling on a route's repulsion radius, in CSS pixels, for the same reason
 * every section above caps its destinations': influence derived from the
 * destination's own size turns a large block into a wall.
 */
export const ITEM_INFLUENCE_CAP = 120;

/**
 * Entry points this field opens with, per tier.
 *
 * THE FEWEST ON THE PAGE — two everywhere, against three in Sections 6 and 7.
 * This is the visible convergence the section is built around: more of the
 * organism arrives at this seam than crosses it, and the strands that do cross
 * are the deepest of Section 7's own trunks. Nothing is discarded that the
 * generator would otherwise have drawn here, and nothing is topped up: taking
 * fewer real exits is a choice about this field, not an invention.
 */
  // Mobile resolves to ONE final strand — the convergence this section is
  // built around, taken all the way down at the width where a second strand
  // could not land honestly anyway.
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

/* ------------------------------------------------------------------ *
 * THE BLOOM — client note 8 (Sep 2026)
 * ------------------------------------------------------------------ */

/**
 * "In this section we should use the 3D visual of the sunflower that we use
 * as a brand element. With some animation; rotate it, swirl it through the
 * scroll-down."
 *
 * The bundle holds no 3D sunflower — only a flat cutout photograph — so the
 * model is "Sunflower" by Polygonal Miniatures on Sketchfab, a photoscan of a
 * real flower head under CC BY 4.0, chosen by Akhil on 28 Sep 2026.
 * Attribution is a condition of that licence, so the credit below is rendered
 * wherever the bloom is.
 *
 * The turn is rendered ONCE, offline (`tools/sunflower-frames`), into a fixed
 * run of frames: from the back of the head, through edge-on, to face-on. No 3D
 * runtime ships with the site, and a frame index scrubbed against scroll is
 * exactly reversible, which is the standard every reveal on the page meets.
 */
export const BLOOM = {
  /** Frames in the run; the last is face-on and doubles as the still. */
  frames: 41,
  src: (i: number) => `/assets/brand/sunflower/turn-${String(i).padStart(2, "0")}.webp`,
  /** Frame edge, px. Square, transparent. */
  size: 1024,
  alt: "A sunflower head, seen turning from behind to face the reader.",
  /**
   * Fraction of the frame's edge the flower spans. The network treats the disc
   * inscribed in that span as the destination, so a strand that reaches it
   * ends under the petals rather than beside them.
   */
  fill: 0.9,
  credit: {
    label: "Sunflower model",
    title: "Sunflower",
    modelHref: "https://sketchfab.com/3d-models/sunflower-569a71ccf4d94c1585c9573521fb998f",
    author: "Polygonal Miniatures",
    authorHref: "https://sketchfab.com/Polygonal_Miniatures",
    licence: "CC BY 4.0",
    licenceHref: "https://creativecommons.org/licenses/by/4.0/",
  },
} as const;

/**
 * How the bloom moves, as fractions of the section's scroll window and
 * degrees. The turn (frame index) and the swirl (in-plane rotation) are two
 * different axes: the frames carry the out-of-plane turn that only the model
 * can give, and the swirl is a plain CSS rotation of the whole figure, which
 * costs nothing and reverses for free.
 */
export const BLOOM_MOTION = {
  /** The turn reaches face-on here and holds, so the face is settled before the routes are read. */
  turnEnd: 0.62,
  /** In-plane rotation at the start of the window, degrees, easing to 0 by `swirlEnd`. */
  swirl: -75,
  swirlEnd: 0.8,
  /** Scale at the start of the window, easing to 1 by `swirlEnd`. */
  scaleFrom: 0.84,
  /** The figure fades up over the first stretch of the window. */
  fadeEnd: 0.16,
} as const;
