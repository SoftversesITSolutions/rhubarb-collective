"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import {
  ALL,
  FILTER_COUNTS,
  INDUSTRIES,
  filterPieces,
  type FilterId,
  type Industry,
} from "@/lib/work/archive";
import { WORK_PAGE_FILTER } from "@/lib/work/pageContent";
import {
  createWorkArchiveReveal,
  playWorkFilterTransition,
} from "@/lib/work/pageAnimation";
import { ArchivePiece } from "./ArchivePiece";

/**
 * THE ARCHIVE, AND THE ONE CONTROL ON THE PAGE.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE FILTER RUNS ON THE DATA, NOT ON THE DOM
 * ─────────────────────────────────────────────────────────────────────────────
 * `filterPieces` returns the pieces to show and this component renders exactly
 * those. Nothing is hidden with `display: none`, nothing is toggled with a class,
 * and no `<img>` outside the current view is in the document — so a reader who
 * arrives and picks Health & Wellness downloads one picture, not six. It also
 * means the tab order and what a screen reader announces are always the archive
 * as filtered, with no invisible items in between.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ROW IS BUTTONS, NOT A SELECT AND NOT A RADIOGROUP
 * ─────────────────────────────────────────────────────────────────────────────
 * Real `<button>`s, so Tab reaches every category and Enter or Space picks one
 * without a line of key handling. `aria-pressed` carries the state, so the
 * active category is announced rather than only drawn — and it is drawn too, in
 * full-strength cream over a hairline, against cream-42 for the rest.
 *
 * A `role="radiogroup"` would describe "exactly one of these" more precisely,
 * but it also requires roving tabindex and arrow-key handling to be correct, and
 * a filter row that half-implements a radiogroup is less accessible than an
 * honest set of toggles. The count beside each label does the rest of the work:
 * a reader can see the shape of the archive before spending a click on it.
 *
 * The tally under the row is the live region. Changing the filter re-renders the
 * grid silently otherwise — a keyboard or screen-reader user would press a
 * button and be told nothing happened.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MOTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Two effects, because the two jobs have different lifetimes. The scroll reveal
 * is rebuilt whenever the visible set changes — six triggers is nothing to
 * recreate and a diff would be a FLIP system in all but name. The filter
 * transition runs only on an actual change of filter, never on the first paint,
 * so arriving at the page does not play a transition for something the reader
 * did not do.
 */
export function WorkArchive() {
  const [filter, setFilter] = useState<FilterId>(ALL);
  const { reducedMotion } = useViewport();

  const gridRef = useRef<HTMLDivElement>(null);
  /** Guards the transition against the first paint. */
  const mounted = useRef(false);

  const pieces = useMemo(() => filterPieces(filter), [filter]);

  /** Industry ids resolved to their labels once, for the captions. */
  const industryById = useMemo(
    () => new Map(INDUSTRIES.map((industry) => [industry.id, industry])),
    [],
  );

  const clients = useMemo(
    () => new Set(pieces.map((piece) => piece.clientId)).size,
    [pieces],
  );

  /* ---- the scroll reveal, rebuilt for whatever is on screen ---- */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    return createWorkArchiveReveal({ root: grid, reducedMotion });
  }, [reducedMotion, filter]);

  /* ---- the filter transition, on a real change only ---- */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    playWorkFilterTransition(grid, reducedMotion);
  }, [filter, reducedMotion]);

  return (
    <section className="wk-archive" aria-labelledby="wk-archive-title">
      <h2 className="visually-hidden" id="wk-archive-title">
        The archive
      </h2>

      {/* ================= the filter ================= */}
      <div className="wk-filter" data-wk-intro="">
        <p className="wk-filter__label" id="wk-filter-label">
          {WORK_PAGE_FILTER.label}
        </p>

        <div className="wk-filter__row" role="group" aria-labelledby="wk-filter-label">
          <FilterButton
            id={ALL}
            label={WORK_PAGE_FILTER.allLabel}
            active={filter === ALL}
            onSelect={setFilter}
          />

          {INDUSTRIES.map((industry) => (
            <FilterButton
              key={industry.id}
              id={industry.id}
              label={industry.label}
              active={filter === industry.id}
              onSelect={setFilter}
            />
          ))}
        </div>

        <p className="wk-filter__tally" role="status" aria-live="polite">
          {WORK_PAGE_FILTER.tally(pieces.length, clients)}
        </p>
      </div>

      {/* ================= the grid ================= */}
      <div className="wk-grid" ref={gridRef}>
        {pieces.map((piece, i) => (
          <ArchivePiece
            key={piece.id}
            piece={piece}
            position={i}
            industries={piece.industries
              .map((id) => industryById.get(id))
              .filter((industry): industry is Industry => Boolean(industry))}
            /* Only the very first piece of the unfiltered archive is worth
               fetching eagerly; after a filter change the browser is already
               holding every file it has shown. */
            priority={i === 0 && filter === ALL}
          />
        ))}
      </div>

      {/*
        Cannot happen with today's data — every category in the row comes from a
        client that has work in the archive, and the counts beside the labels
        would show a zero long before anyone clicked one. It exists so that a
        filter which one day returns nothing says so, instead of rendering a
        page that merely looks broken.
      */}
      {pieces.length === 0 && <p className="wk-empty">{WORK_PAGE_FILTER.empty}</p>}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * ONE CATEGORY
 * ------------------------------------------------------------------ */

interface FilterButtonProps {
  id: FilterId;
  label: string;
  active: boolean;
  onSelect: (id: FilterId) => void;
}

/**
 * A word, a count and — when it is the active one — a hairline under it.
 *
 * No pill, no chip, no border box, no fill, no radius and no close button. The
 * page has one underline language and this uses it, so a category reads as the
 * same kind of object as a route on the Contact page or a link in the About
 * coda.
 *
 * The count is inside the button and inside its accessible name, so "Food &
 * Drink, 3" is what a screen reader announces — the same information the row
 * gives visually, rather than a decorative number a sighted reader gets for free.
 */
function FilterButton({ id, label, active, onSelect }: FilterButtonProps) {
  return (
    <button
      type="button"
      className="wk-filter__item"
      aria-pressed={active}
      data-active={active ? "" : undefined}
      onClick={() => onSelect(id)}
    >
      <span className="wk-filter__name">{label}</span>
      <span className="wk-filter__count">{FILTER_COUNTS[id]}</span>
    </button>
  );
}
