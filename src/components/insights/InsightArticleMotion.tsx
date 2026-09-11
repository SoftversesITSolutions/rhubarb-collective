"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createInsightArticleAnimation } from "@/lib/insights/articleAnimation";

/**
 * The page's motion shell, and its only client component.
 *
 * Everything inside is server-rendered — the masthead, the hero, every block,
 * the colophon and the return — and passed through as children rather than
 * imported, so none of it is dragged into the browser bundle. This shell is the
 * whole cost of the motion: one ref, the shared reduced-motion listener, and
 * one call into `lib/insights/articleAnimation`.
 *
 * `data-ia-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame; the `noscript` block in the root layout releases it
 * outright, so with scripting off the whole piece is readable.
 *
 * The arrangement /contact, /work, /services, /insights and the case study all
 * use. Nothing new is introduced here.
 */
export function InsightArticleMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createInsightArticleAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="ia" data-ia-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
