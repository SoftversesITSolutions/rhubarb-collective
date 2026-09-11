"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createInsightsAnimation } from "@/lib/insights/pageAnimation";

/**
 * The page's motion shell — the arrangement /contact, /work and /services use.
 *
 * The masthead and the colophon are passed through as children rather than
 * imported, so they stay server-rendered and never reach the browser bundle;
 * `InsightsArchive` is a client component in its own right because it holds the
 * filter state.
 *
 * `data-in-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame. The `noscript` block in the root layout releases it
 * outright — with scripting off the archive is a complete, readable page.
 */
export function InsightsPageMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createInsightsAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="in" data-in-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
