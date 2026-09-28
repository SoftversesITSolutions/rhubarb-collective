"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useViewport } from "@/lib/hero/useViewport";
import { RIDGE_REST, ridgePath, swell } from "@/lib/first-growth/ridgelines";
import { SEAMS, bridgeField, entriesOf, layoutPosition, seamMetrics } from "@/lib/seam/bridge";
import "./seamBridge.css";

interface SeamBridgeProps {
  id: (typeof SEAMS)[number]["id"];
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * One seam. See lib/seam/bridge for the idea. The band's contents are built
 * imperatively once the lower section has grown its network — React owns the
 * frame, the browser's layout owns the geometry — and rebuilt on resize.
 */
export function SeamBridge({ id }: SeamBridgeProps) {
  const seam = SEAMS.find((s) => s.id === id);
  const rootRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !seam || !tier) return;
    gsap.registerPlugin(ScrollTrigger);

    const band = root.querySelector<HTMLElement>("[data-seam-band]");
    const svg = root.querySelector<SVGSVGElement>("[data-seam-ridges]");
    const art = root.querySelector<HTMLElement>("[data-seam-artwork]");
    if (!band || !svg) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let timer = 0;
    let tries = 0;
    const first = seam.id === SEAMS[0].id;

    const build = () => {
      if (cancelled) return;
      const lower = document.querySelector<HTMLElement>(seam.lower);
      const marker = lower?.querySelector<HTMLElement>(seam.marker) ?? null;
      const network = lower?.querySelector<SVGSVGElement>("svg[viewBox]") ?? null;
      const entries = network ? entriesOf(network) : [];
      if (!lower || !marker || entries.length === 0) {
        // The neighbour grows its network after mount; wait for it, briefly.
        if (tries++ < 40) timer = window.setTimeout(build, 120);
        return;
      }

      ctx?.revert();

      /* ---- geometry, all in CSS px, transform-free ---- */
      const rootPos = layoutPosition(root);
      const markerPos = layoutPosition(marker);
      const markerDy = markerPos.y - rootPos.y;
      const metrics = seamMetrics(tier, first, markerDy);
      const width = root.clientWidth;
      const height = metrics.above + metrics.below;
      band.style.top = `${-metrics.above}px`;
      band.style.height = `${height}px`;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const toBand = (y: number) => y - rootPos.y + metrics.above;
      const markerX = markerPos.x - rootPos.x;
      const crest = { x: Math.max(12, markerX - 14), y: toBand(markerPos.y) + marker.offsetHeight / 2 };

      const zones: Array<{ x: number; y: number; width: number; height: number }> = [
        // The marker's words, from where they start — the crest apex stays clear.
        { x: markerX, y: toBand(markerPos.y) - 4, width: marker.offsetWidth, height: marker.offsetHeight + 8 },
      ];
      const heading = lower.querySelector<HTMLElement>("h2");
      if (heading && heading !== marker) {
        const hp = layoutPosition(heading);
        zones.push({ x: hp.x - rootPos.x, y: toBand(hp.y), width: heading.offsetWidth, height: heading.offsetHeight });
      }
      if (art) {
        // Sized by CSS from the band, so measure after the band has its height.
        const ap = layoutPosition(art);
        zones.push({ x: ap.x - rootPos.x, y: ap.y - rootPos.y + metrics.above, width: art.offsetWidth, height: art.offsetHeight });
      }

      // The lattice is phase-locked to the marker: one line sits 0.6 gap
      // beneath the marker's centre and carries its crest, the rest step up
      // from there to the top of the band and one more below if there is room.
      const crestLine = crest.y + metrics.gap * 0.6;
      const minTop = first ? 1 : metrics.gap * 0.45;
      const top = crestLine - Math.floor((crestLine - minTop) / metrics.gap) * metrics.gap;
      const maxBottom = height - metrics.gap * 0.2;
      const bottom = crestLine + metrics.gap <= maxBottom ? crestLine + metrics.gap : crestLine;

      const stroke = tier === "mobile" ? 0.85 : 1;
      const field = bridgeField({
        width,
        height,
        crossings: entries.map((x) => x * width),
        crest,
        zones,
        top,
        bottom,
        gap: metrics.gap,
        stroke,
      });

      /* ---- draw ---- */
      svg.replaceChildren();
      const defs = document.createElementNS(SVG_NS, "defs");
      const filterId = `seam-feather-${seam.id}`;
      const maskId = `seam-mask-${seam.id}`;
      const filter = document.createElementNS(SVG_NS, "filter");
      filter.setAttribute("id", filterId);
      filter.setAttribute("x", "-10%");
      filter.setAttribute("y", "-10%");
      filter.setAttribute("width", "120%");
      filter.setAttribute("height", "120%");
      const blur = document.createElementNS(SVG_NS, "feGaussianBlur");
      blur.setAttribute("stdDeviation", String(field.options.blur));
      filter.appendChild(blur);
      defs.appendChild(filter);
      const mask = document.createElementNS(SVG_NS, "mask");
      mask.setAttribute("id", maskId);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", "0");
      mask.setAttribute("y", "0");
      mask.setAttribute("width", String(width));
      mask.setAttribute("height", String(height));
      const white = document.createElementNS(SVG_NS, "rect");
      white.setAttribute("width", String(width));
      white.setAttribute("height", String(height));
      white.setAttribute("fill", "#fff");
      mask.appendChild(white);
      const dark = document.createElementNS(SVG_NS, "g");
      dark.setAttribute("filter", `url(#${filterId})`);
      for (const r of field.maskRects) {
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", String(r.x));
        rect.setAttribute("y", String(r.y));
        rect.setAttribute("width", String(r.width));
        rect.setAttribute("height", String(r.height));
        rect.setAttribute("fill", "#000");
        dark.appendChild(rect);
      }
      for (const d of field.spinePaths) {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#000");
        path.setAttribute("stroke-width", String(field.options.fadeRadius * 2));
        path.setAttribute("stroke-linecap", "round");
        dark.appendChild(path);
      }
      mask.appendChild(dark);
      defs.appendChild(mask);
      svg.appendChild(defs);

      const layer = document.createElementNS(SVG_NS, "g");
      layer.setAttribute("mask", `url(#${maskId})`);
      const paths: SVGPathElement[] = field.ridges.map((ridge) => {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("data-seam-ridge", "");
        path.setAttribute("d", ridgePath(ridge, RIDGE_REST));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "var(--rh-cream)");
        path.setAttribute("stroke-width", String(field.options.width));
        path.setAttribute("stroke-opacity", String(field.options.opacity));
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        layer.appendChild(path);
        return path;
      });
      const crestNodes: SVGGElement[] = field.crestNodes.map((node) => {
        const g = document.createElementNS(SVG_NS, "g");
        const ring = document.createElementNS(SVG_NS, "circle");
        ring.setAttribute("cx", String(node.x));
        ring.setAttribute("cy", String(node.y));
        ring.setAttribute("r", String(node.r * 3));
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", "var(--rh-cream)");
        ring.setAttribute("stroke-width", "0.6");
        ring.setAttribute("stroke-opacity", "0.28");
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", String(node.x));
        dot.setAttribute("cy", String(node.y));
        dot.setAttribute("r", String(node.r));
        dot.setAttribute("fill", "var(--rh-cream)");
        g.appendChild(ring);
        g.appendChild(dot);
        layer.appendChild(g);
        return g;
      });
      svg.appendChild(layer);

