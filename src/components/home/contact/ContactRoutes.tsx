"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OrganicNetwork } from "@/lib/hero/network";
import { useViewport } from "@/lib/hero/useViewport";
import {
  BLOOM,
  CONTACT_COLOPHON,
  CONTACT_COPY,
  CONTACT_ROUTES,
  CONTACT_SHAPE,
} from "@/lib/contact/config";
import { layoutRect, type Rect } from "@/lib/collective/network";
import {
  anchorContact,
  CONTACT_COPY_SELECTOR,
  generateContactNetwork,
  readJournalExits,
  type ContactAnchoring,
} from "@/lib/contact/network";
import { createContactAnimation } from "@/lib/contact/animation";
import { ContactBloom } from "./ContactBloom";
import { ContactNetwork } from "./ContactNetwork";
import { ContactRoute } from "./ContactRoute";
import "./contact.css";

interface Grown {
  network: OrganicNetwork;
  anchoring: ContactAnchoring;
}

/**
 * How much of the footer to render.
 *
 * "section" is everything, and is what "/" and "/about" get. Nothing about that
 * path changed when this prop was added — it is the default, and no call site
 * that predates it passes anything.
 *
 * "colophon" is the registered entity, its address and its GSTIN, and nothing
 * else. It exists for "/contact", where the page above has already given the
 * statement, the invitation and all four routes the whole width of the screen.
 * Printing them again immediately underneath would say everything on the page
 * twice inside one viewport. This is a suppression, not a second design: no
 * markup, no styling and no copy is added, and the colophon it renders is the
 * same element with the same rules it has always had.
 */
export type ContactVariant = "section" | "colophon";

interface ContactRoutesProps {
  variant?: ContactVariant;
}

/**
 * SECTION 08 — CONTACT / ROUTES
 *
 * The last field, and the only one that points off the page. The same organism
 * once more: the trunks that left Journal & Culture through its lower edge
 * arrive here as this field's inlets, and the growth that follows comes from the
 * generator that produced Sections 2 through 7. Nothing restarts, no fresh root
 * is seeded, and this is where it stops.
 *
 * It is a `<footer>` rather than a `<section>`, and it sits outside `<main>`, so
 * the closing frame *is* the page's contentinfo landmark — the client's company
 * details are exactly the content that belongs in one. That also means the site
 * needs no second footer component underneath it, which is why there is none.
 *
 * The field is measured, not assumed, so the network is grown after layout
 * settles and regrown on resize. Each route is handed to the generator as its
 * real rectangle, which is what lets a strand arrive at a destination without a
 * leader line ever being drawn. A route with no junction in reach is simply near
 * the network — and that restraint matters most here, because a line ruled from
 * a network to a phone number is the exact thing this system has spent seven
 * sections not doing.
 *
 * Every reveal is scrubbed against scroll position, so the way up is the exact
 * inverse of the way down.
 */
