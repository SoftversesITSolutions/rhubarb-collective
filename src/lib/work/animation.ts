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
 * rather than by staggering one timeline — the pieces resolve as they enter and
 * the network grows through them on the page's shared growth line
 * (lib/network/growth), and all of it reverses on the way back up for free.
 *
 * Nothing is pinned and nothing floats; the only loop is the network's shared
 * resting pulse (lib/network/life).
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { growNetwork } from "@/lib/network/growth";

/**
 * The highlighted piece's opening front: everything above a wave-shaped edge
 * is shown. `p` 0 is fully closed, 1 fully open, and the wave's swell dies
 * away as it arrives so the picture settles into a clean rectangle.
 */
function waveClip(p: number): string {
  const swell = 9;
  const points = ["0% 0%", "100% 0%"];
  for (let x = 100; x >= 0; x -= 5) {
    const y =
      p * (100 + 2 * swell) -
      swell +
      swell * (1 - p * 0.5) * Math.sin((x / 100) * Math.PI * 2.5 + p * 5);
    points.push(`${x}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

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
  // Pointer listeners are not GSAP's to revert, so they hang off one signal.
  const listeners = new AbortController();

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
      gsap.set(all(root, "[data-work-tag]"), { opacity: 1, y: 0 });
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
     * One scrubbed timeline over the section's own pass. Each branch draws as
     * the page's growth line reaches it, so growth runs on from the Section 2
     * inlets in view of the reader — and unwinds the same way.
     * =================================================================== */
    if (branches.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

      // Drawn along the page's shared growth line (lib/network/growth), so the
      // tips are on screen while they grow and the seam above hands over in step.
      growNetwork({ root, strands: branches, marks: nodeMarks });
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
      const frame = item.querySelector<HTMLElement>("[data-work-frame]");
      const image = item.querySelector("[data-work-image]");
      const meta = item.querySelector("[data-work-meta]");
      const tag = item.querySelector("[data-work-tag]");
      const featured = item.dataset.featured !== undefined;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          // The highlighted piece is given more scroll to arrive in.
          end: featured ? "top 26%" : "top 42%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (featured && frame) {
        // The fluid entrance: the same top-down opening as every other piece,
        // but along a wave-edged front that flattens out as it lands.
        const front = { p: 0 };
        gsap.set(frame, { clipPath: waveClip(0) });
        tl.to(
          front,
          {
            p: 1,
            duration: 0.8,
            onUpdate: () => {
              frame.style.clipPath = waveClip(front.p);
            },
          },
          0,
        );
        if (tag) tl.fromTo(tag, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 }, 0);
      } else {
        tl.fromTo(
          frame,
          { clipPath: CLIP_CLOSED },
          { clipPath: CLIP_OPEN, duration: 0.72 },
          0,
        );
      }

      tl.fromTo(image, { scale: 1.06 }, { scale: 1, duration: 1 }, 0).fromTo(
        meta,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.32 },
        0.55,
      );
    });

    /* =================================================================== *
     * THE WAVE — a restrained ripple through a picture under the pointer
     *
     * One displacement filter is shared by every piece (see WorkSection). It
     * is attached to an image only while that image is being touched, and its
     * strength eases up and back down, so nothing is filtered at rest. A touch
     * screen has no hover to hold, so a tap sends one ripple through instead.
     * =================================================================== */
    const wave = one<SVGElement>(root, "[data-work-wave]");
    const noise = one<SVGElement>(root, "[data-work-wave-noise]");
    if (wave && noise) {
      let held: HTMLElement | null = null;
      const drift = gsap.to(noise, {
        attr: { baseFrequency: "0.01 0.007" },
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
      });
      // The picture swells slightly while the wave runs, which is also what
      // keeps the displaced edges inside the frame. `scale`, not `transform`:
      // the scroll reveal owns the transform.
      const SWELL = "1.06";
      const release = (image: HTMLElement) => {
        image.style.filter = "";
        if (held === image) held = null;
        if (!held) drift.pause();
      };
      const hold = (image: HTMLElement) => {
        if (held && held !== image) {
          held.style.filter = "";
          held.style.scale = "";
        }
        held = image;
        image.style.filter = "url(#work-wave)";
        image.style.scale = SWELL;
        drift.play();
        gsap.to(wave, { attr: { scale: 13 }, duration: 0.9, ease: "sine.out", overwrite: true });
      };
      const drop = (image: HTMLElement) => {
        if (held !== image) return;
        image.style.scale = "";
        gsap.to(wave, {
          attr: { scale: 0 },
          duration: 0.8,
          ease: "sine.inOut",
          overwrite: true,
          onComplete: () => release(image),
        });
      };
      const ripple = (image: HTMLElement) => {
        if (held && held !== image) held.style.filter = "";
        held = image;
        image.style.filter = "url(#work-wave)";
        image.style.scale = SWELL;
        drift.play();
        gsap
          .timeline({ onComplete: () => release(image) })
          .to(wave, { attr: { scale: 11 }, duration: 0.45, ease: "sine.out", overwrite: true })
          .add(() => {
            image.style.scale = "";
          })
          .to(wave, { attr: { scale: 0 }, duration: 0.95, ease: "sine.inOut" });
      };

      items.forEach((item) => {
        const image = item.querySelector<HTMLElement>("[data-work-image]");
        if (!image) return;
        const options = { signal: listeners.signal };
        item.addEventListener(
          "pointerenter",
          (event) => (event.pointerType === "mouse" ? hold(image) : undefined),
          options,
        );
        item.addEventListener(
          "pointerleave",
          (event) => (event.pointerType === "mouse" ? drop(image) : undefined),
          options,
        );
        item.addEventListener(
          "pointerdown",
          (event) => (event.pointerType !== "mouse" ? ripple(image) : undefined),
          { ...options, passive: true },
        );
        item.addEventListener("focusin", () => hold(image), options);
        item.addEventListener("focusout", () => drop(image), options);
      });
    }

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

  return () => {
    listeners.abort();
    ctx.revert();
  };
}
