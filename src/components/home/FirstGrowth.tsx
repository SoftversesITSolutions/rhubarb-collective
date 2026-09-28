"use client";

import { useEffect, useMemo, useRef } from "react";
import { generateCascade } from "@/lib/first-growth/cascade";
import { useViewport } from "@/lib/hero/useViewport";
import { ANNOTATION_OPTIONS, RIDGE_OPTIONS, firstGrowthConfig } from "@/lib/first-growth/config";
import { annotationZones, deriveAnnotations } from "@/lib/first-growth/annotations";
import { generateRidges } from "@/lib/first-growth/ridgelines";
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

    // The ridgeline field (note 4): its crests carry the values, and it fades
    // under every block of type — the copy and the labels — and around the
    // spine. The connection mesh this section used to draw is retired: the
    // field is the section's texture now, and chords across it read as clutter.
    //
    // The zones it fades under are the blocks of copy from the config, minus
    // the value rectangles there (those start at the anchor and would hide the
    // crest apex the value sits on), plus the label boxes shifted past the
    // label's own inline padding, so the apex and its node stay in the clear
    // and the fade begins where the words begin.
    const labelInset = network.width * 0.044; // padding-inline of an anchored value
    const isValueZone = (zone: { x: number; y: number; width: number; height: number }) =>
      annotationOptions.slots.some((slot) => {
        const ax = slot.x * network.width;
        const ay = slot.y * network.height;
        const edge = slot.side === "right" ? zone.x : zone.x + zone.width;
        return Math.abs(zone.y + zone.height / 2 - ay) < 30 && Math.abs(edge - ax) < 30;
      });
    const labelZones = annotationZones(
      annotations,
      network,
      annotationOptions.labelWidth,
      annotationOptions.labelHeight,
    ).map((zone, i) => {
      const side = annotations[i]?.side ?? "right";
      return side === "right"
        ? { ...zone, x: zone.x + labelInset, width: zone.width - labelInset }
        : { ...zone, width: zone.width - labelInset };
    });
    const maskZones = [...config.keepOut.filter((zone) => !isValueZone(zone)), ...labelZones];
    const ridges = generateRidges(network, maskZones, {
      ...RIDGE_OPTIONS[tier],
      crests: annotationOptions.anchored
        ? annotationOptions.slots.map((slot) => ({
            x: slot.x * network.width,
            y: slot.y * network.height,
          }))
        : [],
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
      ridges,
      annotations,
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
      ridges: model.ridges,
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
      {/*
        Everything visible sits in one stage so the dive can bring the whole
        section toward the reader as the hero's black lifts off it. The
        section box itself is never transformed: it is what gets pinned, and
        what later sections measure.
      */}
      <div className="fg-stage" data-fg="stage">
        {model && (
          <FirstGrowthNetwork
            network={model.network}
            ridges={model.ridges}
            connections={[]}
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
      </div>
    </section>
  );
}
