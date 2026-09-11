import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";

interface BranchesNetworkProps {
  network: OrganicNetwork;
}

/**
 * The branching, as addressable SVG.
 *
 * One field across the whole section, never clipped to a card, always beneath
 * them. The viewBox is the section's measured pixel size, so one user unit is
 * one pixel: curvature, stroke weight and node roundness all survive intact and
 * stroke-dash lengths come straight from the generator.
 */
function BranchesNetworkView({ network }: BranchesNetworkProps) {
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
    <g key={node.id} data-branch-node="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.3}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.92}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.92 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-branch-group={branch.id}>
      <path
        data-branch-path=""
        data-depth={branch.depth}
        data-start={branch.growthStart}
        data-duration={branch.growthDuration}
        d={branch.d}
        fill="none"
        stroke="var(--rh-cream)"
        strokeWidth={branch.width}
        strokeOpacity={branch.opacity * 0.78}
        strokeLinecap="round"
        style={{ strokeDasharray: branch.length, strokeDashoffset: branch.length }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="branches__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-branch-layer="growth">{branches.map(renderBranch)}</g>
    </svg>
  );
}

export const BranchesNetwork = memo(BranchesNetworkView);
