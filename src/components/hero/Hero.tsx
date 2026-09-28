"use client";

import { useEffect, useMemo, useRef } from "react";
import { NETWORK_CONFIG } from "@/lib/hero/config";
import { createHeroAnimation } from "@/lib/hero/animation";
import { generateOrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import { HeroBoundary } from "./HeroBoundary";
import { HeroIntro } from "./HeroIntro";
import { HeroNetwork } from "./HeroNetwork";
import { HeroTypography } from "./HeroTypography";
import "./hero.css";

/**
 * Hero orchestrator.
 *
 * Responsibilities are deliberately thin: own the two refs the animation needs,
 * generate the network once per breakpoint, and hand both to the timeline
 * builder. No animation logic lives here.
 *
 * The network is generated on the client only. The server has no viewport, and
 * mobile is a different composition rather than a scaled desktop one, so
 * committing to a tier before the breakpoint is known would either produce the
 * wrong art direction or a hydration mismatch. The pre-mount frame is the black
 * void the storyboard opens on, with every word of copy already in the HTML.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();

  // Regenerating only when the tier changes is what keeps this off the render
  // path; resizing within a breakpoint never rebuilds the system.
  const network = useMemo(
    () => (tier ? generateOrganicNetwork(NETWORK_CONFIG[tier]) : null),
    [tier],
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || !network || !tier) return;

    return createHeroAnimation({ root, stage, network, tier, reducedMotion });
  }, [network, tier, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="home"
      className="hero"
      data-hero-state="idle"
      aria-label="Rhubarb Collective"
    >
      <div ref={stageRef} className="hero__stage">
        {network && <HeroNetwork network={network} />}
        <HeroTypography />
        {network && <HeroBoundary descenders={network.descenders} />}
        {/*
          Always rendered, never gated on the network: it is the first thing
          on screen, so its image must be in the server HTML to be preloaded,
          and its pre-reveal state is plain CSS so the first frame stays the
          void whether or not JavaScript has arrived yet.
        */}
        <HeroIntro />
      </div>
    </section>
  );
}
