/**
 * /WORK — THE ARCHIVE
 * ===================
 *
 * The portfolio page's data layer. It holds exactly two things that did not
 * already exist in the repository — an industry per client, and the order the
 * archive reads in — and it derives everything else.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTHING IS RETYPED, AND NOTHING IS INVENTED
 * ─────────────────────────────────────────────────────────────────────────────
 * The six pieces, their files, their intrinsic sizes, their alt text, their
 * disciplines and their notes are read straight from `lib/work/config` — the
 * same list the homepage's Selected Work section renders. There is one copy of
 * every asset record on the site and this is not a second one; correcting a
 * caption corrects it in both places.
 *
 * The client descriptors are read from `lib/proof/config`, where they were
 * transcribed from Rhubarb's own case-study deck with the source page recorded
 * per client. So the words that describe a client on this page are the words
 * that describe them in Section 6 of the homepage, and neither can drift.
 *
 * NO YEARS. The deck is titled "Case Studies 2026" but states no date for any
 * individual project, so there is no `year` field. A plausible year is still a
 * fabricated one, and a portfolio is the worst place on a site to guess a date.
 *
 * NO PROJECT DESCRIPTIONS, NO RESULTS, NO METRICS, NO CLIENT QUOTES. None exist
 * in any supplied file — see the header of `lib/proof/config`, which records
 * that every page of every supplied document was read looking for them.
 *
 * A PIECE LINKS ONLY WHERE ITS CASE STUDY EXISTS. `href` is resolved from
 * `CASE_STUDY_BY_CLIENT`, so Ritam's two pieces point at `/work/ritam` and the
 * other four carry `null` and render as `<figure>` rather than as links to
 * pages nobody built. Adding a study registers its client there and its pieces
 * become links with no change to any component. This is the rule the Contact
 * page already follows for the studio's address: no map URL was supplied, so
 * the location is plain type rather than a dead link.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE INDUSTRIES ARE DERIVED, NOT CHOSEN FROM A LIST
 * ─────────────────────────────────────────────────────────────────────────────
 * Each one is read off the client's own descriptor in the case-study deck, and
 * the sentence it came from is quoted on the mapping below. There are three,
 * because three is how many the actual portfolio supports:
 *
 *   Food & Drink ......... a bakery, and an organic honey brand
 *   Culture & Education .. an embassy cultural centre, and a music gurukul
 *   Health & Wellness .... a nutrition brand
 *
 * "Culture" and "Education" are ONE category rather than two because splitting
 * them would produce two categories with identical membership: the embassy's
 * engagement covers a "Membership & Language Student portal" and its own banner
 * reads "Experience Culture Beyond Classroom", while the Gurukul is a school
 * founded by "artistes, educators, composers and researchers". Both clients are
 * both things, so a filter that offered both would be two buttons that always
 * return the same two pieces.
 *
 * No fourth category is added to round the row out. Technology, Lifestyle,
 * Retail, Hospitality and the rest of the usual set are absent because no
 * supplied document evidences a client in any of them.
 */

import { PROOF_ITEMS } from "@/lib/proof/config";
import { CASE_STUDY_BY_CLIENT } from "@/lib/work/case-study";
import { WORK_ITEMS, type WorkItem } from "@/lib/work/config";

/* ------------------------------------------------------------------ *
 * INDUSTRIES
 * ------------------------------------------------------------------ */

export type IndustryId = "food-drink" | "culture-education" | "health-wellness";

export interface Industry {
  id: IndustryId;
  /** How the filter row prints it. */
  label: string;
}

/**
 * Reading order for the filter row: the widest category first, so the row opens
 * with the part of the archive that has the most in it.
 */
export const INDUSTRIES: readonly Industry[] = [
  { id: "food-drink", label: "Food & Drink" },
  { id: "culture-education", label: "Culture & Education" },
  { id: "health-wellness", label: "Health & Wellness" },
];

/**
 * CLIENT → INDUSTRY, with the deck's own words for each decision.
 *
 * Keyed by the client id used in `lib/proof/config`, not by piece, because an
 * industry is a fact about the client rather than about the artwork — which is
 * also why the two Ritam pieces cannot end up in different categories.
 *
 * An array, because a client can genuinely sit in two industries. All five sit
 * in one today; the shape is what stops that being a schema change later.
 */
const CLIENT_INDUSTRIES: Record<string, IndustryId[]> = {
  // "Bakery based in Sydney, Australia"
  kismat: ["food-drink"],
  // "Organic honey & beekeeping"
  ritam: ["food-drink"],
  // "Italian Embassy India Cultural Centre" — the engagement covers its
  // "Membership & Language Student portal", and the banner in the archive reads
  // "Experience Culture Beyond Classroom".
  embassy: ["culture-education"],
  // "Hindustani classical sitar artistes, educators, composers and researchers"
  // — and the brainstorming "that became the Gurukul itself". A gurukul is a
  // school.
  sitar: ["culture-education"],
  // "Science-backed nutrition"; "a digital-first health and wellness brand".
  dietxp: ["health-wellness"],
};

