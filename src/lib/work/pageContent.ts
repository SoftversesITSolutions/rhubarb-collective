/**
 * /WORK — THE PAGE'S OWN WORDS
 * ============================
 *
 * NONE OF THIS IS TRANSCRIBED FROM CLIENT MATERIAL, and it is marked as such
 * rather than quietly mixed in with the copy the rest of the site uses. The
 * client supplied a case-study deck, approved homepage copy and brand
 * guidelines; none of the three contains a portfolio-page introduction. So the
 * few lines here were written for this page, and they are held to the same rule
 * their words are: NO CLAIM THAT IS NOT ALREADY TRUE ON THE PAGE.
 *
 * There is no "award-winning", no "world-class", no client count that is not
 * counted from the data, no results, no metrics and no promise. The strongest
 * statement on the page is that these are the things the collective has made,
 * which is a description of the six pictures directly underneath it.
 *
 * THE NUMBERS ARE NOT WRITTEN HERE. `CLIENT_COUNT` and the per-filter counts are
 * derived in `lib/work/archive` from the pieces themselves, so the page cannot
 * end up claiming five clients while showing four.
 */

export const WORK_PAGE_HERO = {
  /** The menu's own word for a body of work, and what this page is. */
  eyebrow: "Archive",
  /** The page's H1, and the only one in the document. */
  title: "Work",
  /**
   * The whole of the introduction. One sentence, because a portfolio page that
   * explains itself at length is delaying the work — and the work is the point.
   */
  statement: "These are the things the collective has made.",
} as const;

export const WORK_PAGE_FILTER = {
  /** Sits above the row and names what the row does. */
  label: "Industry",
  /** The default state, and the way back to the whole archive. */
  allLabel: "All",
  /**
   * Accessible name for the group of buttons. Never printed — `label` above is
   * what a sighted reader sees.
   */
  groupLabel: "Filter the archive by industry",
  /**
   * The result line, built at render from the real counts. It is also the live
   * region: changing the filter announces the new tally rather than leaving a
   * keyboard or screen-reader user to infer that anything happened.
   */
  tally: (pieces: number, clients: number) =>
    `${pieces} ${pieces === 1 ? "piece" : "pieces"} · ${clients} ${
      clients === 1 ? "client" : "clients"
    }`,
  /**
   * Shown if a category ever returns nothing. It cannot happen with today's
   * data — every industry in the row is derived from a client that has work —
   * but a filter that could render an empty page without saying so is a filter
   * that will one day look broken.
   */
  empty: "Nothing filed under this industry yet.",
} as const;
