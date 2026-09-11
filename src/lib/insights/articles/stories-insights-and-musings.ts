/**
 * INSIGHT — STORIES, INSIGHTS, AND MUSINGS
 * ========================================
 *
 * The editorial space's own opening statement, set as a piece to be read.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS, AND WHAT IT IS NOT
 * ─────────────────────────────────────────────────────────────────────────────
 * NO ARTICLE EXISTS ANYWHERE IN THE SUPPLIED MATERIAL. Not one title, byline,
 * date, excerpt, body, quotation or article image — the approved homepage copy,
 * the case-study deck, the brand guidelines and the project plan have each been
 * read for them, twice, and `JOURNAL_ENTRIES` is empty because of it. So no
 * article is written here. Nothing below is composed, paraphrased, extended or
 * filled in.
 *
 * What is set instead is the one genuinely written piece of Rhubarb editorial
 * that does exist: the client's own approved copy for this space, from
 * "Editorials/ Journals" in "Rhubarb Website Homepage Content". Every sentence
 * a reader meets on the page is read from `JOURNAL_COPY` rather than retyped
 * here, so there is exactly one copy of those words on the site and this page
 * can never drift from the homepage section or the archive that print them too.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHERE EVERY WORD CAME FROM
 * ─────────────────────────────────────────────────────────────────────────────
 *  [COPY]   `JOURNAL_COPY`, the client's approved "Editorials/ Journals" copy.
 *           The title is their `standfirst`; the lede is their `intro`; the
 *           pause is their `note`; the eyebrow and the list's label are their
 *           `marker` and `forthcoming`.
 *  [PLAN]   `JOURNAL_STRANDS`, section 10 of the client's project plan
 *           ("Journal / Future Content"), in the plan's own words and order.
 *           The plan calls them *potential* areas for future phases, which is
 *           why the label above them says the space is being built to carry
 *           them and never that anything is filed under them.
 *  [BRAND]  `lib/about/content`, where the two Rhubarb brand photographs were
 *           recorded — src, intrinsic size, alt and caption — when /about
 *           shipped. Read from there rather than retyped, so one alt string
 *           describes each frame across the whole site.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS ABSENT, AND STAYS ABSENT
 * ─────────────────────────────────────────────────────────────────────────────
 * NO AUTHOR. The copy is unsigned in the client's document and no writer is
 * named anywhere in the supplied material, so `author` is null and the page
 * renders no byline. It is not signed "Rhubarb Collective" to fill the line.
 *
 * NO DATE. The document is undated. `publishedAt` and `iso` are both null and
 * the page prints no date rather than the day this file was written.
 *
 * NO PULL QUOTE INVENTED. The one typographic pause is the client's `note`,
 * whole — their sharpest sentence anywhere in the material and already a
 * self-contained aside in their own document. It is set large; it is not
 * wrapped in quotation marks, given a speaker, or cut down to a phrase that
 * reads better out of context.
 *
 * THE PICTURES ARE RHUBARB'S OWN BRAND MATERIAL and are captioned as exactly
 * that. Neither is client work, neither is stock, neither is generated, and
 * neither is presented as an illustration of anything the piece claims.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS PIECE IS NOT PUBLISHED TO THE ARCHIVE
 * ─────────────────────────────────────────────────────────────────────────────
 * `JOURNAL_ENTRIES` is untouched and still empty, so /insights keeps its empty
 * state and the homepage's Section 07 keeps its four waiting positions — both
 * render exactly as they did before this route existed. This page is reachable
 * at its own URL and is the working template for every piece after it. To
 * publish it properly, add one entry to `JOURNAL_ENTRIES` whose `href` is
 * `insightHref(STORIES_INSIGHTS_AND_MUSINGS.slug)`; the archive and the
 * homepage then fill themselves and link here, with nothing else to change.
 */

import { JOURNAL_COPY, JOURNAL_STRANDS } from "@/lib/journal/config";
import { BRAND_BOARD, SOCIAL_POSTERS, type AboutImage } from "@/lib/about/content";
import type { Insight, InsightImage } from "../article";

/* ---- the two pictures, read from where they were recorded ---- */

/**
 * `AboutImage` carries the src, the intrinsic size, the alt and the caption;
 * only the `sizes` hint differs between routes, because only the rendered width
 * differs. So it is the one field passed in.
 */
function picture(asset: AboutImage, sizes: string): InsightImage {
  return {
    src: asset.src,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
    caption: asset.caption ?? null,
    sizes,
  };
}

