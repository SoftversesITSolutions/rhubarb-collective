import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import type { PersonAnchor } from "@/lib/collective/network";
import type { JournalJunction } from "@/lib/journal/network";

interface JournalNetworkProps {
  network: OrganicNetwork;
  /** Short reaches from real junctions into the positions that have one. */
  anchors: PersonAnchor[];
  /** The nodes those reaches leave from, marked as meeting points. */
  junctions: JournalJunction[];
}

/**
 * The network connecting ideas, as addressable SVG.
 *
 * One field across the whole section, never clipped to an item and always
 * beneath them. The viewBox is the section's measured pixel size, so one user
 * unit is one pixel: curvature, stroke weight and node roundness all survive
 * intact and stroke-dash lengths come straight from the generator.
 *
 * Stroke opacities are the lowest on the page. The organism is the same; this is
 * the quietest field it crosses, and the client's writing is the subject.
 * Nothing in this layer is decorative — every strand descends from a Section 6
 * trunk, and the only marked points are nodes the walk produced.
 */
function JournalNetworkView({ network, anchors, junctions }: JournalNetworkProps) {
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
    <g key={node.id} data-journal-node="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.18}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.66}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.66 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-journal-group={branch.id}>
      <path
        data-journal-path=""
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
        strokeOpacity={branch.opacity * (branch.behind ? 0.3 : 0.5)}
        strokeLinecap="round"
        style={{ strokeDasharray: branch.length, strokeDashoffset: branch.length }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="journal__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-journal-layer="growth">{branches.map(renderBranch)}</g>

      {/* The last few units into an editorial position. Each one starts at a
          real node of the layer above; none of them is a leader line drawn to
          a label. */}
      <g data-journal-layer="anchors">
        {anchors.map((anchor) => (
          <path
            key={`${anchor.nodeId}-${anchor.index}`}
            data-journal-anchor=""
            data-at={anchor.appearAt}
            d={anchor.d}
            fill="none"
            stroke="var(--rh-cream)"
            strokeWidth={anchor.width}
            strokeOpacity={anchor.opacity * 0.85}
            strokeLinecap="round"
            style={{ strokeDasharray: anchor.length, strokeDashoffset: anchor.length }}
          />
        ))}
      </g>

      {/* The meeting points — the nodes those reaches grew out of, marked
          because this section is about where the network meets an idea.
          No new coordinates: every one of these is already a node above. */}
      <g data-journal-layer="junctions">
        {junctions.map((junction) => (
          <g key={junction.id} data-journal-junction="" data-at={junction.appearAt}>
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r * 2.9}
              fill="none"
              stroke="var(--rh-cream)"
              strokeWidth={0.7}
              strokeOpacity={0.28}
            />
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r}
              fill="var(--rh-cream)"
              fillOpacity={0.78}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export const JournalNetwork = memo(JournalNetworkView);