export function ContactRoutes({ variant = "section" }: ContactRoutesProps = {}) {
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { tier, reducedMotion } = useViewport();
  const [grown, setGrown] = useState<Grown | null>(null);

  const grow = useCallback(() => {
    const root = rootRef.current;
    const field = fieldRef.current;
    // In "colophon" there is no route field to measure and no section above to
    // continue from, so the growth pass is skipped outright rather than run and
    // thrown away.
    if (!root || !field || !tier || variant === "colophon") return;

    const rootRect = root.getBoundingClientRect();
    if (rootRect.width < 1 || rootRect.height < 1) return;

    // Layout boxes, never paint boxes. Each route's children carry a clip and a
    // translate mid-reveal, so anything read through `getBoundingClientRect()`
    // would make this network a function of scroll position.
    const blocks = Array.from(field.querySelectorAll<HTMLElement>("[data-contact-route]"));
    const items: (Rect & { id: string; connect: boolean })[] = blocks.map((el, i) => ({
      id: CONTACT_ROUTES[i]?.id ?? `r${i}`,
      connect: CONTACT_ROUTES[i]?.node ?? false,
      ...layoutRect(el, root),
    }));

    // The bloom is a destination too (client note 8): the network steers into
    // the space around it and one strand may reach it. What it reaches is the
    // square inscribed in the flower's disc, not the figure's box, so the
    // strand ends under the petals — the same attachment-without-a-leader
    // rule every card and route on the page follows. The figure rotates and
    // scales mid-scroll, so what is measured is its slot: layout, never paint.
    const bloom = root.querySelector<HTMLElement>("[data-contact-bloom-slot]");
    if (bloom) {
      const box = layoutRect(bloom, root);
      const inset = box.width * (0.5 - (BLOOM.fill / 2) * Math.SQRT1_2);
      items.push({
        id: "bloom",
        connect: true,
        x: box.x + inset,
        y: box.y + inset,
        width: box.width - inset * 2,
        height: box.height - inset * 2,
      });
    }

    const copy: Rect[] = [];
    root
      .querySelectorAll<HTMLElement>(CONTACT_COPY_SELECTOR)
      .forEach((el) => copy.push(layoutRect(el, root)));

    // Inherited from Journal & Culture. If that section is not on the page there
    // is nothing to continue, and inventing a root would be exactly the orphan
    // geometry this system avoids — so the field simply stays empty. The
    // contact details do not depend on it in any way.
    const inlets = readJournalExits(tier);
    if (!inlets) {
      setGrown(null);
      return;
    }

    const network = generateContactNetwork({
      tier,
      width: Math.round(rootRect.width),
      height: Math.round(rootRect.height),
      items,
      copy,
      inlets,
    });

    setGrown({
      network,
      anchoring: anchorContact(network, items, CONTACT_SHAPE[tier].anchorReach),
    });
  }, [tier, variant]);

  useEffect(() => {
    if (!tier) return;

    let frame = 0;
    let last = "";
    let cancelled = false;

    // Deferred rather than run inline: this section reads Journal & Culture out
    // of the live DOM for its inlets, so that section has to be mounted and laid
    // out first. Waiting on the brand faces as well is what makes the result
    // deterministic — growing against fallback-face metrics measures a different
    // field height and yields a different network between two loads of the same
    // page, for this section and for every one it inherits from.
    const start = () => {
      if (cancelled) return;
      frame = requestAnimationFrame(grow);
    };
    if (document.fonts?.status === "loaded") start();
    else document.fonts.ready.then(start).catch(start);

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      // Only regrow when the box actually changes shape, so ordinary scrolling
      // and sub-pixel reflow never trigger a regeneration — and one resize can
      // never leave two networks behind.
      const key = `${Math.round(box.width)}x${Math.round(box.height / 8)}`;
      if (key === last) return;
      last = key;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(grow);
    });
    const root = rootRef.current;
    if (root) observer.observe(root);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [grow, tier]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createContactAnimation({ root, reducedMotion });
  }, [reducedMotion, grown]);

  return (
    <footer
      ref={rootRef}
      id="contact"
      className="contact"
      data-contact-state="idle"
      data-contact-variant={variant}
      /* A contentinfo landmark does not need a name, and in "colophon" the
         heading that would provide one is not rendered. */
      aria-labelledby={variant === "section" ? "contact-heading" : undefined}
    >
      {/* Layer 1 — the network, beneath everything, never clipped to a route. */}
      {variant === "section" && grown && (
        <ContactNetwork
          network={grown.network}
          anchors={grown.anchoring.anchors}
          junctions={grown.anchoring.junctions}
        />
      )}

      {variant === "section" && (
        <>
        <div className="contact__opening">
          <p className="contact__marker" data-contact-marker="">
            <span className="contact__index">{CONTACT_COPY.index}</span>
            <span className="contact__rule" aria-hidden="true" />
            <span className="contact__label">{CONTACT_COPY.marker}</span>
          </p>

          {/* The client's closing statement, and the largest type on the page
              below the hero. Set as the section's heading because it is the one
              — the line breaks are presentational, so the accessible name is the
              sentence itself rather than its two halves. */}
          <h2 className="contact__statement" id="contact-heading">
            <span className="visually-hidden">{CONTACT_COPY.statement}</span>
            <span aria-hidden="true">
              {CONTACT_COPY.statementLines.map((line) => (
                <span className="contact__line" key={line} data-contact-line="">
                  {line}
                </span>
              ))}
            </span>
          </h2>

          <p className="contact__invitation" data-contact-invitation="">
            {CONTACT_COPY.invitation}
          </p>

          {/* The brand's sunflower, turning to face the reader as the frame
              settles. Last in the opening so it reads after the words, and
              placed by contact.css: the open right of the opening on wide
              tiers, its own slot under the invitation on narrow ones. */}
          <ContactBloom />
        </div>

        {/* Layer 2 — the routes out. */}
        <div className="contact__field" ref={fieldRef}>
          {CONTACT_ROUTES.map((route) => (
            <ContactRoute key={route.id} route={route} />
          ))}
        </div>
        </>
      )}

      {/* Layer 3 — the registered entity. Supporting information at the foot of
          the ecosystem: the quietest type in the section, and the GSTIN quieter
          again. No sitemap, no newsletter, no social row, no cookie banner. */}
      <div className="contact__colophon">
        <p className="contact__company" data-contact-colophon="">
          {CONTACT_COLOPHON.company}
        </p>

        <address className="contact__address" data-contact-colophon="">
          {CONTACT_COLOPHON.address.map((line) => (
            <span className="contact__address-line" key={line}>
              {line}
            </span>
          ))}
        </address>

        <p className="contact__gstin" data-contact-colophon="">
          <span className="contact__gstin-label">{CONTACT_COLOPHON.gstinLabel}</span>
          <span className="contact__gstin-value">{CONTACT_COLOPHON.gstin}</span>
        </p>

        {/* The sunflower model's attribution — a condition of its licence, so
            it is rendered wherever the bloom is and nowhere it is not. */}
        {variant === "section" && (
          <p className="contact__credit" data-contact-colophon="">
            <span>{BLOOM.credit.label}: </span>
            <a className="contact__credit-link" href={BLOOM.credit.modelHref} rel="noopener">
              “{BLOOM.credit.title}”
            </a>
            <span> by </span>
            <a className="contact__credit-link" href={BLOOM.credit.authorHref} rel="noopener">
              {BLOOM.credit.author}
            </a>
            <span>, </span>
            <a className="contact__credit-link" href={BLOOM.credit.licenceHref} rel="noopener license">
              {BLOOM.credit.licence}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