export const STORIES_INSIGHTS_AND_MUSINGS: Insight = {
  slug: "stories-insights-and-musings",

  /**
   * The section this piece belongs to, in the site's own name for it. Not one
   * of the eight strands: filing the space's opening statement under "Journal"
   * or "Editorial content" would be a guess, and the strands are declared as
   * areas nothing is filed under yet. [COPY]
   */
  kind: JOURNAL_COPY.marker,

  /** The client's approved standfirst for this space, verbatim. [COPY] */
  title: JOURNAL_COPY.standfirst,

  /**
   * NO STANDFIRST. The piece's opening paragraph is its introduction and is set
   * as the lede a screen below; lifting its first sentence up here would print
   * the same words twice inside one viewport of a short piece.
   */
  excerpt: null,

  /** Unsigned, and undated. See the header — neither is filled in. */
  author: null,
  publishedAt: null,
  iso: null,

  heroImage: picture(
    BRAND_BOARD,
    "(min-width: 1100px) 76vw, (min-width: 700px) 92vw, 100vw",
  ),

  blocks: [
    /* -------------------------------------------------------------- *
     * THE LEDE
     *
     * The client's paragraph, whole and unedited. It is the piece. It is set
     * one step above reading size because it is the opening paragraph — that
     * is typography, and it adds no word to what they wrote.
     * -------------------------------------------------------------- */
    {
      id: "lede",
      type: "lede",
      body: [JOURNAL_COPY.intro],
      slot: "narrow-left",
    },

    /* -------------------------------------------------------------- *
     * THE PAUSE
     *
     * The client's note, whole. The one place the reading rhythm stops, and
     * the line that tells a reader what kind of publication this is — which
     * is precisely why it is not folded into the paragraph above, on this page
     * or on /insights.
     *
     * No quotation marks and no attribution line: it is a block of the piece
     * given emphasis, not a statement quoted from someone. It carries its own
     * label already, in the client's own first word.
     * -------------------------------------------------------------- */
    {
      id: "note",
      type: "pause",
      heading: JOURNAL_COPY.note,
      slot: "wide-right",
    },

    /* -------------------------------------------------------------- *
     * THE PICTURE
     *
     * Rhubarb's own social posters, at portrait proportion in the left half of
     * the field. Placed narrow rather than full-bleed because the asset is
     * taller than it is wide and a full-measure portrait on a desktop field is
     * a picture a reader has to scroll past rather than look at.
     *
     * The caption names the artefact and claims nothing about the piece.
     * -------------------------------------------------------------- */
    {
      id: "posters",
      type: "figure",
      image: picture(
        SOCIAL_POSTERS,
        "(min-width: 1100px) 44vw, (min-width: 700px) 56vw, 88vw",
      ),
      slot: "narrow-left",
    },

    /* -------------------------------------------------------------- *
     * THE STRANDS
     *
     * The plan's eight areas, in the plan's words, order and tense. A genuine
     * list, rendered as one — not a paragraph chopped into bullets. The label
     * above it is the client-plan-derived line the archive's colophon uses, so
     * the two places say the same thing about what these are. [PLAN] [COPY]
     * -------------------------------------------------------------- */
    {
      id: "strands",
      type: "list",
      label: "What this space will carry",
      heading: JOURNAL_COPY.forthcoming,
      items: JOURNAL_STRANDS,
      // Wide rather than narrow: measured on the desktop field, eight rows in
      // columns 7–12 leave the left half of the page empty beside them and
      // strand the block's own marker at the far edge. Columns 5–12 close that
      // gap and line the list up with the colophon underneath it.
      slot: "wide-right",
    },
  ],

  /**
   * THE COLOPHON — how a publication closes, and the site's second one.
   *
   * Two author-written sentences, and both are statements of fact about this
   * site rather than editorial claims: where the words above came from, and
   * that nothing is filed under the strands yet. Neither says anything about
   * Rhubarb's practice, promises a cadence, or describes a piece that does not
   * exist. It is here because a reader who reaches the foot of a short piece
   * and finds an empty archive behind it deserves to be told why.
   */
  colophon: {
    label: "About this piece",
    body: [
      "Rhubarb Collective's own words for this space, set as written and unabridged.",
      "The strands above are what the journal is being built to carry. Nothing is filed under them yet.",
    ],
  },

  /**
   * NO NEXT READ. There is one piece, so there is nothing to point at — and a
   * "next read" that goes back to the archive is the return link at the foot of
   * this page, printed a second time one line higher. The renderer omits the
   * whole block when this is null; the moment a second piece exists, this
   * becomes `{ label, title, kind, href: insightHref(...) }` and it appears.
   */
  next: null,

  /**
   * Derived from the piece's own subjects — the four the client's paragraph
   * actually names. Nothing claims a cadence, a readership or a published
   * article, because the archive behind this page is empty and a description
   * promising articles would be the first lie on the route. The same sentence
   * shape /insights already uses for its own description.
   */
  meta: {
    title: "Stories, Insights, and Musings — Rhubarb Collective",
    description:
      "The space where Rhubarb Collective's interval discussions find a platform: origin stories, philosophical musings, uncomfortable political stances and real-world insights.",
  },
};
