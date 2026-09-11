"use client";

/**
 * CONTACT / ROUTES — ANIMATION
 *
 * Same model as Sections 3 through 7: every reveal is a timeline whose progress
 * *is* the scroll. Nothing uses `once`, nothing plays on enter, there are no exit
 * animations and no state is ever latched — so the mid-scroll state is identical
 * whichever direction you arrived from, and the section can be crossed any
 * number of times without reaching a stuck state.
 *
 * WHAT IS DIFFERENT HERE: the composition is ONE coherent timeline rather than a
 * trigger per block. Every section above is a field the reader moves through, so
 * per-item windows are right there — an item resolves as it comes up. This
 * section is a single closing frame, and it should resolve as one thing:
 *
 *   0.00 – 0.20   the network continues in from Section 7
 *   0.15 – 0.45   the closing statement settles into prominence
 *   0.30 – 0.50   the invitation follows it
 *   0.45 – 0.80   the routes emerge, in reading order
 *   0.72 – 0.95   the company details settle at the foot
 *
 * The network runs on its own scrubbed timeline over a slightly wider window,
 * because growth has to be arriving before there is anything for a route to be
 * near. The anchor strand into a route is timed off its own node, so the
 * junction always exists before anything grows out of it.
 *
 * All of it reverses for free on the way back up, because every value is a pure
 * function of scroll position rather than of elapsed time.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface ContactAnimationOptions {
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

export function createContactAnimation({
  root,
  reducedMotion,
}: ContactAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const marker = one<HTMLElement>(root, "[data-contact-marker]");
    const statementLines = all<HTMLElement>(root, "[data-contact-line]");
    const invitation = one<HTMLElement>(root, "[data-contact-invitation]");
    const routes = all<HTMLElement>(root, "[data-contact-route]");
    const colophon = all<HTMLElement>(root, "[data-contact-colophon]");
    const paths = all<SVGPathElement>(root, "[data-contact-path]");
    const anchors = all<SVGPathElement>(root, "[data-contact-anchor]");
    const nodeMarks = all<SVGGElement>(root, "[data-contact-node]");
    const junctions = all<SVGGElement>(root, "[data-contact-junction]");

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set([...paths, ...anchors], { strokeDashoffset: 0 });
      gsap.set([...nodeMarks, ...junctions], { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-contact-reveal]"), {
        clipPath: CLIP_OPEN,
        opacity: 1,
        y: 0,
      });
      gsap.set(all(root, "[data-contact-rule]"), { scaleX: 1 });
      gsap.set(
        [marker, invitation, ...colophon, ...all(root, "[data-contact-meta]")].filter(
          Boolean,
        ),
        { opacity: 1, y: 0 },
      );
      root.dataset.contactState = "static";
      return;
    }

    root.dataset.contactState = "running";

    /* =================================================================== *
     * THE NETWORK — the last continuation. Genuine path growth: each strand
     * draws along its own length in the generator's own order, so growth
     * propagates outward from the Section 7 inlets rather than the whole SVG
     * fading up.
     * =================================================================== */
    if (paths.length) {
      gsap.set([...nodeMarks, ...junctions], {
        opacity: 0,
        scale: 0,
        transformOrigin: "50% 50%",
      });

      const netTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          // This is the last section on the page, so the window has to close on
          // the document's own end rather than on a following element.
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      netTl.to({}, { duration: 1 }, 0);

      paths.forEach((path) => {
        const start = Number(path.dataset.start) || 0;
        const duration = Math.max(0.02, Number(path.dataset.duration) || 0.05);
        netTl.to(path, { strokeDashoffset: 0, duration, ease: "power1.out" }, start * 0.8);
      });

      nodeMarks.forEach((node) => {
        const group = node.closest("[data-contact-group]");
        const path = group?.querySelector<SVGPathElement>("[data-contact-path]");
        const at =
          (Number(path?.dataset.start) || 0) + (Number(path?.dataset.duration) || 0);
        netTl.to(
          node,
          { opacity: 1, scale: 1, duration: 0.04, ease: "power2.out" },
          Math.min(0.96, at * 0.8),
        );
      });

      // The reach into a route, timed off the node it leaves from.
      anchors.forEach((anchor) => {
        const at = Number(anchor.dataset.at) || 0;
        netTl.to(
          anchor,
          { strokeDashoffset: 0, duration: 0.05, ease: "power1.out" },
          Math.min(0.95, at * 0.8),
        );
      });

      // The meeting points. Marked a beat before the strand leaves them, so the
      // junction reads as the thing the growth resolved into.
      junctions.forEach((junction) => {
        const at = Number(junction.dataset.at) || 0;
        netTl.to(
          junction,
          { opacity: 1, scale: 1, duration: 0.05, ease: "power2.out" },
          Math.min(0.94, Math.max(0, at * 0.8 - 0.02)),
        );
      });
    }

    /* =================================================================== *
     * THE CLOSING FRAME — one timeline, in the order the section is read.
     * Nothing flies, nothing bounces, nothing rotates, no two blocks move in
     * different directions. The words are the visual event.
     * =================================================================== */
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top 78%",
        end: "bottom bottom",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    if (marker) {
      tl.fromTo(marker, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.14 }, 0);
    }

    // The statement is the dominant object, so it opens line by line — the only
    // staggered element in the section, and the reason the frame reads as
    // settling rather than appearing.
    statementLines.forEach((line, i) => {
      tl.fromTo(
        line,
        { clipPath: CLIP_CLOSED, opacity: 0.001, y: 14 },
        { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.22 },
        0.15 + i * 0.08,
      );
    });

    if (invitation) {
      tl.fromTo(invitation, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18 }, 0.32);
    }

    routes.forEach((route, i) => {
      const rule = route.querySelector<HTMLElement>("[data-contact-rule]");
      const label = route.querySelector<HTMLElement>("[data-contact-meta]");
      const value = route.querySelector<HTMLElement>("[data-contact-reveal]");
      const at = 0.45 + i * 0.075;

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 0.14 },
          at,
        );
      }
      if (label) {
        tl.fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.14 }, at + 0.03);
      }
      if (value) {
        tl.fromTo(
          value,
          { clipPath: CLIP_CLOSED, opacity: 0.001, y: 10 },
          { clipPath: CLIP_OPEN, opacity: 1, y: 0, duration: 0.18 },
          at + 0.06,
        );
      }
    });

    colophon.forEach((block, i) => {
      tl.fromTo(
        block,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.16 },
        0.72 + i * 0.05,
      );
    });

    // The network is generated from measured geometry, so triggers must be
    // recomputed once it lands.
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
