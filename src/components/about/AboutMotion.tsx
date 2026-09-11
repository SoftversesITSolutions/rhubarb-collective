"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "@/lib/hero/useViewport";
import { createAboutAnimation } from "@/lib/about/animation";

/**
 * The page's only client component.
 *
 * Everything inside it is server-rendered: the sections are plain markup with
 * no state, no effects and no interactivity, and they are passed through here
 * as children rather than imported, so none of them is dragged into the client
 * bundle. This shell is the whole cost of the motion — one element ref, the
 * shared reduced-motion listener the rest of the site already uses, and one
 * call into `lib/about/animation`.
 *
 * `data-about-state="idle"` is in the server HTML, which is what holds the
 * resting state before the first frame; the animation flips it to "running" or
 * "static" once it knows which. See about.css and the `noscript` block in the
 * root layout for the two states that exist without JavaScript.
 */
export function AboutMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createAboutAnimation({ root, reducedMotion });
  }, [reducedMotion]);

  return (
    <main className="about" data-about-state="idle" ref={rootRef}>
      {children}
    </main>
  );
}
