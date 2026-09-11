"use client";

import { useEffect, useState } from "react";
import type { Tier } from "./config";

/** Breakpoints the hero art-directs against. */
const TABLET_MIN = 700;
const DESKTOP_MIN = 1100;

function readTier(): Tier {
  const w = window.innerWidth;
  if (w >= DESKTOP_MIN) return "desktop";
  if (w >= TABLET_MIN) return "tablet";
  return "mobile";
}

/**
 * Viewport state for the hero.
 *
 * `tier` is null until after mount: the server has no viewport, so the network
 * is only generated once the real breakpoint is known. That also means the
 * markup React hydrates is identical on both sides — the first paint is the
 * intentional black void, and the system appears into it.
 */
export function useViewport() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setTier(readTier());
      setReducedMotion(motion.matches);
    };

    sync();
    window.addEventListener("resize", sync);
    motion.addEventListener("change", sync);
    return () => {
      window.removeEventListener("resize", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return { tier, reducedMotion };
}
