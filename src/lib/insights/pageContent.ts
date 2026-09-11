/**
 * /INSIGHTS — THE PAGE'S OWN WORDS
 * ================================
 *
 * ALMOST NONE OF THIS IS NEW. The standfirst, the paragraph and the note are
 * the client's approved "Editorials/ Journals" copy, and they are NOT
 * redeclared here — they are read from `JOURNAL_COPY` in `lib/journal/config`,
 * where the homepage's Section 07 already reads them. There is one copy of
 * those sentences on the site.
 *
 * The strands are the project plan's own list (section 10, "Journal / Future
 * Content"), read from `JOURNAL_STRANDS` for the same reason, and rendered in
 * the plan's own tense: the plan calls them *potential* areas for future
 * phases, so the page says the space is being built to carry them and never
 * that they are live sections with something behind them.
 *
 * WHAT IS AUTHOR-WRITTEN is marked below and amounts to four short structural
 * lines: an eyebrow, the word the archive calls itself, and two sentences of
 * empty state. None of them makes a claim about Rhubarb — no cadence, no
 * frequency, no promise about what will be published or when, and no
 * description of an article that does not exist.
 */

import { JOURNAL_COPY, JOURNAL_STRANDS } from "@/lib/journal/config";

/* ------------------------------------------------------------------ *
 * 01 — THE MASTHEAD
 * ------------------------------------------------------------------ */

export const INSIGHTS_HERO = {
  /**
   * The homepage section's own name for this space, so a reader arriving from
   * it recognises where they have landed. AUTHOR-PLACED, but the words are the
   * client's — `JOURNAL_COPY.marker`.
   */
  eyebrow: JOURNAL_COPY.marker,
  /** The page's H1, and the menu's word for the destination. */
  title: "Insights",
  /** The client's approved standfirst for this section, verbatim. */
  statement: JOURNAL_COPY.standfirst,
  /** The client's approved paragraph for this section, verbatim. */
  body: JOURNAL_COPY.intro,
  /**
   * The client's own note, verbatim — and the sharpest line they wrote for the
   * whole site. It is what makes this page read as a publication rather than a
   * blog, so it is given its own place under the paragraph rather than being
   * folded into it.
   */
  note: JOURNAL_COPY.note,
} as const;

/* ------------------------------------------------------------------ *
 * 02 — THE ARCHIVE
 * ------------------------------------------------------------------ */

export const INSIGHTS_ARCHIVE = {
  /** Accessible name for the list. Not printed. */
  title: "The editorial archive",
  /** Above the archive, naming what the reader is looking at. */
  marker: "The archive",
  /** Names the filter row for assistive technology when it is shown. */
  filterLabel: "Strand",
  filterGroupLabel: "Filter the archive by strand",
  allLabel: "All",
  /** The result line. Also the live region — see `InsightsArchive`. */
  tally: (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`,

  /**
   * THE EMPTY STATE. Two author-written lines and one borrowed word.
   *
   * `heading` is `JOURNAL_COPY.unwritten` — the same word the homepage prints
   * in a position with no piece in it, so the two places agree about what
   * nothing looks like.
   *
   * `body` states a fact about the site and makes no promise: it does not say
   * when anything will be published, how often, or what about. The strands
   * underneath are the plan's, and they are what a reader should look at
   * instead.
   */
  emptyHeading: JOURNAL_COPY.unwritten,
  emptyBody:
    "Nothing is published yet. The strands below are what this space is being built to carry.",
  /** Shown when a filter returns nothing — impossible unless a strand empties. */
  filteredEmpty: "Nothing filed under this strand yet.",
} as const;

/* ------------------------------------------------------------------ *
 * 03 — THE COLOPHON
 * ------------------------------------------------------------------ */

/**
 * The page's close: the eight strands, in the plan's words and the plan's
 * order, under the plan's own tense.
 *
 * NOT A CTA. The brief for this page allows a closing invitation and allows it
 * to be omitted; a "let's work together" button under an editorial archive
 * would be the sales section this page is built not to be, and /about,
 * /services and /contact already carry the site's three real invitations. What
 * closes a publication is its colophon, so that is what closes this one — and
 * today it doubles as the most useful thing on the page, because it is the only
 * part of it with real material in it.
 */
export const INSIGHTS_COLOPHON = {
  /** The client-plan-derived label, read from `JOURNAL_COPY`. */
  label: JOURNAL_COPY.forthcoming,
  strands: JOURNAL_STRANDS,
} as const;
