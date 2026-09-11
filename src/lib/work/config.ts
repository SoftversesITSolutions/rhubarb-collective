/**
 * SECTION 03 — WORK
 *
 * Every field below is transcribed from the client's own case-study deck
 * ("Case Studies 2026 — Rhubarb Collective"). Project names, disciplines and
 * the one-line notes are the studio's words, lightly trimmed. Nothing here is
 * invented: no metrics, no awards, no results, no client quotes, and no
 * category a project's own case study does not claim.
 *
 * The imagery is cropped from that same deck — each file isolates one piece of
 * client artwork, with the deck's headings, body copy and page furniture left
 * out. Source pages are recorded per item so the crops can be regenerated or
 * replaced when the client supplies originals.
 */

export interface WorkItem {
  id: string;
  /** Client project name, exactly as the deck titles it. */
  project: string;
  /** Discipline, taken from that project's own scope of work. */
  discipline: string;
  /** Optional second line — only where the deck states it plainly. */
  note?: string;
  src: string;
  width: number;
  height: number;
  /** Describes what is visibly in the frame. Never a claim about the project. */
  alt: string;
  /** Page of the case-study deck this crop came from. */
  sourcePage: number;
  /**
   * Placement slot. The composition is art-directed per item rather than
   * generated, and these names map to the grid rules in work.css.
   */
  slot: "feature-right" | "left-wide" | "right-tall" | "centre-wide" | "right-mid" | "left-mid";
  /** Items flagged here get a connective strand from the network. */
  threaded?: boolean;
}

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "kismat",
    project: "Cakes by Kismat",
    discipline: "Brand Identity",
    note: "Sydney, Australia",
    src: "/assets/work/kismat-social.webp",
    width: 1600,
    height: 928,
    alt: "Cakes by Kismat brand creative — the new logo on a magenta and purple field beside a baker presenting a tray of muffins.",
    sourcePage: 12,
    slot: "feature-right",
    threaded: true,
  },
  {
    id: "embassy",
    project: "Italian Embassy Cultural Centre",
    discipline: "Creative Direction",
    src: "/assets/work/embassy-banner.webp",
    width: 1558,
    height: 734,
    alt: "Website banner for the Italian Embassy Cultural Centre reading “Experience Culture Beyond Classroom”, set in a warm Mediterranean palette.",
    sourcePage: 8,
    slot: "left-wide",
  },
  {
    id: "dietxp",
    project: "DietXP",
    discipline: "Social Media",
    src: "/assets/work/dietxp-report.webp",
    width: 835,
    height: 1021,
    alt: "DietXP social campaign creative titled “The Indian Health Report”, over a saturated street photograph.",
    sourcePage: 15,
    slot: "right-tall",
  },
  {
    id: "ritam",
    project: "Ritam",
    discipline: "Brand Identity",
    note: "Organic honey & beekeeping",
    src: "/assets/work/ritam-keeper.webp",
    width: 1600,
    height: 942,
    alt: "Ritam brand imagery — a beekeeper lifting a honeycomb frame at golden hour, with the Ritam mark alongside.",
    sourcePage: 17,
    slot: "centre-wide",
    threaded: true,
  },
  {
    id: "sitar",
    project: "Himalayan Sitar Gurukul",
    discipline: "Web Development",
    src: "/assets/work/sitar-site.webp",
    width: 1600,
    height: 834,
    alt: "Sitar Jugalbandi portfolio website, showing the masthead and a photograph of the two artists performing.",
    sourcePage: 11,
    slot: "right-mid",
  },
  {
    id: "ritam-pack",
    project: "Ritam",
    discipline: "Packaging & Collateral",
    src: "/assets/work/ritam-packaging.webp",
    width: 1600,
    height: 925,
    alt: "Ritam packaging range — honey jar, kraft cartons, swing tags and stationery, with the brand colour palette.",
    sourcePage: 17,
    slot: "left-mid",
  },
];

/**
 * The disciplines represented above, in the order the work introduces them.
 * Derived from WORK_ITEMS rather than written out, so this can never drift into
 * claiming a capability the shown work does not evidence. It closes the section
 * by pointing at what comes next without building it.
 */
export const DISCIPLINES: string[] = Array.from(
  new Set(WORK_ITEMS.map((item) => item.discipline)),
);
