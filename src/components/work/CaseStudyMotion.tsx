"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createCaseStudyAnimation } from "@/lib/work/caseStudyAnimation";

/**
 * The page's motion shell, and its only client component.
 *
 * Everything inside is server-rendered — the hero, the overview, every section
 * and the closing are plain markup with no state — and passed through as
 * children rather than imported, so none of them is dragged into the client
 * bundle. This shell is the whole cost of the motion: one ref, the shared
 * reduced-motion listener, and one call into `lib/work/caseStudyAnimation`.
 *
 * `data-cs-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame; the `noscript` block in the root layout releases it
 * outright, so with scripting off the whole case study is readable.
 */
export function CaseStudyMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createCaseStudyAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="cs" data-cs-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
