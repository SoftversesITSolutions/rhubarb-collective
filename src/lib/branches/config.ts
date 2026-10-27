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
   * The service's position letter. The services page lays its entries out by
   * it; on the homepage the cards simply alternate along the branch in order.
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
 * Shape of the sideways journey per tier (client round 3, Oct 2026).
 *
 * The macro path is ART-DIRECTED, not emergent: one branch along the track,
 * a stem per card, a turn back down at the far end. The seeded randomness
 * only supplies micro-curvature, so these numbers describe standoffs and
 * texture, not probabilities. Lengths are CSS px; `exits`, `turn`, `early`
 * and `column` are fractions of the stage's width.
 */
export interface BranchShape {
  /** How far an entry runs on along the branch after it lands, px. */
  bend: number;
  /** Least room between a falling entry and the first card above the branch, px. */
  clear: number;
  /** How far the branch leans toward each card at its stem, as a share of the gap. */
  lean: number;
  /** Most room between two plain points along the branch, px. */
  span: number;
  /** Waypoint jitter amplitude, px. */
  jitter: number;
  /** Perpendicular noise added when a span is refined, px. Small on purpose:
      the client asked for smoother, calmer lines (round 3). */
  wobble: number;
  /** Stroke width of the branch — the page's one level-1 path made visible. */
  trunkWidth: number;
  /** Where the descents cross the foot in the last screen, first from the turn. */
  exits: number[];
  /** Where the branch turns down, in the last screen. */
  turn: number;
  /** Where the third descent leaves the branch, in the last screen. */
  early: number;
  /**
   * Where on the screen the branch's growing tip rides while the track
   * slides: everything left of this line has grown, nothing right of it has.
   */
  column: number;
}

export const BRANCH_SHAPE: Record<"desktop" | "tablet" | "mobile", BranchShape> = {
  desktop: {
    bend: 70,
    clear: 46,
    lean: 0.3,
    span: 150,
    jitter: 14,
    wobble: 7,
    trunkWidth: 1.5,
    exits: [0.76, 0.58, 0.4],
    turn: 0.62,
    early: 0.34,
    column: 0.72,
  },
  tablet: {
    bend: 56,
    clear: 36,
    lean: 0.3,
    span: 130,
    jitter: 12,
    wobble: 6,
    trunkWidth: 1.45,
    exits: [0.76, 0.58, 0.4],
    turn: 0.62,
    early: 0.34,
    column: 0.74,
  },
  mobile: {
    bend: 36,
    clear: 18,
    lean: 0.3,
    span: 100,
    jitter: 8,
    wobble: 4,
    trunkWidth: 1.5,
    exits: [0.74, 0.56, 0.38],
    turn: 0.6,
    early: 0.34,
    column: 0.8,
  },
};
