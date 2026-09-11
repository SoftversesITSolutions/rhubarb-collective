import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import type { PersonAnchor } from "@/lib/collective/network";
import type { ProofJunction } from "@/lib/proof/network";

interface ProofNetworkProps {
  network: OrganicNetwork;
  /** Short reaches from real junctions into the items that have one. */
  anchors: PersonAnchor[];
  /** The nodes those reaches leave from, marked as meeting points. */
  junctions: ProofJunction[];
}

/**
 * The network reaching its relationships, as addressable SVG.
 *
 * One field across the whole section, never clipped to an item and always
 * beneath them. The viewBox is the section's measured pixel size, so one user
 * unit is one pixel: curvature, stroke weight and node roundness all survive
 * intact and stroke-dash lengths come straight from the generator.
 *
 * Stroke opacities are the lowest of any section so far, deliberately. The
 * organism is the same; here it is support, and the client's words are the
 * subject. Nothing in this layer is decorative — every strand descends from a
 * Section 5 trunk, and the only marked points are nodes the walk produced.
 */
function ProofNetworkView({ network, anchors, junctions }: ProofNetworkProps) {
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
    <g key={node.id} data-proof-node="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.2}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.7}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.7 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-proof-group={branch.id}>
      <path
        data-proof-path=""
        data-depth={branch.depth}
        data-behind={branch.behind ? "" : undefined}
        data-start={branch.growthStart}
        data-duration={branch.growthDuration}
        d={branch.d}
        fill="none"
        stroke="var(--rh-cream)"
        strokeWidth={branch.width}
        /*
         * A `behind` strand is the one the generator deliberately routes under
         * the typography rather than around it — that is what stops arriving
         * growth matting along the edge of a paragraph. Since those are the
         * strands that actually pass beneath live text, they are drawn a step
         * quieter, so where one does cross a line it reads as depth rather than
         * as something laid over the words.
         */
        strokeOpacity={branch.opacity * (branch.behind ? 0.34 : 0.54)}
        strokeLinecap="round"
        style={{ strokeDasharray: branch.length, strokeDashoffset: branch.length }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="proof__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-proof-layer="growth">{branches.map(renderBranch)}</g>

      {/* The last few units into an item. Each one starts at a real node of the
          layer above; none of them is a leader line drawn to a label. */}
      <g data-proof-layer="anchors">
        {anchors.map((anchor) => (
          <path
            key={`${anchor.nodeId}-${anchor.index}`}
            data-proof-anchor=""
            data-at={anchor.appearAt}
            d={anchor.d}
            fill="none"
            stroke="var(--rh-cream)"
            strokeWidth={anchor.width}
            strokeOpacity={anchor.opacity * 0.9}
            strokeLinecap="round"
            style={{ strokeDasharray: anchor.length, strokeDashoffset: anchor.length }}
          />
        ))}
      </g>

      {/* The meeting points — the nodes those reaches grew out of, marked
          because this section is about where the network arrives at someone.
          No new coordinates: every one of these is already a node above. */}
      <g data-proof-layer="junctions">
        {junctions.map((junction) => (
          <g key={junction.id} data-proof-junction="" data-at={junction.appearAt}>
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r * 2.9}
              fill="none"
              stroke="var(--rh-cream)"
              strokeWidth={0.7}
              strokeOpacity={0.3}
            />
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r}
              fill="var(--rh-cream)"
              fillOpacity={0.82}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export const ProofNetwork = memo(ProofNetworkView);
