/**
 * /INSIGHTS — THE ARCHIVE
 * =======================
 *
 * Selectors over the site's editorial list. This file holds no content and
 * declares no piece: every article on the archive comes from `JOURNAL_ENTRIES`
 * in `lib/journal/config`, which is the one list the homepage's Section 07
 * reads too. There is no second source of truth for editorial, and this file
 * exists so there never is one.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ARCHIVE IS EMPTY TODAY, AND EVERYTHING BELOW STILL WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * No article, title, byline, date, excerpt, image or URL exists in any supplied
 * file. So the page renders its empty state rather than a grid of invented
 * posts — but the grid, the card, the filter and the ordering are all real and
 * all driven from the list. Publishing one entry in `JOURNAL_ENTRIES` promotes
 * the page out of its empty state, gives that piece the feature slot, and — the
 * moment a second category appears — raises the filter row on its own.
 *
 * NOTHING HERE FABRICATES A MISSING FIELD. A piece with no author renders with
 * no byline; with no date, no date; with no image, as type. `href` stays null
 * until an article route actually exists, and a piece with a null href renders
 * as an `<article>` rather than as a link to a 404 — the same rule /work
 * applies to a case study that has no page yet.
 */

import { JOURNAL_ENTRIES, type JournalCategory, type JournalEntry } from "@/lib/journal/config";

/* ------------------------------------------------------------------ *
 * THE PIECES
 * ------------------------------------------------------------------ */

export interface ArchiveArticle extends JournalEntry {
  /**
   * Stable identity for React and for the filter. Derived from the title rather
   * than authored, because `JournalEntry` has no id and adding one would make
   * every future writer invent a slug before they could publish a sentence.
   */
  id: string;
}

function slug(title: string, i: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `${base}-${i}` : `entry-${i}`;
}

/**
 * PUBLICATION ORDER IS THE ARCHIVE ORDER, and it is the list's own order —
 * newest first, as `JOURNAL_ENTRIES` documents. Nothing is re-sorted by date
 * here: many pieces may carry a display date and no machine date, and sorting a
 * hand-typed string is how an archive silently reorders itself.
 *
 * THE FIRST PIECE IS THE FEATURE. That is positional, not a flag — no
 * `featured` field is invented, and the composition simply gives the top of the
 * list the most room, which is what an archive's first item is for.
 */
export const ARCHIVE_ARTICLES: ArchiveArticle[] = JOURNAL_ENTRIES.map((entry, i) => ({
  ...entry,
  id: slug(entry.title, i),
}));

/* ------------------------------------------------------------------ *
 * CATEGORIES
 * ------------------------------------------------------------------ */

export const ALL = "all" as const;
export type FilterId = typeof ALL | JournalCategory;

/**
 * The strands that actually have something in them — derived from the published
 * pieces, never from `JOURNAL_STRANDS`.
 *
 * That distinction is the whole reason this function exists. The plan lists
 * eight potential content areas; printing all eight as filter buttons would
 * offer a reader eight categories, seven of which return nothing. Only a strand
 * with a piece behind it can be filtered to.
 */
export function activeCategories(articles: ArchiveArticle[]): JournalCategory[] {
  const seen = new Set<JournalCategory>();
  for (const article of articles) {
    if (article.category) seen.add(article.category);
  }
  return [...seen];
}

/**
 * WHETHER TO SHOW A FILTER AT ALL.
 *
 * Two distinct categories is the threshold, because one category is not a
 * choice — a row reading "All · Journal" where both buttons return the same
 * pieces is furniture, and the brief for this page is explicit that a filter
 * should be omitted rather than forced. With today's empty archive this is
 * false and the row is not rendered; it raises itself when the editorial
 * actually spans two strands.
 */
export function shouldFilter(articles: ArchiveArticle[]): boolean {
  return activeCategories(articles).length >= 2;
}

/** Filtering runs on the data; the grid renders exactly what comes back. */
export function filterArticles(
  articles: ArchiveArticle[],
  filter: FilterId,
): ArchiveArticle[] {
  if (filter === ALL) return articles;
  return articles.filter((article) => article.category === filter);
}

/**
 * How many pieces each category holds. Printed beside its label, so the shape
 * of the archive is legible before a reader spends a click on it — the same
 * device /work uses on its industry row.
 */
export function categoryCounts(
  articles: ArchiveArticle[],
): Record<string, number> {
  const counts: Record<string, number> = { [ALL]: articles.length };
  for (const category of activeCategories(articles)) {
    counts[category] = filterArticles(articles, category).length;
  }
  return counts;
}
