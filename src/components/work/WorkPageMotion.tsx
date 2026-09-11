"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createWorkIntro } from "@/lib/work/pageAnimation";

/**
 * The page's motion shell.
 *
 * `WorkPageHero` is passed through as a child rather than imported, so it stays
 * server-rendered and never reaches the browser bundle — the same arrangement
 * `ContactPageMotion` uses. `WorkArchive` is a client component in its own
 * right and owns the filtering and the archive's own reveals; this shell owns
 * only the entrance.
 *
 * It queries the whole subtree for `[data-wk-intro]`, which is how the filter
 * row — rendered by a different component — joins the same entrance as the
 * heading. React runs a child's effects before its parent's, so the row is in
 * the document by the time this runs.
 *
 * `data-wk-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame; `createWorkIntro` replaces it with "running" or
 * "static". The `noscript` block in the root layout releases it outright, so
 * with scripting off the archive is a plain, complete, readable page of
 * pictures.
 */
export function WorkPageMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createWorkIntro({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="wk" data-wk-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
