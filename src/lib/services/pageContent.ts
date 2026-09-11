/**
 * /SERVICES — THE PAGE'S OWN WORDS
 * ================================
 *
 * ALMOST ALL OF THIS IS THE CLIENT'S, and the two lines that are not are marked
 * as such. The approved homepage copy has a "What we do" section — a heading, a
 * standfirst and one paragraph — and it is the best description of this
 * practice that exists in any supplied file. It is reproduced here verbatim,
 * including the client's own comma before "eventually unforgettable".
 *
 * WHY IT IS RETYPED HERE AND NOT READ FROM THE HOMEPAGE. It is not on the
 * homepage. `lib/branches/config` carries only the six service lines; Section
 * 04 renders them as cards and never prints the standfirst or the paragraph, so
 * there is no existing constant to import. This is the first time these words
 * appear in the repository, which is exactly why the source is recorded on
 * each one.
 *
 * NOTHING IS ADDED. No positioning statement written for them, no capability
 * the six lines do not name, no process promise, no turnaround, no rate, no
 * client count, no result and no award.
 */

/* ------------------------------------------------------------------ *
 * 01 — THE OPENING
 * ------------------------------------------------------------------ */

export const SERVICES_HERO = {
  /** The menu's own word for this destination. */
  eyebrow: "What we do",
  /** The page's H1, and the only one in the document. */
  title: "Services",
  /**
   * The client's standfirst for this exact section, verbatim. They set it
   * without a full stop; that is theirs and it is kept.
   */
  statement: "Everything that needs to be done",
  /**
   * The client's paragraph for this exact section, verbatim. It is the whole of
   * the page's prose — every other word on the page is a service name, a
   * capability or a quotation from the case-study deck.
   */
  body:
    "We like to think of ourselves as doers of doables, and our clients can confirm. Though our expertise lies in creative strategy, we take care of the entire execution of our plans, end-to-end, from design and animation, photoshoots, to performance marketing, website development, and social media management. Basically we do whatever it takes to make brands harder to ignore, eventually unforgettable.",
} as const;

/* ------------------------------------------------------------------ *
 * 02 — THE INDEX
 * ------------------------------------------------------------------ */

/**
 * The labels the index uses on itself. These are structural — the names of the
 * parts of an entry — rather than claims, which is why they are written here
 * rather than sourced.
 */
export const SERVICES_INDEX = {
  /** Accessible name for the list. Not printed; the numbers speak for it. */
  title: "The six disciplines",
  /** Above the index, naming what the reader is looking at. */
  marker: "The index",
  /** Sits beside the marker and tells the reader the entries open. */
  hint: "Open a discipline",
  /** Heads the capability list inside an opened entry. */
  coversLabel: "Covers",
  /** Heads the engagement list. Absent where a discipline has none. */
  practiceLabel: "Practised on",
  /** Heads the derived cross-reference to the other disciplines. */
  sharesLabel: "Runs with",
  /** The link out of an opened entry into the archive. */
  archiveLabel: "See the work",
} as const;

/* ------------------------------------------------------------------ *
 * 03 — THE CLOSING
 * ------------------------------------------------------------------ */

/**
 * AUTHOR-WRITTEN, and the only two lines on the page that are.
 *
 * The client's supplied sign-offs are already spoken for: "Moving forward? /
 * Call us today to elevate your Brand." closes /contact, and "We are here to
 * stay." closes /about. Repeating either here would make the third page in a
 * row end on a borrowed line. So this page ends on a question and an answer,
 * both of which are plain invitations that claim nothing — no response time, no
 * availability, no promise about what happens next.
 *
 * The link and its treatment are the About page's closing CTA, unchanged: the
 * same destination, the same underline that thickens, the same component
 * language. No new button system is introduced.
 */
export const SERVICES_CLOSING = {
  eyebrow: "Have something in mind?",
  statement: "Let's talk.",
  cta: {
    label: "Start a project",
    href: "/contact",
  },
} as const;
