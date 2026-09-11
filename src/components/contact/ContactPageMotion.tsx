"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createContactPageAnimation } from "@/lib/contact/pageAnimation";

/**
 * The page's only client component.
 *
 * Everything inside it is server-rendered — the hero, the routes and the
 * closing are plain markup with no state and no interactivity — and they are
 * passed through as children rather than imported, so none of them is dragged
 * into the client bundle. This shell is the whole cost of the motion: one ref,
 * the shared reduced-motion listener the rest of the site already uses, and one
 * call into `lib/contact/pageAnimation`.
 *
 * `data-cp-state="idle"` ships in the server HTML and holds the resting state
 * before the first frame; the animation replaces it with "running" or "static"
 * once it knows which. The `noscript` block in the root layout releases it when
 * there is no JavaScript at all.
 */
export function ContactPageMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createContactPageAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="cp" data-cp-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
