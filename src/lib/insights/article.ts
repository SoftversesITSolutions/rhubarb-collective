/**
 * /insights/[slug] — THE SHAPE OF A PIECE
 * =======================================
 *
 * The type an insight-detail page consumes, and the registry it is looked up
 * in. It is the editorial twin of `lib/work/case-study`, and it is written the
 * same way and for the same reason: the page component renders whatever object
 * it is handed, hardcodes no sentence, and imports no piece.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BUILT FOR /insights/[slug], SHIPPED AS ONE STATIC ROUTE
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no backend, no CMS, no API and no dynamic segment, and none is
 * stubbed. What exists is the seam: one exported `Insight` shape, one registry
 * keyed by slug, one renderer that branches on a block's `type` rather than on
 * its position. The conversion later is four steps:
 *
 *   1  move `app/insights/stories-insights-and-musings/page.tsx`
 *      to `app/insights/[slug]/page.tsx`
 *   2  `const piece = getInsight(params.slug); if (!piece) notFound();`
 *   3  add `generateStaticParams` over `insightSlugs()`
 *   4  swap `INSIGHTS` for the CMS client — this shape is the contract
 *
 * `generateMetadata` already derives from the object rather than from the file,
 * so it needs no change at all.
 *
 * THE BRIEF'S FIELD NAMES, AND WHERE THEY LIVE HERE. `content` is `blocks`,
 * because the body of a piece is an ordered sequence of typed blocks rather
 * than a string — that is what lets a list, a figure and a typographic pause be
 * part of the article instead of chrome around it. `relatedImages` is not a
 * field: a supporting picture is a `figure` block in reading order, so it is
 * placed in the piece rather than dumped into a gallery beneath it.
 * `nextArticle` is `next`, and it is nullable — see below.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT A PIECE MAY NOT CONTAIN
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no field for a view count, a share count, a comment, a tag cloud, a
 * related-posts array or an author biography, and that is deliberate rather
 * than an omission. None of those exists for any piece Rhubarb has, and a shape
 * with an `authorBio` on it is an invitation to write one.
 *
 * `author`, `publishedAt` and `iso` are all NULLABLE and all default to absent.
 * A piece with no byline renders with no byline; with no date, no date. Nothing
 * on this route fills in a missing field — the same rule `lib/insights/archive`
 * and `lib/work/case-study` are written under.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READING TIME IS COMPUTED, NEVER AUTHORED
 * ─────────────────────────────────────────────────────────────────────────────
 * There is no `readingTime` field, because a hand-typed one is a number nobody
 * checks. `readingMinutes` counts the words actually in the piece's prose and
 * divides; see its own note for what counts and why.
 */

/* ------------------------------------------------------------------ *
 * PIECES
 * ------------------------------------------------------------------ */

/**
 * A supplied editorial image.
 *
 * Intrinsic pixel size is carried so `next/image` can build a srcset and the
 * frame can reserve the proportions before the file lands — nothing distorts
 * and nothing shifts. `caption` is optional and is omitted rather than written:
 * a descriptive line invented for a picture is the caption that reads as
 * reportage and is not.
 */
export interface InsightImage {
  /** Path under `public/`. */
  src: string;
  width: number;
  height: number;
  /** What is visibly in the frame. Never a claim about the piece. */
  alt: string;
  /** Names the artefact. Null where none is genuinely known. */
  caption?: string | null;
  /** Rendered width at each tier, for the responsive srcset. */
  sizes: string;
}

/**
 * A block of the piece.
 *
 *   "lede"    the opening paragraph, set one step up. Typography, not content:
 *             it is the piece's first paragraph and nothing else.
 *   "prose"   paragraphs, with an optional heading above them.
 *   "pause"   the page's one typographic break — a line from the piece set at
 *             display scale, alone in the field.
 *   "figure"  one picture with an optional caption under it.
 *   "list"    a label and its items. Only where the piece genuinely contains a
 *             list; a paragraph chopped into bullets is not one.
 *
 * A block carries only what it has. The renderer branches on `type` and never
 * on position, so re-ordering this array re-orders the page — which is what a
 * CMS will do when it hands the route a different sequence.
 */
export type InsightBlockType = "lede" | "prose" | "pause" | "figure" | "list";

/**
 * Placement in the 12-column field, mapped to the rules in
 * `insight-article.css`. Art-directed per block: a piece is a fixed, curated
 * sequence, so hand-placement is right here in a way it is not on the
 * filterable /insights archive, where a slot has to survive an arbitrary subset.
 */
export type InsightSlot =
  | "full"
  | "wide-left"
  | "wide-right"
  | "narrow-left"
  | "narrow-right";

export interface InsightBlock {
  id: string;
  type: InsightBlockType;
  /** The block marker — 01, 02 … Null for an unmarked block. */
  index?: string | null;
  /** Small label above the heading. */
  label?: string | null;
  heading?: string | null;
  body?: string[];
  /** For a "list" block. */
  items?: readonly string[];
  image?: InsightImage | null;
  /** Where a quoted block came from, printed under it at the quietest weight. */
  source?: string | null;
  slot?: InsightSlot;
}

