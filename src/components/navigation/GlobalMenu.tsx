"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useViewport } from "@/lib/hero/useViewport";
import { CLOSE_SCALE, createMenuTimeline, jumpMenuTo } from "@/lib/navigation/animation";
import { lockScroll, unlockScroll } from "@/lib/navigation/scrollLock";
import { MenuTrigger } from "./MenuTrigger";
import { MenuOverlay } from "./MenuOverlay";
import "./menu.css";

const OVERLAY_ID = "global-menu";

/**
 * THE GLOBAL MENU
 *
 * The site's only chrome, and one component: every route that has it renders
 * this, and none of them define navigation of their own. It is mounted at the
 * page shell — not in `layout.tsx`, so a route without the sections it names
 * (the 404) does not get a menu pointing at destinations it lacks — beside
 * `<main>` and the contact footer rather than inside any section, which keeps it out
 * of every section's stacking context and transforms — a fixed element nested in
 * a section that animates would be positioned against that section instead of
 * the viewport, and clipped by its `overflow: hidden`.
 *
 * ONE TIMELINE for the life of the component (see `lib/navigation/animation`),
 * played forward to open and reversed to close, so OPEN → CLOSE → OPEN → CLOSE
 * cannot stack tweens or strand a half-open state.
 *
 * Closing without choosing anything returns the reader to the exact pixel they
 * left: the lock holds the real scroll position rather than reparenting the
 * document, so there is no position to save and restore, and nothing to get
 * wrong. See `lib/navigation/scrollLock`.
 *
 * Nothing here touches the homepage's own motion. No section timeline is
 * rebuilt, no ScrollTrigger is reconfigured, and the lock is written so that not
 * one of the seven generated networks is even remeasured while the menu is open.
 */
export function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const { reducedMotion } = useViewport();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const labelsRef = useRef<HTMLElement[]>([]);
  const tailRef = useRef<HTMLElement[]>([]);
  const barsRef = useRef<HTMLSpanElement[]>([]);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  /** Suppresses the focus move and the scroll unlock on the very first render. */
  const interacted = useRef(false);
  /** A destination chosen in the menu, scrolled to once the lock is released. */
  const pendingTarget = useRef<string | null>(null);

  /* ---- the single timeline, built once ---- */
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const ctx = gsap.context(() => {
      tlRef.current = createMenuTimeline({
        overlay,
        panel,
        links: labelsRef.current.filter(Boolean),
        tail: tailRef.current.filter(Boolean),
        bars: barsRef.current.filter(Boolean),
      });
    }, rootRef);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  /* ---- state → animation, scroll lock, focus ---- */
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (open) {
      lockScroll();

      if (reducedMotion) {
        jumpMenuTo(tl, true);
      } else {
        // Visibility is flipped here rather than left to the timeline's first
        // tick, which GSAP does not run until the next frame. Nothing inside a
        // `visibility: hidden` element can take focus, so without this the
        // focus move below silently does nothing and a keyboard reader is left
        // outside the menu they just opened. Opacity is still the timeline's —
        // the overlay is focusable but not yet drawn, which is exactly right.
        gsap.set(overlayRef.current, { visibility: "visible" });
        tl.timeScale(1).play();
      }

      // Into the navigation itself rather than onto the close control, so a
      // keyboard reader lands on the thing they opened the menu for.
      const first = navRef.current?.querySelector<HTMLAnchorElement>("a[href]");
      first?.focus({ preventScroll: true });
    } else {
      if (reducedMotion) jumpMenuTo(tl, false);
      else tl.timeScale(CLOSE_SCALE).reverse();

      if (interacted.current) {
        unlockScroll();

        const target = pendingTarget.current;
        pendingTarget.current = null;

        if (target) {
          // Only ever after the lock is released — a smooth scroll issued while
          // the root still has `overflow: hidden` is silently dropped.
          const destination = document.querySelector<HTMLElement>(target);
          destination?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
          });
        } else {
          // Closed without choosing: focus goes back where it came from, and the
          // page is exactly where it was left.
          triggerRef.current?.focus();
        }
      }
    }

    interacted.current = true;
  }, [open, reducedMotion]);

  /* ---- Escape, and a focus loop over the menu's own controls ---- */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      // The trigger is part of the loop because while the menu is open it *is*
      // the close control. Read from the DOM each time rather than cached, so
      // the order is always the real one.
      const focusable = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !rootRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* ---- never leave the page locked ---- */
  useEffect(() => unlockScroll, []);

  /** A section of this document: close first, then scroll to it. */
  const scrollTo = useCallback((hash: string) => {
    pendingTarget.current = hash;
    setOpen(false);
  }, []);

  /**
   * Another route. Nothing is pending — the router is already navigating — so
   * this only closes the overlay and releases the lock. The unmount cleanup
   * below releases it a second time if the new page arrives first, which is
   * why the lock has to be idempotent.
   */
  const leave = useCallback(() => {
    pendingTarget.current = null;
    setOpen(false);
  }, []);

  return (
    <div className="menu" ref={rootRef}>
      <MenuTrigger
        ref={triggerRef}
        open={open}
        controls={OVERLAY_ID}
        barsRef={barsRef}
        onToggle={() => setOpen((value) => !value)}
      />

      <MenuOverlay
        ref={overlayRef}
        id={OVERLAY_ID}
        panelRef={panelRef}
        navRef={navRef}
        labelsRef={labelsRef}
        tailRef={tailRef}
        onScrollTo={scrollTo}
        onLeave={leave}
      />
    </div>
  );
}
