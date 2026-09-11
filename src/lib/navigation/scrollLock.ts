"use client";

/**
 * SCROLL LOCK
 *
 * Holds the page still while the overlay is open, and puts everything back
 * exactly as it was afterwards.
 *
 * WHY `overflow: hidden` ON THE ROOT AND NOT `position: fixed` ON THE BODY.
 * The position-fixed trick is the usual one, but it takes the document out of
 * flow, which throws the scroll position away — the reader would come back to
 * the top of the page every time they glanced at the menu. Locking the scrolling
 * element instead keeps `scrollTop` intact, so closing the menu returns to the
 * exact pixel it was opened at, with nothing to save and restore by hand.
 *
 * WHY THE SCROLLBAR GAP IS COMPENSATED, and why it matters more here than on a
 * normal site. Hiding the scrollbar widens the viewport by its width, and every
 * section on this page observes its own box and REGENERATES ITS NETWORK when the
 * measured width changes. Without the compensating padding, opening the menu
 * would silently regrow all seven inherited networks behind it — and regrow them
 * again on close. The padding keeps the content box exactly the width it already
 * was, so no ResizeObserver ever fires and the geometry underneath the overlay is
 * untouched.
 *
 * The site's own scrolling is not otherwise altered: no scroll library, no
 * wheel/touch interception, no ScrollTrigger reconfiguration.
 */

interface Saved {
  rootOverflow: string;
  bodyPaddingRight: string;
}

let saved: Saved | null = null;

export function lockScroll(): void {
  if (typeof document === "undefined" || saved) return;

  const root = document.documentElement;
  const { body } = document;

  saved = {
    rootOverflow: root.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
  };

  // Measured before the lock, while the scrollbar is still there.
  const gap = window.innerWidth - root.clientWidth;

  root.style.overflow = "hidden";
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
}

export function unlockScroll(): void {
  if (typeof document === "undefined" || !saved) return;

  // Restored to the exact previous inline values — an empty string removes the
  // property rather than pinning it to a computed default, so nothing this
  // module touched is left permanently overwritten.
  document.documentElement.style.overflow = saved.rootOverflow;
  document.body.style.paddingRight = saved.bodyPaddingRight;
  saved = null;
}
