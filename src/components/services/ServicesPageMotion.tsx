"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createServicesAnimation } from "@/lib/services/pageAnimation";

/**
 * The page's motion shell, and the same arrangement /contact and /work use.
 *
 * The hero and the closing are passed through as children rather than
 * imported, so they stay server-rendered and never reach the browser bundle;
 * `ServiceIndex` is a client component in its own right because it holds the
 * disclosure state.
 *
 * `data-sv-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame; the animation replaces it with "running" or "static".
 * The `noscript` block in the root layout releases it outright — with scripting
 * off the page is a complete, readable catalogue, because every panel's content
 * is in the document rather than mounted on open.
 */
export function ServicesPageMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createServicesAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="sv" data-sv-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
