"use client";

/**
 * BRANCHES — ANIMATION
 *
 * Client round 3 (Oct 2026): the section pins and its track slides right to
 * left while the reader scrolls, then lets go and the page carries on down.
 * As everywhere else on the page, every reveal is a timeline whose progress
 * *is* the scroll — nothing uses `once`, nothing plays on enter, there are no
 * exit animations — so the state mid-way is identical whichever direction
 * you arrived from.
 *
 * ONE CLOCK for the whole section: scroll distance, from the section's top
 * reaching the page's growth line to its foot reaching it. In that distance:
 *
 *   approach  the stage rises to the top of the screen; the network grows
 *             down it on the growth line like every other section's, so
 *             Selected Work's strands carry straight on into it
 *   slide     the stage is pinned and the track slides by exactly the
 *             distance scrolled; the growing tip rides a fixed COLUMN on the
 *             screen, so the branch grows toward the reader's eye as the
 *             cards come in, and each card opens out of the point where its
 *             stem reaches it
 *   release   the pin lets go; the descents carry on down the growth line
 *             into The Collective, which picks them up at its top
 *
 * The slide, the growth and the cards share the one scrubbed timeline, so
 * they can never drift apart — the column holds still on the screen.
 *
 * Under reduced motion the network and cards are simply there, and the stage
 * still pins and slides — directly with the scroll, no smoothing — because
 * that is how the cards are reached, and the descents only meet The
 * Collective in the last screen.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Tier } from "@/lib/hero/config";
import { layoutRect } from "@/lib/network/continuity";
import { FINISH, GROWTH_LINE, centreOf, drawStrands, timeNear } from "@/lib/network/growth";
import { enliven } from "@/lib/network/life";
import { BRANCH_SHAPE } from "./config";

export interface BranchesAnimationOptions {
  root: HTMLElement;
  tier: Tier;
  reducedMotion: boolean;
  /** Field x where the first entry joins the branch: where sideways growth begins. */
  gatherX: number;
}

/** How much scroll a card takes to open, as a share of the stage's width. */
const CARD_OPEN = 0.16;

function all<T extends Element>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function one<T extends Element>(root: HTMLElement, selector: string): T | null {
  return root.querySelector<T>(selector);
}

