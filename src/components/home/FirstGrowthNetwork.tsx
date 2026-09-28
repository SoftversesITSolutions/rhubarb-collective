import { memo, useMemo } from "react";
import type { Branch, NetworkNode, OrganicNetwork } from "@/lib/hero/network";
import type { Connection } from "@/lib/first-growth/connections";
import type { Annotation } from "@/lib/first-growth/annotations";
import { RIDGE_REST, ridgePath, type RidgeField } from "@/lib/first-growth/ridgelines";

interface FirstGrowthNetworkProps {
  network: OrganicNetwork;
  ridges: RidgeField | null;
  connections: Connection[];
  annotations: Annotation[];
  /** Branch id that carries the composition into the Work section. */
  workBranchId: string | null;
}

/**
 * The continuation network, as addressable SVG.
 *
 * Structurally a sibling of HeroNetwork rather than a copy of it — the spine
 * comes from the same generator grammar, but this section renders things the
 * hero has no concept of: the ridgeline field (its texture, see
 * lib/first-growth/ridgelines), a connection mesh, leader lines to annotated
 * nodes, and a single strand singled out as the route onward. There is no
 * seed here, because this network was not born here.
 *
 * Layers, outermost first:
 *   g[data-fg-layer="drift"]     slow scroll-driven settle
 *     g[data-fg-layer="ridges"]  the pulsar field, masked: it fades under type
 *                                and around each trunk instead of crossing them
 *     g[data-fg-layer="behind"]  strands that fall through the copy
 *     g[data-fg-layer="front"]   everything routed around it
 *     g[data-fg-layer="mesh"]    connection chords
 *     g[data-fg-layer="leaders"] hairlines tying labels to their nodes
 */
function FirstGrowthNetworkView({
  network,
  ridges,
  connections,
  annotations,
  workBranchId,
}: FirstGrowthNetworkProps) {
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

  // Nodes an annotation hangs off get a little more presence than their
  // neighbours, so the label has something to be attached to.
  const annotatedNodeIds = useMemo(
    () =>
      new Set(
        annotations
          .map((a) => a.anchorNode?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [annotations],
  );

  const renderNode = (node: NetworkNode) => (
    <g
      key={node.id}
      data-fg-node=""
      data-kind={node.kind}
      data-depth={node.depth}
      data-at={node.appearAt}
      data-id={node.id}
      data-annotated={annotatedNodeIds.has(node.id) ? "" : undefined}
    >
      {node.ring && (
        <circle
          cx={node.x}
          cy={node.y}
          r={node.r * 3.1}
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
        fillOpacity={node.hollow ? 0 : node.opacity}
        stroke={node.hollow ? "var(--rh-cream)" : "none"}
        strokeWidth={node.hollow ? 0.9 : 0}
        strokeOpacity={node.hollow ? node.opacity : 0}
      />
    </g>
  );

  const renderBranch = (branch: Branch) => {
    const isWork = branch.id === workBranchId;
    return (
      <g key={branch.id} data-fg-branch-group={branch.id} data-depth={branch.depth}>
        <path
          data-fg-branch=""
          data-depth={branch.depth}
          data-start={branch.growthStart}
          data-duration={branch.growthDuration}
          data-work={isWork ? "" : undefined}
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
  };

  return (
    <svg
      className="fg-network"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {ridges && (
        <defs>
          {/*
            The feather. Black over white, blurred: a ridge fades out as it
            nears a block of type or a trunk, the way the pulsar's lines fade
            at their margins. userSpaceOnUse so the rectangles are the same
            field units as everything else.
          */}
          <filter id="fg-ridge-feather" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={ridges.options.blur} />
          </filter>
          <mask
            id="fg-ridge-mask"
            maskUnits="userSpaceOnUse"
            x={0}
            y={0}
            width={width}
            height={height}
          >
            <rect x={0} y={0} width={width} height={height} fill="#fff" />
            <g filter="url(#fg-ridge-feather)">
              {ridges.maskRects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill="#000" />
              ))}
              {ridges.spinePaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#000"
                  strokeWidth={ridges.options.fadeRadius * 2}
                  strokeLinecap="round"
                />
              ))}
            </g>
          </mask>
        </defs>
      )}

      <g data-fg-layer="drift">
        {ridges && (
          <g data-fg-layer="ridges" mask="url(#fg-ridge-mask)">
            {ridges.ridges.map((ridge) => (
              <path
                key={ridge.id}
                data-fg-ridge=""
                data-index={ridge.index}
                data-at={ridge.at}
                d={ridgePath(ridge, RIDGE_REST)}
                fill="none"
                stroke="var(--rh-cream)"
                strokeWidth={ridges.options.width}
                strokeOpacity={ridges.options.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {/* One node per value, on the apex of its crest. */}
            {ridges.crestNodes.map((node) => (
              <g
                key={node.id}
                data-fg-ridge-node=""
                data-at={ridges.ridges[node.ridge]?.at ?? 0}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * 3}
                  fill="none"
                  stroke="var(--rh-cream)"
                  strokeWidth={0.6}
                  strokeOpacity={0.28}
                />
                <circle cx={node.x} cy={node.y} r={node.r} fill="var(--rh-cream)" />
              </g>
            ))}
          </g>
        )}

        <g data-fg-layer="behind" className="fg-network__behind">
          {branches.filter((b) => b.behind).map(renderBranch)}
        </g>

        <g data-fg-layer="front">
          {branches.filter((b) => !b.behind).map(renderBranch)}
        </g>

        <g data-fg-layer="mesh">
          {connections.map((connection) => (
            <path
              key={connection.id}
              data-fg-connection=""
              data-at={connection.at}
              data-from={connection.from}
              data-to={connection.to}
              d={connection.d}
              fill="none"
              stroke="var(--rh-cream)"
              strokeWidth={0.85}
              strokeOpacity={0.62}
              strokeLinecap="round"
              style={{
                strokeDasharray: connection.length,
                strokeDashoffset: connection.length,
              }}
            />
          ))}
        </g>

        <g data-fg-layer="leaders">
          {annotations.map((annotation) => {
            // The leader ties a real junction to the label's resting point. No
            // junction within reach means no leader — a line drawn across empty
            // black would claim a connection the network has not made.
            const node = annotation.anchorNode;
            if (!node) return null;
            const ax = annotation.x * width;
            const ay = annotation.y * height;
            const length = Math.hypot(ax - node.x, ay - node.y);
            return (
              <line
                key={annotation.id}
                data-fg-leader=""
                data-at={annotation.at}
                x1={node.x}
                y1={node.y}
                x2={ax}
                y2={ay}
                stroke="var(--rh-cream)"
                strokeWidth={0.7}
                strokeOpacity={0.34}
                style={{ strokeDasharray: length, strokeDashoffset: length }}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

export const FirstGrowthNetwork = memo(FirstGrowthNetworkView);
