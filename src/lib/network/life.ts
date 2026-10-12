/**
 * THE NETWORK AT REST
 * ===================
 *
 * What keeps the mycelium alive while nobody is scrolling. Two slow motions,
 * both carried only by the primary strands so the field never gets busy:
 *
 *   flow    — a soft pulse travels down each primary, like something being
 *             carried through it
 *   breath  — the primary itself swells very slightly brighter and settles
 *
 * Both are phased from where a strand sits on the *page*, not in its section,
 * so the swell and the pulses read as one system moving down the whole
 * homepage rather than eight sections each keeping their own time.
 *
 * Neither touches the strands themselves — geometry, dash and opacity stay
 * with the scroll-driven growth (./growth). Each primary gets overlay copies
 * that are clipped to however much of it has grown, so the motion can never
 * run ahead of the growth line or show a strand that is not drawn yet.
 *
 * Runs only while its section is near the viewport, and not at all under
 * reduced motion (callers simply do not call it).
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** How fast a pulse travels, in CSS px per second. Slow enough to be missed. */
const FLOW_SPEED = 64;
/** Distance between successive pulses along the page, CSS px. */
const FLOW_PERIOD = 1250;
/** Length of a pulse's soft body and bright core, CSS px. */
const PULSE_SOFT = 130;
const PULSE_CORE = 34;
/** Seconds for one breath, and how far down the page one breath spans. */
const BREATH_SECONDS = 9;
const BREATH_SPAN = 2600;

interface Living {
  base: SVGPathElement;
  glow: SVGPathElement;
  soft: SVGPathElement;
  core: SVGPathElement;
  /** Strand length in user units, and user units per CSS px. */
  length: number;
  unit: number;
  /** Page position of the strand's start, CSS px. */
  pageY: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  /** Distance a pulse has travelled before it reaches this strand, user units. */
  before: number;
  /** Whether another primary feeds this one / carries on from it. */
  fed: boolean;
  feeds: boolean;
  grown: number;
}

function overlay(base: SVGPathElement, width: number): SVGPathElement {
  const el = base.cloneNode(false) as SVGPathElement;
  for (const name of [...el.getAttributeNames()]) {
    if (name.startsWith("data-") || name === "style" || name === "class") {
      el.removeAttribute(name);
    }
  }
  el.setAttribute("data-life", "");
  el.setAttribute("stroke-width", String(width));
  el.setAttribute("stroke-opacity", "1");
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  return el;
}

/**
 * Give a section's primary strands their resting motion. Call inside the
 * section's `gsap.context`, after its growth is set up.
 */