export function createBranchesAnimation({
  root,
  tier,
  reducedMotion,
  gatherX,
}: BranchesAnimationOptions): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    const intro = one<HTMLElement>(root, "[data-branches-intro]");
    const stage = one<HTMLElement>(root, "[data-branches-stage]");
    const track = one<HTMLElement>(root, "[data-branches-track]");
    const marker = one<HTMLElement>(root, "[data-branches-marker]");
    const cards = all<HTMLElement>(root, "[data-branch-card]");
    const strands = all<SVGPathElement>(root, "[data-branch-path]");
    const nodeMarks = all<SVGGElement>(root, "[data-branch-node]");
    if (!intro || !stage || !track) return;

    const view = stage.clientWidth;
    const travel = Math.max(0, track.offsetWidth - view);
    const stageTop = intro.offsetHeight;
    // The section's height once pinned: the intro, the stage, and the slide.
    const total = stageTop + stage.offsetHeight + travel;

    // The pin comes first, so every trigger measured after it — this
    // section's own, and those of the sections below it, which can be
    // created before this one when their networks land first — sees the
    // page at its pinned length (see the sort below).
    const pin = {
      trigger: stage,
      start: "top top",
      end: `+=${travel}`,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    } satisfies ScrollTrigger.Vars;

    /* ---- settled state — and the whole experience under reduced motion ---- */
    if (reducedMotion) {
      gsap.set(strands, { strokeDashoffset: 0 });
      gsap.set(nodeMarks, { opacity: 1, scale: 1 });
      gsap.set(all(root, "[data-branch-frame]"), { clipPath: "none" });
      gsap.set(
        [marker, ...all(root, "[data-branch-body]"), ...all(root, "[data-branch-print]")].filter(
          Boolean,
        ),
        { opacity: 1, y: 0 },
      );
      gsap.fromTo(
        track,
        { x: 0 },
        { x: -travel, ease: "none", scrollTrigger: { ...pin, scrub: true } },
      );
      root.dataset.branchesState = "static";
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return;
    }

    root.dataset.branchesState = "running";
    ScrollTrigger.create(pin);

    /* =================================================================== *
     * THE CLOCK
     * =================================================================== */
    const line = GROWTH_LINE * window.innerHeight;
    // Field y on the growth line at the moment the pin takes hold.
    const reach = stageTop + line;
    const column = BRANCH_SHAPE[tier].column * view;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: `top ${GROWTH_LINE * 100}%`,
        // A length, not "bottom": sorted into page order this trigger is
        // refreshed BEFORE the pin it contains, so the section's bottom would
        // be read without the slide's length in it.
        end: `+=${total}`,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    tl.to({}, { duration: 1 }, 0);
    tl.fromTo(track, { x: 0 }, { x: -travel, duration: travel / total }, reach / total);

    /* =================================================================== *
     * THE NETWORK — grown by where each point is
     *
     * Down the field, a point is reached when the growth line passes it:
     * at its depth before the pin, and the slide's length later below the
     * pin's line. Along it, a point is reached when the column passes it.
     * The later of the two wins, so the branch grows down to its line, then
     * sideways with the slide, and the descents finish on the way out.
     * Selected Work's entries fall by depth alone — they continue strands
     * that reached the seam on the growth line, and must not wait for the
     * column.
     * =================================================================== */
    if (strands.length) {
      gsap.set(nodeMarks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

      const timeOf = (y: number, x: number, path: SVGPathElement) => {
        const down = y <= reach ? y : y + travel;
        const across =
          path.dataset.role !== "entry" && x > gatherX ? reach + (x - column) : -Infinity;
        return Math.max(down, across) / total;
      };
      const schedules = drawStrands(tl, strands, timeOf, 1 / total);

      // A node appears as its strand's tip arrives at it, never before.
      nodeMarks.forEach((mark) => {
        const centre = centreOf(mark);
        const path = mark.parentElement?.querySelector<SVGPathElement>("path");
        const schedule = path ? schedules.get(path) : undefined;
        const at = schedule && centre ? timeNear(schedule, centre.x, centre.y) : 0;
        const start = Math.min(FINISH, Math.max(0, at));
        tl.to(
          mark,
          {
            opacity: 1,
            scale: 1,
            duration: Math.max(0.005, Math.min(0.03, 1 - start)),
            ease: "power2.out",
          },
          start,
        );
      });

      /* ================================================================= *
       * THE CARDS — each opens out of its stem
       *
       * The frame's clip grows as a circle from the point the stem reaches
       * it, while the card settles out of a slight under-scale toward that
       * same point; the type follows, then the print develops on the cream.
       * ================================================================= */
      cards.forEach((card, i) => {
        const frame = card.querySelector<HTMLElement>("[data-branch-frame]");
        const body = card.querySelector("[data-branch-body]");
        const print = card.querySelector("[data-branch-print]");
        const stem = one<SVGPathElement>(root, `[data-role="stem"][data-card="${i}"]`);
        const schedule = stem ? schedules.get(stem) : undefined;
        if (!frame || !schedule) return;

        const box = layoutRect(frame, track);
        const end = schedule.points[schedule.points.length - 1];
        const ox = Math.round(end.x - box.x);
        const oy = Math.round(end.y - stageTop - box.y);
        const reachOut = Math.ceil(
          Math.max(
            Math.hypot(ox, oy),
            Math.hypot(box.width - ox, oy),
            Math.hypot(ox, box.height - oy),
            Math.hypot(box.width - ox, box.height - oy),
          ),
        );
        // The stem reaches the card's edge a little before its own end.
        const arrive = schedule.times[schedule.times.length - 1] - 0.004;
        const open = Math.min((CARD_OPEN * view) / total, Math.max(0.01, FINISH - arrive));

        tl.fromTo(
          frame,
          { clipPath: `circle(0px at ${ox}px ${oy}px)`, scale: 0.94, transformOrigin: `${ox}px ${oy}px` },
          { clipPath: `circle(${reachOut}px at ${ox}px ${oy}px)`, scale: 1, duration: open },
          arrive,
        );
        if (body) {
          tl.fromTo(body, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: open * 0.5 }, arrive + open * 0.45);
        }
        if (print) {
          tl.fromTo(print, { opacity: 0 }, { opacity: 1, duration: open * 0.6 }, arrive + open * 0.3);
        }
      });

      // And once grown, the primaries keep moving at rest. Refreshed after
      // the pin, for the same reason as the clock's length.
      enliven(root, strands, { refreshPriority: -1 });
    } else {
      // No network to grow from (Selected Work is not on the page): the
      // cards simply open as the track brings them in. Their type is inside
      // the clipped frame, so it needs no reveal of its own.
      cards.forEach((card) => {
        const frame = card.querySelector<HTMLElement>("[data-branch-frame]");
        if (!frame) return;
        const at = (reach + Math.max(0, card.offsetLeft - column)) / total;
        tl.fromTo(
          frame,
          { clipPath: "circle(0% at 36% 0%)" },
          { clipPath: "circle(150% at 36% 0%)", duration: (CARD_OPEN * view) / total },
          Math.min(FINISH - 0.02, at),
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

    // In page order, so triggers below the pin are measured with its length;
    // then recomputed, since the network landed after the first layout.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, root);

  return () => ctx.revert();
}
