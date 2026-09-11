"use client";

/**
 * WORK — ANIMATION
 *
 * Everything here is scrubbed against scroll position. Nothing uses `once`,
 * nothing plays on enter, and there are no exit animations: each reveal is a
 * timeline whose progress *is* the scroll, so scrolling back up runs the same
 * timeline backwards and the section can be crossed in either direction any
 * number of times without ever reaching a stuck state.
 *
 *   progress 0    →  initial state (clip closed, picture over-scaled, caption out)
 *   progress 0.5  →  halfway through the reveal
 *   progress 1    →  settled
 *
 * The hierarchy is preserved by giving each element its own trigger window
 * rather than by staggering one timeline — the network's window opens before the
 * first piece's, so growth arrives ahead of the work, and that ordering reverses
 * on the way back up for free.
 *
 * Nothing loops, nothing is pinned, nothing floats.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface WorkAnimationOptions {
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

export function createWorkAnimation({
  root,
  reducedMotion,
}: WorkAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-work-marker]");
    const items = all<HTMLElement>(root, "[data-work-item]");
    const branches = all<SVGPathElement>(root, "[data-work-branch]");
    const nodeMarks = all<SVGGElement>(root, "[data-work-node-mark]");
    const outlet = one<HTMLElement>(root, "[data-work-outlet]");
    const disciplines = all<HTMLElement>(root, "[data-work-discipline]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set(branches, { strokeDashoffset: 0 });
      gsap.set(nodeMarks, { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-work-frame]"), { clipPath: CLIP_OPEN });
      gsap.set(all(root, "[data-work-image]"), { scale: 1 });
      gsap.set(
        [marker, ...all(root, "[data-work-meta]"), ...disciplines].filter(Boolean),
        { opacity: 1, y: 0 },
      );
      root.dataset.workState = "static";
      return;
    }

    root.dataset.workState = "running";

    /* =================================================================== *
     * THE NETWORK — grows in as the section arrives, retreats as it leaves
     *
     * One scrubbed timeline over the section's own pass. Each branch keeps the
     * generator's ordering, so growth propagates outward from the Section 2
     * inlets rather than appearing at once — and unwinds in the same order.
     * =================================================================== */
    if (branches.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

      const netTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          // Completes before the foot, so the field is established while the
          // work is being read rather than still drawing underneath it.
          end: "bottom 90%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      netTl.to({}, { duration: 1 }, 0);

      branches.forEach((branch) => {
        const start = Number(branch.dataset.start) || 0;
        const duration = Math.max(0.02, Number(branch.dataset.duration) || 0.05);
        netTl.to(
          branch,
          { strokeDashoffset: 0, duration, ease: "power1.out" },
          start * 0.86,
        );
      });

      nodeMarks.forEach((node) => {
        const group = node.closest("[data-work-branch-group]");
        const path = group?.querySelector<SVGPathElement>("[data-work-branch]");
        const at =
          (Number(path?.dataset.start) || 0) + (Number(path?.dataset.duration) || 0);
        netTl.to(
          node,
          { opacity: 1, scale: 1, duration: 0.04, ease: "power2.out" },
          Math.min(0.96, at * 0.86),
        );
      });
    }

    /* ---- section marker ---- */
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

    /* =================================================================== *
     * THE WORK — one scrubbed timeline per piece
     *
     * The frame's clip opens while the picture settles out of a slight
     * over-scale, and the caption follows inside the same timeline. Because the
     * whole thing is scrubbed, the upward journey is the exact inverse: caption
     * retreats, picture drifts back out, clip closes.
     * =================================================================== */
    items.forEach((item) => {
      const frame = item.querySelector("[data-work-frame]");
      const image = item.querySelector("[data-work-image]");
      const meta = item.querySelector("[data-work-meta]");

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          end: "top 42%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        frame,
        { clipPath: CLIP_CLOSED },
        { clipPath: CLIP_OPEN, duration: 0.72 },
        0,
      )
        .fromTo(image, { scale: 1.06 }, { scale: 1, duration: 1 }, 0)
        .fromTo(meta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.32 }, 0.55);
    });

    /* ---- the close ---- */
    if (outlet && disciplines.length) {
      gsap.fromTo(
        disciplines,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: {
            trigger: outlet,
            start: "top 94%",
            end: "top 68%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    // The network is generated from measured geometry, so triggers below it must
    // be recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
