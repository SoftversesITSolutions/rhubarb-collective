"use client";

import { useCallback, useMemo, useState } from "react";
import { SERVICE_ENTRIES } from "@/lib/services/catalogue";
import { SERVICES_INDEX } from "@/lib/services/pageContent";
import { refreshServiceTriggers } from "@/lib/services/pageAnimation";
import { ServiceEntry } from "./ServiceEntry";

/**
 * THE INDEX — the page's one interactive component.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MANY CAN BE OPEN AT ONCE
 * ─────────────────────────────────────────────────────────────────────────────
 * A `Set`, not a single id. An accordion that closes one entry to open another
 * is right for navigation and wrong for a catalogue: a reader comparing what
 * Branding covers against what Consulting covers should be able to hold both
 * open, and closing their first choice out from under them to show the second
 * is the interaction fighting the page's whole subject.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SPINE
 * ─────────────────────────────────────────────────────────────────────────────
 * One continuous 1px rule running the full height of the index, with all six
 * numbers sitting on it. It is the page's argument in a single mark — six
 * disciplines on one thread rather than six products in six boxes — and it is
 * the whole of the graphic language here: no branching, no generated geometry,
 * no canvas, nothing procedural. `aria-hidden`, because it says nothing a
 * reader needs; the "Runs with" cross-reference inside each entry carries the
 * same idea in words.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT TOGGLING OWES THE REST OF THE PAGE
 * ─────────────────────────────────────────────────────────────────────────────
 * Opening an entry moves everything below it, so every scroll trigger past that
 * point is measuring against a stale position. `refreshServiceTriggers` is
 * called once the panel's CSS transition has actually finished — not on every
 * frame of it, which would recompute the whole page sixty times to arrive at
 * the same answer. `transitionend` fires per property, so it is filtered to the
 * one property that changes the height, and a timeout backs it up for the case
 * where the transition never runs at all (reduced motion, or a browser that
 * skips a transition on a hidden element).
 */
export function ServiceIndex() {
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  /** Resolves each entry's derived `sharesWith` indices to real titles. */
  const titleByIndex = useMemo(
    () => new Map(SERVICE_ENTRIES.map((entry) => [entry.index, entry.title])),
    [],
  );

  const toggle = useCallback((index: string) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

    /*
     * The panel animates `grid-template-rows` for 380ms (services-page.css).
     * Refreshing after it settles keeps every trigger below the entry honest;
     * refreshing during it would just be measuring a moving target.
     */
    window.setTimeout(refreshServiceTriggers, 420);
  }, []);

  return (
    <section className="sv-index" aria-labelledby="sv-index-title" data-sv-index="">
      <h2 className="visually-hidden" id="sv-index-title">
        {SERVICES_INDEX.title}
      </h2>

      <div className="sv-index__marker" data-sv-block="">
        <p className="sv-index__marker-label" data-sv-reveal="">
          {SERVICES_INDEX.marker}
        </p>
        <p className="sv-index__hint" data-sv-reveal="">
          {SERVICES_INDEX.hint}
        </p>
      </div>

      <div className="sv-index__field">
        {/* The thread the six numbers hang on. */}
        <span className="sv-index__spine" aria-hidden="true" data-sv-spine="" />

        <ol className="sv-index__list">
          {SERVICE_ENTRIES.map((entry) => (
            <ServiceEntry
              key={entry.index}
              entry={entry}
              open={open.has(entry.index)}
              onToggle={toggle}
              shares={entry.sharesWith.map((index) => ({
                index,
                title: titleByIndex.get(index) ?? index,
              }))}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
