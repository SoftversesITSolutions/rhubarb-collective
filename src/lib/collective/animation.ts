"use client";

/**
 * THE COLLECTIVE — ANIMATION
 *
 * Same model as Sections 3 and 4, and for the same reason: every reveal is a
 * timeline whose progress *is* the scroll. Nothing uses `once`, nothing plays on
 * enter, and there are no exit animations — so the mid-scroll state is identical
 * whichever direction you arrived from, and the section can be crossed any
 * number of times without reaching a stuck state.
 *
 *   progress 0    →  network undrawn, portraits clipped shut, names absent
 *   progress 0.5  →  halfway, in both directions
 *   progress 1    →  the collective settled
 *
 * Ordering is expressed through trigger windows rather than one long stagger:
 * people resolve as they enter and the network grows through them on the page's
 * shared growth line (lib/network/growth), each anchor strand into a frame
 * drawing as the line passes it. All of it reverses for free on the way back up.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { growNetwork } from "@/lib/network/growth";

export interface CollectiveAnimationOptions {
  root: HTMLElement;
  reducedMotion: boolean;
}

const CLIP_CLOSED = "inset(0% 0% 100% 0%)";
const CLIP_OPEN = "inset(0% 0% 0% 0%)";

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export function createCollectiveAnimation({
  root,
  reducedMotion,
}: CollectiveAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-collective-marker]");
    const lede = all<HTMLElement>(root, "[data-collective-lede]");
    const people = all<HTMLElement>(root, "[data-collective-person]");
    const strands = all<SVGPathElement>(root, "[data-collective-path]");
    const anchors = all<SVGPathElement>(root, "[data-collective-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-collective-node]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...strands, ...anchors], { strokeDashoffset: 0 });
      gsap.set(nodeMarks, { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-collective-frame]"), { clipPath: CLIP_OPEN });
      gsap.set(all(root, "[data-collective-portrait]"), { scale: 1 });
      gsap.set(
        [marker, ...lede, ...all(root, "[data-collective-meta]")].filter(Boolean),
        { opacity: 1, y: 0 },
      );
      root.dataset.collectiveState = "static";
      return;
    }

    root.dataset.collectiveState = "running";

    /* =================================================================== *
     * THE NETWORK — grows in as the section arrives, retreats as it leaves
     * =================================================================== */
    if (strands.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

      // Drawn along the page's shared growth line (lib/network/growth), so the
      // tips are on screen while they grow and the seam above hands over in step.
      growNetwork({ root, strands, reaches: anchors, marks: nodeMarks });
    }

    /* ---- section marker and the client's opening copy ---- */
    if (marker) {
      gsap.fromTo(
        marker,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: marker,
            start: "top 92%",
            end: "top 72%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    lede.forEach((line, i) => {
      gsap.fromTo(
        line,
        // The heading wipes open from its top edge as it rises; the lines
        // under it simply rise. Insets are negative when open so tall display
        // glyphs are never cropped at rest.
        line.tagName === "H2"
          ? { opacity: 0.001, y: 18, clipPath: "inset(-12% -4% 112% -4%)" }
          : { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          ...(line.tagName === "H2" ? { clipPath: "inset(-12% -4% -18% -4%)" } : {}),
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 94%",
            end: `top ${74 - i * 2}%`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    /* =================================================================== *
     * THE PEOPLE — one scrubbed timeline each
     *
     * The frame's clip opens while the picture inside settles out of a slight
     * over-scale, and the name follows it. Restrained on purpose: no bounce, no
     * flight paths, nothing arriving from off-axis, and every value is a
     * function of scroll position rather than of time.
     * =================================================================== */
    people.forEach((person) => {
      const frame = person.querySelector("[data-collective-frame]");
      const portrait = person.querySelector("[data-collective-portrait]");
      const meta = person.querySelector("[data-collective-meta]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: person,
          start: "top 90%",
          end: "bottom 78%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        frame,
        { clipPath: CLIP_CLOSED },
        { clipPath: CLIP_OPEN, duration: 0.62 },
        0,
      );

      if (portrait) {
        tl.fromTo(portrait, { scale: 1.03 }, { scale: 1, duration: 0.8 }, 0);
      }

      tl.fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3 }, 0.46);
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