/**
 * The note that closes the piece.
 *
 * A colophon, not a call to action — /insights closes the same way, and for the
 * same reason: the site's three real invitations live on /about, /services and
 * /contact, and the footer directly beneath carries every contact route the
 * site has. Nullable, because a piece is not required to carry one.
 */
export interface InsightColophon {
  label: string;
  body: string[];
}

/**
 * The one link onward.
 *
 * NULL WHERE THERE IS NO SECOND PIECE, and that is the state today. A "next
 * read" pointing at an article that does not exist is the 404 this project
 * refuses everywhere; a "next read" pointing back at the archive is the return
 * link the page already has, printed twice.
 */
export interface InsightNext {
  label: string;
  title: string;
  /** What that piece is. Null where it has no stated strand. */
  kind?: string | null;
  href: string;
}

/* ------------------------------------------------------------------ *
 * THE PIECE
 * ------------------------------------------------------------------ */

export interface Insight {
  /** URL segment. `/insights/<slug>` today, `/insights/[slug]` later. */
  slug: string;
  /**
   * What kind of piece this is — the strand, where one is stated. Printed as
   * the eyebrow above the title and in the metadata line.
   */
  kind: string;
  /** The page's H1, and the strongest typographic element on it. */
  title: string;
  /** A standfirst lifted from the piece. Null where the piece has none. */
  excerpt: string | null;
  /** Byline. Null where the piece is unsigned. */
  author: string | null;
  /** Display date, already formatted. Null where none is set. */
  publishedAt: string | null;
  /**
   * The same date, machine-readable (YYYY-MM-DD), for `<time dateTime>`. Kept
   * separate from `publishedAt` for the reason `JournalEntry.iso` documents:
   * deriving an ISO date by parsing a hand-typed display string is how a piece
   * ends up announcing the wrong day to every machine reading it.
   */
  iso: string | null;
  /** The opening picture. Null where the piece has none — no stand-in is used. */
  heroImage: InsightImage | null;
  /** The body of the piece, in reading order. */
  blocks: InsightBlock[];
  colophon: InsightColophon | null;
  next: InsightNext | null;
  /** For `generateMetadata`, today and after the route goes dynamic. */
  meta: {
    title: string;
    description: string;
  };
}

/* ------------------------------------------------------------------ *
 * READING TIME
 * ------------------------------------------------------------------ */

/** Words a minute. The conventional figure for adult reading of prose. */
const WORDS_PER_MINUTE = 200;

/**
 * How long the piece takes to read, from the piece.
 *
 * DETERMINISTIC AND DERIVED — never a field, never a guess. It counts the
 * whitespace-separated words of the blocks a reader actually reads through:
 * the lede, prose paragraphs and the typographic pause. A list's items and a
 * picture's caption are scanned rather than read and are excluded, and headings
 * are excluded for the same reason; including them would inflate the number on
 * exactly the pieces that are mostly structure.
 *
 * Rounded up, and never below one — a piece that takes forty seconds does not
 * take zero minutes.
 */
export function readingMinutes(piece: Insight): number {
  const prose: string[] = [];

  for (const block of piece.blocks) {
    if (block.type === "lede" || block.type === "prose") {
      if (block.body) prose.push(...block.body);
    } else if (block.type === "pause" && block.heading) {
      prose.push(block.heading);
    }
  }

  const words = prose.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** How that number is printed. One string, so it reads the same everywhere. */
export function readingTimeLabel(piece: Insight): string {
  return `${readingMinutes(piece)} min read`;
}

/* ------------------------------------------------------------------ *
 * THE REGISTRY
 * ------------------------------------------------------------------ */

import { STORIES_INSIGHTS_AND_MUSINGS } from "./articles/stories-insights-and-musings";

/**
 * Every piece the site has a detail page for. One today.
 *
 * Keyed by slug so the future dynamic route is a lookup rather than a scan, and
 * so `generateStaticParams` is `Object.keys` of this.
 *
 * THIS IS NOT THE ARCHIVE'S LIST. `JOURNAL_ENTRIES` in `lib/journal/config`
 * remains the one source of truth for what the site has *published* — /insights
 * and the homepage's Section 07 both render it, and it is still empty. A piece
 * appears in those two places only when an entry is added there, at which point
 * its `href` becomes `/insights/<slug>` and the archive links to the page this
 * registry already serves. The two lists are joined by the slug and by nothing
 * else, which is what lets a detail page exist without the archive claiming a
 * publication it has not made.
 */
export const INSIGHTS: Record<string, Insight> = {
  [STORIES_INSIGHTS_AND_MUSINGS.slug]: STORIES_INSIGHTS_AND_MUSINGS,
};

export function getInsight(slug: string): Insight | null {
  return INSIGHTS[slug] ?? null;
}

export function insightSlugs(): string[] {
  return Object.keys(INSIGHTS);
}

/** Where a piece lives, for whoever wires the archive's `href` to it. */
export function insightHref(slug: string): string {
  return `/insights/${slug}`;
}