      /* ---- motion ---- */
      ctx = gsap.context(() => {
        if (reducedMotion) {
          gsap.set([...paths, ...crestNodes], { opacity: 1 });
          if (art) gsap.set(art, { opacity: 1, y: 0 });
          return;
        }
        gsap.set(paths, { opacity: 0 });
        gsap.set(crestNodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
        if (art) gsap.set(art, { opacity: 0, y: 14 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: band,
            start: "top 92%",
            end: "bottom 8%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to({}, { duration: 1 }, 0);
        // Lines resolve top to bottom as the band comes into view…
        paths.forEach((path, i) => {
          const at = 0.04 + (0.36 * i) / Math.max(1, paths.length - 1);
          tl.to(path, { opacity: 1, duration: 0.08, ease: "power1.out" }, at);
        });
        // …the marker's node lands with its crest…
        tl.to(crestNodes, { scale: 1, opacity: 1, duration: 0.08, ease: "power2.out" }, 0.3);
        // …the artwork settles in…
        if (art) tl.to(art, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" }, 0.14);
        // …and the swell travels through the band across its whole pass.
        const ripple = { t: 0 };
        const count = field.ridges.length;
        tl.to(
          ripple,
          {
            t: 1,
            duration: 1,
            onUpdate: () => {
              paths.forEach((path, i) => {
                path.setAttribute("d", ridgePath(field.ridges[i], swell(i, count, ripple.t)));
              });
            },
          },
          0,
        );
      }, root);
    };

    build();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        tries = 0;
        build();
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
      svg.replaceChildren();
    };
  }, [seam, tier, reducedMotion]);

  if (!seam) return null;

  return (
    <div ref={rootRef} className="seam" data-seam={seam.id} aria-hidden="true">
      <div className="seam__band" data-seam-band="">
        <svg className="seam__ridges" data-seam-ridges="" focusable="false" />
        {seam.artwork ? (
          <figure className="seam__artwork" data-seam-artwork="">
            <Image
              src={seam.artwork.src}
              alt={seam.artwork.alt}
              width={seam.artwork.width}
              height={seam.artwork.height}
              // The frame is sized from the band (68% of its height, 4:3), which
              // works out near these widths on each tier.
              sizes="(max-width: 699px) 55vw, (max-width: 1099px) 42vw, 24vw"
            />
          </figure>
        ) : (
          <figure className="seam__artwork seam__artwork--reserved" data-seam-artwork="" />
        )}
      </div>
    </div>
  );
}
