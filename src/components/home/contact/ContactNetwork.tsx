import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import type { PersonAnchor } from "@/lib/collective/network";
import type { ContactJunction } from "@/lib/contact/network";

interface ContactNetworkProps {
  network: OrganicNetwork;
  /** Short reaches from real junctions into the routes that have one. */
  anchors: PersonAnchor[];
  /** The nodes those reaches leave from, marked as meeting points. */
  junctions: ContactJunction[];
}

/**
 * The organism reaching its last destinations, as addressable SVG.
 *
 * One field across the whole section, never clipped to a route and always
 * beneath them. The viewBox is the section's measured pixel size, so one user
 * unit is one pixel: curvature, stroke weight and node roundness all survive
 * intact and stroke-dash lengths come straight from the generator.
 *
 * Stroke opacities are the lowest on the page — a step under Section 7's, which
 * was itself a step under Section 6's. Nothing in this layer is decorative:
 * every strand descends from a Section 7 trunk, the only marked points are nodes
 * the walk produced, and there is no arrow, no terminator glyph and no ruled
 * line anywhere in it.
 */
function ContactNetworkView({ network, anchors, junctions }: ContactNetworkProps) {
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
    <g key={node.id} data-contact-node="" data-kind={node.kind}>
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3}
          fill="none"
          stroke="var(--rh-cream)"
          strokeWidth={0.6}
          strokeOpacity={node.opacity * 0.16}
        />
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={node.hollow ? "none" : "var(--rh-cream)"}
        fillOpacity={node.hollow ? 0 : node.opacity * 0.62}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity * 0.62 : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => (
    <g key={branch.id} data-contact-group={branch.id}>
      <path
        data-contact-path=""
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
         * the typography rather than around it. Those are the strands that
         * actually pass beneath live text, so they are drawn a step quieter —
         * and in this section that text is an email address, so the margin
         * matters more here than anywhere above.
         */
        strokeOpacity={branch.opacity * (branch.behind ? 0.26 : 0.46)}
        strokeLinecap="round"
        style={{ strokeDasharray: branch.length, strokeDashoffset: branch.length }}
      />
      {nodesByBranch.get(branch.id)?.map(renderNode)}
    </g>
  );

  return (
    <svg
      className="contact__network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g data-contact-layer="growth">{branches.map(renderBranch)}</g>

      {/* The last few units into a route. Each one starts at a real node of the
          layer above; none of them is a leader line drawn to a label, and none
          of them ends in an arrowhead. */}
      <g data-contact-layer="anchors">
        {anchors.map((anchor) => (
          <path
            key={`${anchor.nodeId}-${anchor.index}`}
            data-contact-anchor=""
            data-at={anchor.appearAt}
            d={anchor.d}
            fill="none"
            stroke="var(--rh-cream)"
            strokeWidth={anchor.width}
            strokeOpacity={anchor.opacity * 0.8}
            strokeLinecap="round"
            style={{ strokeDasharray: anchor.length, strokeDashoffset: anchor.length }}
          />
        ))}
      </g>

      {/* The meeting points — the nodes those reaches grew out of, marked
          because this section is about where the network leaves the page.
          No new coordinates: every one of these is already a node above. */}
      <g data-contact-layer="junctions">
        {junctions.map((junction) => (
          <g key={junction.id} data-contact-junction="" data-at={junction.appearAt}>
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r * 2.9}
              fill="none"
              stroke="var(--rh-cream)"
              strokeWidth={0.7}
              strokeOpacity={0.26}
            />
            <circle
              cx={junction.x}
              cy={junction.y}
              r={junction.r}
              fill="var(--rh-cream)"
              fillOpacity={0.74}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export const ContactNetwork = memo(ContactNetworkView);
