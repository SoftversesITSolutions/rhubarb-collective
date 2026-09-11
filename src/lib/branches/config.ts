/**
 * SECTION 04 — THE BRANCHES
 *
 * The collective branching into its six disciplines. Content and composition
 * live here; nothing in this file renders and nothing in the renderers decides
 * where a card sits.
 *
 * Card wording is supplied verbatim. Nothing is embellished, and no claim,
 * metric or extra service is added.
 */

export interface Service {
  /** Editorial index, shown as given. */
  index: string;
  title: string;
  detail: string;
  /**
   * Art-directed placement. These map to the grid rules in branches.css —
   * six hand-chosen positions on a descending left-to-right staircase, because
   * this section is the page's change of direction: the organism stops falling
   * and travels ACROSS the composition, and the cards are the stations it
   * passes through on the way.
   */
  slot: "a" | "b" | "c" | "d" | "e" | "f";
}

export const SERVICES: Service[] = [
  { index: "01", title: "Branding Identity", detail: "Research & Design", slot: "a" },
  { index: "02", title: "Brand Communication", detail: "Campaigns & PR", slot: "b" },
  { index: "03", title: "Social Media", detail: "Strategy & Management", slot: "c" },
  { index: "04", title: "Website Development", detail: "Development & SEO", slot: "d" },
  {
    index: "05",
    title: "Creative Photography",
    detail: "& Video Production",
    slot: "e",
  },
  { index: "06", title: "Consulting", detail: "& Brand Audits", slot: "f" },
];

/**
 * Shape of the lateral journey per tier.
 *
 * Unlike the cascade sections above and below it, this section's macro path is
 * ART-DIRECTED, not emergent: one trunk, six connections, a resolution into
 * three descents. The seeded randomness only supplies micro-curvature, so
 * these numbers describe standoffs and texture, not probabilities.
 */
export interface LateralShape {
  /** Horizontal standoff the trunk keeps from a card's edge, px. */
  clearance: number;
  /** Vertical standoff above/below a card, px. */
  drop: number;
  /** Waypoint jitter amplitude, px. */
  jitter: number;
  /** Perpendicular noise added when a span is refined, px. */
  wobble: number;
  /** Stroke width of the main trunk. Heavier than the cascades on purpose —
      this is the page's one LEVEL-1 path made visible. */
  trunkWidth: number;
  /** Micro offshoots thrown into negative space. Extremely sparing. */
  twigCount: number;
}

export const LATERAL_SHAPE: Record<"desktop" | "tablet" | "mobile", LateralShape> = {
  desktop: {
    clearance: 46,
    drop: 34,
    jitter: 20,
    wobble: 15,
    trunkWidth: 1.5,
    twigCount: 3,
  },
  tablet: {
    clearance: 36,
    drop: 28,
    jitter: 16,
    wobble: 13,
    trunkWidth: 1.45,
    twigCount: 2,
  },
  mobile: {
    clearance: 18,
    drop: 18,
    jitter: 9,
    wobble: 8,
    trunkWidth: 1.5,
    twigCount: 1,
  },
};
