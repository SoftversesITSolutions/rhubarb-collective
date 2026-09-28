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

/**
 * The image printed into a card (client note 7, Sep 2026).
 *
 * Rendered as ink on the card's cream at low opacity, never as a photograph
 * in its own right, so the card stays the editorial object it was. Everything
 * here is the client's own material: casework is filed under a discipline
 * only where the case-study deck itself puts that client under it — the same
 * evidence table the services page uses — and where the deck gives no
 * casework for a discipline the card carries Rhubarb's brand imagery instead.
 * When the client supplies a photograph per service, it drops in here.
 */
export interface ServicePrint {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position: where the crop settles when the card is narrower than the image. */
  focal: string;
  /** Casework filed by the deck, or Rhubarb's brand material standing in. */
  basis: "casework" | "brand";
}

export interface Service {
  /** Editorial index, shown as given. */
  index: string;
  title: string;
  detail: string;
  print: ServicePrint;
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
  {
    index: "01",
    title: "Branding Identity",
    detail: "Research & Design",
    slot: "a",
    // Deck p.17: Ritam — "a hand-drawn logo style and symbol system".
    print: {
      src: "/assets/work/ritam-packaging.webp",
      alt: "Ritam packaging range — honey jar, kraft cartons, swing tags and stationery.",
      width: 1600,
      height: 925,
      focal: "50% 50%",
      basis: "casework",
    },
  },
  {
    index: "02",
    title: "Brand Communication",
    detail: "Campaigns & PR",
    slot: "b",
    // The deck describes no campaign or PR engagement, so this is Rhubarb's
    // own socials poster — brand material, not a case study.
    print: {
      src: "/assets/brand/socials-halftone.webp",
      alt: "Rhubarb Collective socials poster in halftone.",
      width: 864,
      height: 1080,
      focal: "50% 38%",
      basis: "brand",
    },
  },
  {
    index: "03",
    title: "Social Media",
    detail: "Strategy & Management",
    slot: "c",
    // Deck p.15: DietXP — "a social media ecosystem".
    print: {
      src: "/assets/work/dietxp-report.webp",
      alt: "DietXP social campaign creative titled “The Indian Health Report”.",
      width: 835,
      height: 1021,
      // The creative's own display type fills its upper half; the lower band
      // is the street scene, and what lettering remains falls where the mask
      // is faintest.
      focal: "50% 100%",
      basis: "casework",
    },
  },
  {
    index: "04",
    title: "Website Development",
    detail: "Development & SEO",
    slot: "d",
    // Deck p.8: Italian Embassy Cultural Centre — "complete website redesign".
    print: {
      src: "/assets/work/embassy-banner.webp",
      alt: "Website banner for the Italian Embassy Cultural Centre.",
      width: 1558,
      height: 734,
      // The banner's headline fills its left half; the right half is the
      // still life, which is what a card this shape shows.
      focal: "100% 50%",
      basis: "casework",
    },
  },
  {
    index: "05",
    title: "Creative Photography",
    detail: "& Video Production",
    slot: "e",
    // No shoot or film engagement is described anywhere in the deck, so this
    // is Rhubarb's own "Machina Flora" collage — brand material.
    print: {
      src: "/assets/brand/collage-machina-flora.jpg",
      alt: "Rhubarb Collective collage “Machina Flora”: stacked television sets sprouting flowers.",
      width: 1218,
      height: 1600,
      focal: "50% 42%",
      basis: "brand",
    },
  },
  {
    index: "06",
    title: "Consulting",
    detail: "& Brand Audits",
    slot: "f",
    // Deck p.11: Himalayan Sitar Gurukul — "the creative brainstorming that
    // became the Gurukul itself".
    print: {
      src: "/assets/work/sitar-site.webp",
      alt: "Sitar Jugalbandi portfolio website masthead.",
      width: 1600,
      height: 834,
      focal: "50% 50%",
      basis: "casework",
    },
  },
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