export function enliven(root: HTMLElement, strands: SVGPathElement[]): void {
  gsap.registerPlugin(ScrollTrigger);
  root.querySelectorAll("[data-life]").forEach((el) => el.remove());

  const living: Living[] = [];
  for (const base of strands) {
    if (base.dataset.depth !== "0") continue;
    let length = 0;
    try {
      length = base.getTotalLength();
    } catch {
      continue;
    }
    const matrix = base.getScreenCTM();
    if (!length || !matrix) continue;
    // User units per CSS px, so speeds and lengths are the same on every tier.
    const unit = 1 / (Math.hypot(matrix.a, matrix.b) || 1);

    const width = Number(base.getAttribute("stroke-width")) || 1;
    const glow = overlay(base, width + 0.4 * unit);
    const soft = overlay(base, width + 0.6 * unit);
    const core = overlay(base, width + 1.1 * unit);
    base.after(glow, soft, core);

    const start = base.getPointAtLength(0);
    const end = base.getPointAtLength(length);
    const pageY = matrix.b * start.x + matrix.d * start.y + matrix.f + window.scrollY;
    living.push({
      base, glow, soft, core, length, unit, pageY,
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      before: -1, fed: false, feeds: false, grown: -1,
    });
  }
  if (!living.length) return;

  // A trunk is generated as a run of segments. Chain them — a segment that
  // starts where another ends continues it — so a pulse is timed by the
  // distance it has really travelled and crosses each joint without a break.
  const near = (a: { x: number; y: number }, b: { x: number; y: number }, unit: number) =>
    Math.hypot(a.x - b.x, a.y - b.y) < 2.5 * unit;
  const parentOf = new Map<Living, Living>();
  for (const item of living) {
    const parent = living.find((other) => other !== item && near(other.end, item.start, item.unit));
    if (parent) {
      parentOf.set(item, parent);
      item.fed = true;
      parent.feeds = true;
    }
  }
  const beforeOf = (item: Living, guard = 0): number => {
    if (item.before >= 0) return item.before;
    const parent = parentOf.get(item);
    item.before =
      parent && guard < 64
        ? beforeOf(parent, guard + 1) + parent.length
        : item.pageY * 1.15 * item.unit;
    return item.before;
  };
  living.forEach((item) => beforeOf(item));

  const remove = () => living.forEach(({ glow, soft, core }) => {
    glow.remove();
    soft.remove();
    core.remove();
  });

  const hide = (el: SVGPathElement) => {
    if (el.style.opacity !== "0") el.style.opacity = "0";
  };

  /** Show the part of a pulse — `size` long, ending at `head` — that lies on this strand. */
  const pulse = (el: SVGPathElement, head: number, size: number, peak: number, item: Living) => {
    const { length, unit, grown } = item;
    const growing = grown < length - 0.5;
    const from = Math.max(0, head - size);
    const to = Math.min(head, grown);
    if (to - from < 0.5) return hide(el);
    // A pulse rises out of a strand's root and sinks before a strand's end or
    // its still-growing tip; across a joint between segments it just carries on.
    let fade = 1;
    if (!item.fed) fade = Math.min(fade, head / (80 * unit));
    if (growing || !item.feeds) fade = Math.min(fade, (grown - head) / (110 * unit));
    if (fade <= 0.01) return hide(el);
    el.style.strokeDasharray = `${to - from} ${length + size}`;
    el.style.strokeDashoffset = String(-from);
    el.style.opacity = (peak * Math.min(1, fade)).toFixed(3);
  };

  let skip = false;
  const frame = () => {
    // Every other tick: this is slow motion, 30 fps is more than it needs.
    skip = !skip;
    if (skip) return;
    const now = gsap.ticker.time;
    for (const item of living) {
      const { base, glow, soft, core, length, unit, pageY } = item;
      const offset = parseFloat(base.style.strokeDashoffset || "0") || 0;
      const grown = Math.max(0, length - offset);
      if (grown !== item.grown) {
        item.grown = grown;
        glow.style.strokeDasharray = `${grown} ${length + 1}`;
      }
      if (grown < 1) {
        hide(glow);
        hide(soft);
        hide(core);
        continue;
      }

      // Breath: a slow swell moving down the page, only over the grown part.
      const phase = (now / BREATH_SECONDS - pageY / BREATH_SPAN) * Math.PI * 2;
      glow.style.opacity = (0.07 + 0.07 * Math.sin(phase)).toFixed(3);

      // Flow: where the nearest pulse's head is along this strand, user units.
      const period = FLOW_PERIOD * unit;
      const travelled = now * FLOW_SPEED * unit - item.before;
      const head = ((travelled % period) + period) % period;
      const softSize = PULSE_SOFT * unit;
      const coreSize = PULSE_CORE * unit;
      pulse(soft, head, softSize, 0.22, item);
      pulse(core, head - (softSize - coreSize) * 0.5, coreSize, 0.5, item);
    }
  };

  const clock = gsap.to({}, {
    duration: 1,
    repeat: -1,
    ease: "none",
    paused: true,
    onUpdate: frame,
    onInterrupt: remove,
  });

  // Only tick while the section is on or near the screen.
  ScrollTrigger.create({
    trigger: root,
    start: "top bottom+=200",
    end: "bottom top-=200",
    onToggle: (self) => (self.isActive ? clock.play() : clock.pause()),
  });
}
