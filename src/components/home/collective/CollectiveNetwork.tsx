import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import type { PersonAnchor } from "@/lib/collective/network";

interface CollectiveNetworkProps {
  network: OrganicNetwork;
  /** Short reaches from real junctions into the portraits that have one. */
  anchors: PersonAnchor[];
}

/**
 * The network reaching the people, as addressable SVG.
 *
 * One field across the whole section, never clipped to a portrait and always
 * beneath them. The viewBox is the section's measured pixel size, so one user
 * unit is one pixel: curvature, stroke weight and node roundness all survive
 * intact and stroke-dash lengths come straight from the generator.
 *
 * Stroke opacities are lower than Section 4's on purpose. The organism is the
 * same; it is quieter here because the people are the subject.
 */
function CollectiveNetworkView({ network, anchors }: CollectiveNetworkProps) {
  const { width, height, branches, nodes } = network;

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
    <g key={node.id} data-collective-node="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.24}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.78}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.78 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-collective-group={branch.id}>
      <path
        data-collective-path=""
        data-depth={branch.depth}
        data-start={branch.growthStart}
        data-duration={branch.growthDuration}
        d={branch.d}
        fill="none"
        stroke="var(--rh-cream)"
        strokeWidth={branch.width}
        strokeOpacity={branch.opacity * 0.62}
        strokeLinecap="round"
        style={{ strokeDasharray: branch.length, strokeDashoffset: branch.length }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="collective__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-collective-layer="growth">{branches.map(renderBranch)}</g>

      {/* The last few units into a frame. Each one starts at a real node of the
          layer above; none of them is a leader line drawn to a label. */}
      <g data-collective-layer="anchors">
        {anchors.map((anchor) => (
          <path
            key={`${anchor.nodeId}-${anchor.index}`}
            data-collective-anchor=""
            data-at={anchor.appearAt}
            d={anchor.d}
            fill="none"
            stroke="var(--rh-cream)"
            strokeWidth={anchor.width}
            strokeOpacity={anchor.opacity}
            strokeLinecap="round"
            style={{ strokeDasharray: anchor.length, strokeDashoffset: anchor.length }}
          />
        ))}
      </g>
    </svg>
  );
}

export const CollectiveNetwork = memo(CollectiveNetworkView);
