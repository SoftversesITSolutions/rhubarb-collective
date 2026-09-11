/**
 * CASE STUDIES — THE SHAPE
 * ========================
 *
 * The type a case-study page consumes, and the registry it is looked up in.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BUILT FOR /work/[slug], SHIPPED AS ONE STATIC ROUTE
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no backend, no CMS, no API and no dynamic segment yet, and none is
 * stubbed. What exists is the seam: one exported `CaseStudy` shape, one registry
 * keyed by slug, and one page component that renders whatever it is handed. The
 * page reads nothing from the file system and hardcodes no paragraph, so the
 * conversion later is:
 *
 *   1  move `app/work/ritam/page.tsx` to `app/work/[slug]/page.tsx`
 *   2  `const study = getCaseStudy(params.slug); if (!study) notFound();`
 *   3  add `generateStaticParams` over `caseStudySlugs()`
 *   4  swap `CASE_STUDIES` for the CMS client — the shape is the contract
 *
 * `generateMetadata` can be derived from the same object today; see the route.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A CASE STUDY MAY NOT CONTAIN
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no field for a metric, a result, a percentage, an award, a client
 * quote or a testimonial, and that is deliberate rather than an omission. None
 * of those exists for any of the five clients — the case-study deck, the brand
 * guidelines, the approved copy and the project plan were each read for them —
 * and a shape with a `results` array on it is an invitation to invent one. When
 * a client genuinely supplies a result, add the field then.
 *
 * `year` is likewise absent from the shape's required fields: the deck dates no
 * individual project, and `meta` carries whatever facts a project really has.
 */

import type { StaticImageData } from "next/image";

/* ------------------------------------------------------------------ *
 * PIECES
 * ------------------------------------------------------------------ */

/** A supplied project image. Intrinsic size is carried so nothing distorts. */
export interface CaseStudyImage {
  /** Path under `public/`. */
  src: string | StaticImageData;
  width: number;
  height: number;
  /** Describes what is visibly in the frame. Never a claim about the project. */
  alt: string;
  /** A short line under the picture. Optional; omitted rather than invented. */
  caption?: string | null;
}

/**
 * One fact in the overview rail. A label and a value, and nothing is included
 * unless the project genuinely has it — no "Year: —", no "Location: n/a".
 */
export interface CaseStudyFact {
  label: string;
  value: string;
}

/**
 * A block of the visual story.
 *
 *   "prose"  a heading and paragraphs, no picture
 *   "figure" one picture at full measure, with an optional heading and body
 *            set beside or under it
 *   "quote"  the page's one typographic pause
 *
 * A section carries only what it has: a figure with no heading renders as a
 * picture, a prose block with one paragraph renders as one paragraph. The
 * renderer branches on `type` and never on the section's position, so re-ordering
 * the array re-orders the page.
 */
export type CaseStudySectionType = "prose" | "figure" | "quote";

export interface CaseStudySection {
  id: string;
  type: CaseStudySectionType;
  /** The section marker — 01, 02 … Null for an unnumbered block. */
  index?: string | null;
  /** Small label above the heading. */
  label?: string | null;
  heading?: string | null;
  body?: string[];
  image?: CaseStudyImage | null;
  /**
   * Placement for a figure or a prose block, mapped to the rules in
   * `case-study.css`. Art-directed per section — a case study is a fixed,
   * curated sequence, so hand-placement is right here in a way it is not on the
   * filterable /work archive.
   */
  slot?: "full" | "wide-left" | "wide-right" | "narrow-left" | "narrow-right";
  /** Where a quoted block came from, printed under it. */
  source?: string | null;
}

/** The transition out of the study. Never a second case study on this page. */
export interface CaseStudyNext {
  label: string;
  /** A real client from the archive. */
  client: string;
  /** What that piece is, from `lib/work/config`. */
  discipline: string;
  /**
   * Where it goes. The archive today, because that client has no page of its
   * own yet — a link to `/work/kismat` before that route exists would be the
   * 404 this project refuses everywhere else.
   */
  href: string;
}

/* ------------------------------------------------------------------ *
 * THE STUDY
 * ------------------------------------------------------------------ */

export interface CaseStudy {
  /** URL segment. `/work/<slug>` today, `/work/[slug]` later. */
  slug: string;
  /** The client, as the case-study deck names them. */
  client: string;
  /**
   * The small line above the title.
   *
   * THE CLIENT'S NAME WHERE THAT DIFFERS FROM THE TITLE — a campaign or a
   * product with a name of its own wants its client named above it. Where the
   * two are the same word, as they are for Ritam, printing both sets the same
   * name twice in two sizes, so this carries the page's kind instead.
   */
  eyebrow: string;
  /** The page's H1. */
  title: string;
  /** The line under it — what the client is, in the deck's words. */
  descriptor: string;
  /** The overview rail. Only facts the project really has. */
  facts: CaseStudyFact[];
  /** What the project is and what Rhubarb's role in it is. */
  summary: string;
  /** The opening image. The strongest asset the project has. */
  hero: CaseStudyImage;
  /** The body of the study, in reading order. */
  sections: CaseStudySection[];
  /** How it stands today. Qualitative — see the header. */
  outcome: {
    label: string;
    body: string[];
  };
  next: CaseStudyNext;
  /** For `generateMetadata`, today and after the route goes dynamic. */
  meta: {
    title: string;
    description: string;
  };
}

/* ------------------------------------------------------------------ *
 * THE REGISTRY
 * ------------------------------------------------------------------ */

import { RITAM } from "./case-studies/ritam";

/**
 * Every case study the site has. One today.
 *
 * Keyed by slug so the future dynamic route is a lookup rather than a scan, and
 * so `generateStaticParams` is `Object.keys` of this.
 */
export const CASE_STUDIES: Record<string, CaseStudy> = {
  [RITAM.slug]: RITAM,
};

export function getCaseStudy(slug: string): CaseStudy | null {
  return CASE_STUDIES[slug] ?? null;
}

export function caseStudySlugs(): string[] {
  return Object.keys(CASE_STUDIES);
}

/**
 * Which archive pieces have a case study behind them.
 *
 * `lib/work/archive` reads this to set each piece's `href`, so a piece becomes
 * a link the moment its study exists and never before — the archive cannot end
 * up pointing at a page that was not built.
 */
export const CASE_STUDY_BY_CLIENT: Record<string, string> = {
  ritam: RITAM.slug,
};
