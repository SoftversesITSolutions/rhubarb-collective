"use client";

import { useEffect } from "react";

/** A piece of content the network answers to. */
const ITEMS = [
  "[data-work-item]",
  "[data-branch-card]",
  "[data-collective-person]",
  "[data-proof-item]",
  "[data-journal-item]",
  "[data-contact-route]",
  "[data-fg='value']",
].join(",");

/** The network's nodes, as each section's renderer names them. */
const NODES = [
  "[data-work-node-mark]",
  "[data-branch-node]",
  "[data-collective-node]",
  "[data-proof-node]",
  "[data-journal-node]",
  "[data-contact-node]",
  "[data-fg-node]",
].join(",");

/** How far past a block's edge a node still counts as belonging to it, px. */
const REACH = 96;

/**
 * BRANCH ↔ CONTENT (client round 2, priority 4)
 *
 * When a piece of content is pointed at, focused or tapped, the nodes of the
 * network that sit on or beside it wake up — they swell and their strands
 * brighten (the look is in globals.css, under `[data-lit]`). It makes the
 * network read as attached to what it surrounds rather than drawn behind it.
 *
 * One delegated listener pair for the whole page, so no section's animation
 * has to know about it. It only ever sets and clears an attribute: there is
 * no motion here for reduced-motion to object to beyond a CSS transition,
 * which globals.css switches off.
 */
export function NetworkTouch() {
  useEffect(() => {
    let lit: Element[] = [];
    let current: Element | null = null;

    const clear = () => {
      lit.forEach((node) => node.removeAttribute("data-lit"));
      lit = [];
      current = null;
    };

    const wake = (target: EventTarget | null) => {
      const item = target instanceof Element ? target.closest(ITEMS) : null;
      if (item === current) return;
      clear();
      if (!item) return;
      current = item;
      const section = item.closest("section, footer");
      if (!section) return;
      const box = item.getBoundingClientRect();
      section.querySelectorAll<SVGGElement>(NODES).forEach((node) => {
        const r = node.getBoundingClientRect();
        if (!r.width && !r.height) return;
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (
          x > box.left - REACH &&
          x < box.right + REACH &&
          y > box.top - REACH &&
          y < box.bottom + REACH
        ) {
          node.setAttribute("data-lit", "");
          lit.push(node);
        }
      });
    };

    const over = (event: Event) => wake(event.target);
    const out = (event: PointerEvent | FocusEvent) => {
      const next = event.relatedTarget;
      if (!(next instanceof Element) || next.closest(ITEMS) !== current) clear();
    };

    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("focusin", over);
    document.addEventListener("focusout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusin", over);
      document.removeEventListener("focusout", out);
      clear();
    };
  }, []);

  return null;
}
