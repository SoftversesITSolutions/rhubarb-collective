import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";

interface WorkNetworkProps {
  network: OrganicNetwork;
}

/**
 * The continuation, as addressable SVG.
 *
 * One coherent field spanning the whole section — never clipped to an image
 * container — sitting on the layer beneath the work. The viewBox is the section's
 * measured pixel size, so one user unit is one pixel and nothing is distorted:
 * branch curvature, stroke weight and node roundness all survive intact, and
 * stroke-dash lengths can be taken straight from the generator.
 *
 * Structure mirrors Section 2's so the two read as one system:
 *   g[data-work-layer="growth"]
 *     g[data-work-branch-group]
 *       path[data-work-branch]
 *       g[data-work-node-mark]
 */
function WorkNetworkView({ network }: WorkNetworkProps) {
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
    <g key={node.id} data-work-node-mark="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.28}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.9}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.9 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-work-branch-group={branch.id}>
      <path
        data-work-branch=""
        data-depth={branch.depth}
        data-start={branch.growthStart}
        data-duration={branch.growthDuration}
        d={branch.d}
        fill="none"
        stroke="var(--rh-cream)"
        strokeWidth={branch.width}
        // Quieter than Section 2 throughout: the work is the subject here.
        strokeOpacity={branch.opacity * 0.72}
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
      className="work__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-work-layer="growth">{branches.map(renderBranch)}</g>
    </svg>
  );
}

export const WorkNetwork = memo(WorkNetworkView);
