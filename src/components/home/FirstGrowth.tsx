"use client";

import { useEffect, useMemo, useRef } from "react";
import { generateCascade } from "@/lib/first-growth/cascade";
import { useViewport } from "@/lib/hero/useViewport";
import {
  ANNOTATION_OPTIONS,
  CONNECTION_OPTIONS,
  firstGrowthConfig,
} from "@/lib/first-growth/config";
import { annotationZones, deriveAnnotations } from "@/lib/first-growth/annotations";
import { deriveConnections } from "@/lib/first-growth/connections";
import { createFirstGrowthAnimation } from "@/lib/first-growth/animation";
import { FirstGrowthContent } from "./FirstGrowthContent";
import { FirstGrowthNetwork } from "./FirstGrowthNetwork";
import "./firstGrowth.css";

/**
 * SECTION 02 — FIRST GROWTH
 *
 * The hero's ecosystem, one field further down. Nothing is pinned here and
 * nothing is regenerated per frame: the network, its connection mesh and its
 * annotation anchors are all derived once per breakpoint and then only
 * animated.
 *
 * The section's height comes from an aspect-ratio locked in CSS to the same
 * proportion as the generated field. That is what lets the copy be positioned
 * in percentages that land exactly on the keep-out rectangles the generator
 * grew around — and it means the section reserves its correct height during
 * server render, so the network appearing on mount shifts nothing.
 */
export function FirstGrowth() {
  const rootRef = useRef<HTMLElement>(null);
  const { tier, reducedMotion } = useViewport();

  const model = useMemo(() => {
    if (!tier) return null;

    const config = firstGrowthConfig(tier);
    const network = generateCascade(config);
    const annotationOptions = ANNOTATION_OPTIONS[tier];

    const annotations = annotationOptions.anchored
      ? deriveAnnotations(network, {
          slots: annotationOptions.slots,
          maxLeader: annotationOptions.maxLeader,
        })
      : [];

    // Chords must avoid the labels as well as the blocks of type — a link
    // drawn through a word costs more than the link is worth.
    const connections = deriveConnections(network, {
      ...CONNECTION_OPTIONS[tier],
      keepOut: [
        ...config.keepOut,
        ...annotationZones(
          annotations,
          network,
          annotationOptions.labelWidth,
          annotationOptions.labelHeight,
        ),
      ],
    });

    // The Work route: the trunk run that reaches deepest. Offshoots are
    // excluded — the route onward has to be a main line, not a side twig.
    const workBranch = network.branches
      .filter((branch) => branch.depth === 0)
      .reduce<(typeof network.branches)[number] | null>(
        (deepest, branch) => (!deepest || branch.tip.y > deepest.tip.y ? branch : deepest),
        null,
      );

    return {
      network,
      annotations,
      connections,
      anchored: annotationOptions.anchored,
      workBranchId: workBranch?.id ?? null,
    };
  }, [tier]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !model || !tier) return;

    return createFirstGrowthAnimation({
      root,
      network: model.network,
      tier,
      reducedMotion,
    });
  }, [model, tier, reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="about"
      className="first-growth"
      data-fg-state="idle"
      aria-labelledby="fg-heading"
    >
      {model && (
        <FirstGrowthNetwork
          network={model.network}
          connections={model.connections}
          annotations={model.annotations}
          workBranchId={model.workBranchId}
        />
      )}

      <FirstGrowthContent
        annotations={model?.annotations ?? []}
        anchored={Boolean(model?.anchored)}
      />

      {/*
        The section's lower edge, in the hero's boundary language: the same
        procedural halftone ramp. There are no separate strand fragments drawn
        here any more — the Work trunk itself grows down through the band and
        crosses it, so the handoff is the network rather than a decoration of
        it.
      */}
      <div className="fg-boundary" data-fg="boundary" aria-hidden="true">
        <span className="fg-boundary__halftone" />
      </div>
    </section>
  );
}
