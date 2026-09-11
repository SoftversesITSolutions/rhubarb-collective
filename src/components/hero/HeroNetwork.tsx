import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";

interface HeroNetworkProps {
  network: OrganicNetwork;
}

/**
 * Renders a generated network as addressable SVG.
 *
 * Structure — the animation layer targets these hooks by attribute:
 *
 *   g[data-layer="ambient"]        outermost, owns the slow idle breathe
 *     g[data-layer="growth"]       owns the scroll-driven expansion
 *       g[data-layer="behind"]     strands that run under the typography
 *       g[data-layer="front"]      everything routed around it
 *         g[data-branch-group]     one per branch
 *           path[data-branch]      the strand itself
 *           g[data-node]           junctions and tips on that strand
 *
 * Designed opacity is carried on stroke-opacity / fill-opacity so the timeline
 * can own plain CSS opacity without having to know any art-directed value.
 */
function HeroNetworkView({ network }: HeroNetworkProps) {
  const { width, height, seedPoint, branches, nodes, halftone } = network;

  const nodesByBranch = useMemo(() => {
    const map = new Map<string, NetworkNode[]>();
    for (const node of nodes) {
      const list = map.get(node.branchId);
      if (list) list.push(node);
      else map.set(node.branchId, [node]);
    }
    return map;
  }, [nodes]);

  const renderNode = (node: NetworkNode) => (
    <g
      key={node.id}
      data-node=""
      data-kind={node.kind}
      data-depth={node.depth}
      data-at={node.appearAt}
    >
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3.1}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.32}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-branch-group={branch.id} data-depth={branch.depth}>
      <path
        data-branch=""
        data-depth={branch.depth}
        data-start={branch.growthStart}
        data-duration={branch.growthDuration}
        d={branch.d}
        fill="none"
        stroke="var(--rh-cream)"
        strokeWidth={branch.width}
        strokeOpacity={branch.opacity}
        strokeLinecap="round"
        style={{
          strokeDasharray: branch.length,
          strokeDashoffset: branch.length,
        }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="hero-network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-layer="ambient">
        <g data-layer="growth">
          <g data-layer="behind" className="hero-network__behind">
            {branches.filter((b) => b.behind).map(renderBranch)}
          </g>

          <g data-layer="front">
            {branches.filter((b) => !b.behind).map(renderBranch)}

            {halftone.map((cluster) => (
              <g key={cluster.id} data-halftone="" data-at={cluster.appearAt}>
                {cluster.dots.map((dot, i) => (
                  <circle
                    key={i}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r}
                    fill="var(--rh-cream)"
                    fillOpacity={0.55}
                  />
                ))}
              </g>
            ))}

            {/* The origin. Phase 02 is this element and nothing else. */}
            <g data-seed="">
              <circle
                data-seed-ring=""
                cx={seedPoint.x}
                cy={seedPoint.y}
                r={11}
                fill="none"
                stroke="var(--rh-cream)"
                strokeWidth={0.7}
                strokeOpacity={0.3}
              />
              <circle
                data-seed-core=""
                cx={seedPoint.x}
                cy={seedPoint.y}
                r={4}
                fill="var(--rh-cream)"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export const HeroNetwork = memo(HeroNetworkView);