/**
 * PIECE → CLIENT. Five clients, six pieces: Ritam is the one client with two.
 * The work list and the proof list were written separately and their ids agree
 * everywhere except here, so this is the one place the two are reconciled.
 */
const PIECE_CLIENT: Record<string, string> = {
  kismat: "kismat",
  embassy: "embassy",
  dietxp: "dietxp",
  ritam: "ritam",
  sitar: "sitar",
  "ritam-pack": "ritam",
};

/* ------------------------------------------------------------------ *
 * THE ARCHIVE
 * ------------------------------------------------------------------ */

export interface ArchivePiece extends WorkItem {
  /** The client this piece was made for, from `lib/proof/config`. */
  clientId: string;
  /** What that client is, in the case-study deck's words. Null where it has none. */
  descriptor: string | null;
  industries: IndustryId[];
  /**
   * Portrait or square. Derived from the asset's own pixels, never authored —
   * `work-page.css` uses it to keep a tall picture out of a wide column, where
   * it would otherwise run to twice the height of everything around it.
   */
  tall: boolean;
  /**
   * That piece's case study, where one has been built. Resolved from
   * `CASE_STUDY_BY_CLIENT` rather than authored per piece, so a piece becomes a
   * link the moment its study exists and never before — the archive cannot end
   * up pointing at a page nobody built.
   */
  href: string | null;
}

/**
 * THE ORDER THE ARCHIVE READS IN.
 *
 * A composition decision, not new data — every id below is already in
 * `WORK_ITEMS`, and re-ordering that list would re-compose the homepage, which
 * is approved and closed.
 *
 * It is ordered against the grid rhythm in `work-page.css`, which alternates a
 * seven-column slot with a five-column one. The two assets with the most
 * extreme proportions decide it: the embassy banner is a 2.12:1 panorama that
 * disappears in a narrow column, and the DietXP creative is the one portrait in
 * the set and doubles the height of a wide one. So the panorama and the two
 * other broad landscapes take the wide slots, and the portrait takes a narrow
 * one. Every filtered subset was checked against the same rhythm — see the
 * table in `work-page.css`.
 */
const ARCHIVE_ORDER = [
  "kismat",
  "embassy",
  "dietxp",
  "sitar",
  "ritam",
  "ritam-pack",
] as const;

const BY_ID = new Map(WORK_ITEMS.map((item) => [item.id, item]));
const DESCRIPTOR = new Map(PROOF_ITEMS.map((item) => [item.id, item.descriptor]));

export const ARCHIVE_PIECES: ArchivePiece[] = ARCHIVE_ORDER.map((id) => {
  const item = BY_ID.get(id);
  if (!item) {
    // A build-time guard rather than a silent gap: an id here that is not in
    // WORK_ITEMS means the two files have drifted, and a portfolio quietly
    // dropping a piece is exactly the failure worth being loud about.
    throw new Error(`[work/archive] "${id}" is not in WORK_ITEMS`);
  }

  const clientId = PIECE_CLIENT[id];
  return {
    ...item,
    clientId,
    descriptor: DESCRIPTOR.get(clientId) ?? null,
    industries: CLIENT_INDUSTRIES[clientId] ?? [],
    tall: item.height > item.width,
    href: CASE_STUDY_BY_CLIENT[clientId] ? `/work/${CASE_STUDY_BY_CLIENT[clientId]}` : null,
  };
});

/* ------------------------------------------------------------------ *
 * FILTERING
 * ------------------------------------------------------------------ */

/** The default, and the only state that is not an `IndustryId`. */
export const ALL = "all" as const;
export type FilterId = typeof ALL | IndustryId;

/**
 * The filter operates on the data, never on the DOM: `filterPieces` returns the
 * pieces to render and the component renders exactly those, so nothing hidden
 * is ever in the document and no image outside the current view is downloaded.
 */
export function filterPieces(filter: FilterId): ArchivePiece[] {
  if (filter === ALL) return ARCHIVE_PIECES;
  return ARCHIVE_PIECES.filter((piece) => piece.industries.includes(filter));
}

/**
 * How many pieces each filter would return, computed once at module scope.
 *
 * The counts are printed beside the labels, which is what turns a row of
 * categories into a map of the archive — a reader can see that Health &
 * Wellness holds one piece before spending a click on it. It also means an
 * industry that ever ends up empty is visible in the row rather than being
 * discovered as a blank page.
 */
export const FILTER_COUNTS: Record<FilterId, number> = {
  all: ARCHIVE_PIECES.length,
  ...(Object.fromEntries(
    INDUSTRIES.map((industry) => [industry.id, filterPieces(industry.id).length]),
  ) as Record<IndustryId, number>),
};

/** Distinct clients in the archive. Derived, so it cannot overstate the count. */
export const CLIENT_COUNT = new Set(ARCHIVE_PIECES.map((p) => p.clientId)).size;
