"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import {
  ALL,
  ARCHIVE_ARTICLES,
  activeCategories,
  categoryCounts,
  filterArticles,
  shouldFilter,
  type FilterId,
} from "@/lib/insights/archive";
import { INSIGHTS_ARCHIVE } from "@/lib/insights/pageContent";
import { playInsightsFilterTransition } from "@/lib/insights/pageAnimation";
import { ArticleCard } from "./ArticleCard";

/**
 * THE ARCHIVE.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IT IS EMPTY TODAY, AND EVERY PART OF IT IS REAL
 * ─────────────────────────────────────────────────────────────────────────────
 * `ARCHIVE_ARTICLES` reads the site's one editorial list, which has nothing in
 * it — no article, byline, date, excerpt, image or URL exists in any supplied
 * file. So this renders its empty state rather than a grid of invented posts.
 * Nothing below is a mock-up of a future feature: publishing one entry in
 * `JOURNAL_ENTRIES` gives it the feature slot and the grid composes around it,
 * and a second strand raises the filter row on its own.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE FILTER RAISES ITSELF, AND ONLY WHEN IT IS USEFUL
 * ─────────────────────────────────────────────────────────────────────────────
 * `shouldFilter` requires two distinct strands among the PUBLISHED pieces. The
 * plan lists eight potential content areas, and printing all eight would offer
 * a reader eight buttons, seven of which return nothing; a single strand is not
 * a choice either. So the row is absent today, absent with one strand, and
 * present the moment the editorial genuinely spans two.
 *
 * When it is shown it is /work's row exactly — real `<button>`s so Tab reaches
 * every strand and Enter or Space picks one with no key handling, `aria-pressed`
 * carrying the state, the count beside each label, and the tally beneath as the
 * live region so a keyboard or screen-reader user is told what changed.
 *
 * Filtering runs on the data: the grid renders exactly what comes back, so no
 * hidden article is ever in the document and no image outside the current view
 * is downloaded.
 */
export function InsightsArchive() {
  const [filter, setFilter] = useState<FilterId>(ALL);
  const { reducedMotion } = useViewport();

  const gridRef = useRef<HTMLDivElement>(null);
  /** Guards the transition against the first paint. */
  const mounted = useRef(false);

  const showFilter = useMemo(() => shouldFilter(ARCHIVE_ARTICLES), []);
  const categories = useMemo(() => activeCategories(ARCHIVE_ARTICLES), []);
  const counts = useMemo(() => categoryCounts(ARCHIVE_ARTICLES), []);
  const articles = useMemo(() => filterArticles(ARCHIVE_ARTICLES, filter), [filter]);

  const empty = ARCHIVE_ARTICLES.length === 0;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    playInsightsFilterTransition(grid, reducedMotion);
  }, [filter, reducedMotion]);

  return (
    <section className="in-archive" aria-labelledby="in-archive-title">
      <h2 className="visually-hidden" id="in-archive-title">
        {INSIGHTS_ARCHIVE.title}
      </h2>

      <div className="in-archive__header" data-in-block="">
        <span className="in-archive__rule" aria-hidden="true" data-in-rule="" />

        <p className="in-archive__marker" data-in-reveal="">
          {INSIGHTS_ARCHIVE.marker}
        </p>

        {showFilter && (
          <div className="in-filter" data-in-reveal="">
            <p className="in-filter__label" id="in-filter-label">
              {INSIGHTS_ARCHIVE.filterLabel}
            </p>

            <div
              className="in-filter__row"
              role="group"
              aria-labelledby="in-filter-label"
            >
              <FilterButton
                id={ALL}
                label={INSIGHTS_ARCHIVE.allLabel}
                count={counts[ALL]}
                active={filter === ALL}
                onSelect={setFilter}
              />

              {categories.map((category) => (
                <FilterButton
                  key={category}
                  id={category}
                  label={category}
                  count={counts[category]}
                  active={filter === category}
                  onSelect={setFilter}
                />
              ))}
            </div>
          </div>
        )}

        {/* The tally is the live region. It is only meaningful once there is
            something to count, so an empty archive says nothing here — the
            empty state below speaks for it. */}
        {!empty && (
          <p className="in-archive__tally" role="status" aria-live="polite">
            {INSIGHTS_ARCHIVE.tally(articles.length)}
          </p>
        )}
      </div>

      {empty ? (
        /*
         * THE EMPTY STATE — the accurate state of the project, said plainly.
         * "Unwritten" is the same word the homepage prints in a position with
         * no piece in it, so the two agree about what nothing looks like.
         */
        <div className="in-empty" data-in-block="">
          <p className="in-empty__heading" data-in-reveal="">
            {INSIGHTS_ARCHIVE.emptyHeading}
          </p>
          <p className="in-empty__body" data-in-reveal="">
            {INSIGHTS_ARCHIVE.emptyBody}
          </p>
        </div>
      ) : (
        <>
          <div className="in-grid" ref={gridRef}>
            {articles.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                position={i}
                priority={i === 0 && filter === ALL}
              />
            ))}
          </div>

          {/* A strand with nothing in it cannot happen while the row is derived
              from published pieces — but a filter that could render a blank page
              without saying so is a filter that will one day look broken. */}
          {articles.length === 0 && (
            <p className="in-empty__body in-empty__body--filtered">
              {INSIGHTS_ARCHIVE.filteredEmpty}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * ONE STRAND
 * ------------------------------------------------------------------ */

interface FilterButtonProps {
  id: FilterId;
  label: string;
  count: number;
  active: boolean;
  onSelect: (id: FilterId) => void;
}

/**
 * A word, a count, and a hairline under it when it is the active one. The
 * page's own underline language — no pill, no chip, no border box, no fill.
 * The count is inside the button and inside its accessible name, so a screen
 * reader hears "Journal, 3" like everyone else.
 */
function FilterButton({ id, label, count, active, onSelect }: FilterButtonProps) {
  return (
    <button
      type="button"
      className="in-filter__item"
      aria-pressed={active}
      data-active={active ? "" : undefined}
      onClick={() => onSelect(id)}
    >
      <span className="in-filter__name">{label}</span>
      <span className="in-filter__count">{count}</span>
    </button>
  );
}
