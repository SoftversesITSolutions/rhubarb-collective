import { CONTACT_COPY } from "@/lib/contact/config";
import { CONTACT_PAGE_HERO } from "@/lib/contact/pageContent";

/**
 * THE CONTACT HERO
 *
 * The simplest opening on the site, and the shortest — three elements and a
 * hairline. The homepage hero germinates a network across a full viewport and
 * the About hero is a masthead; this one is a door, and a reader should be able
 * to see an email address without scrolling far past it.
 *
 * No network, no generated geometry, no image. The form is further down the
 * page, below the routes, and nothing here defers to it. The statement and the
 * invitation are the client's approved footer copy, read from `CONTACT_COPY` so
 * there is exactly one copy of those words on the site.
 *
 * The statement is the page's single H1. It is set unbroken and turned by a
 * `ch` measure rather than by hand-placed line breaks, which is what makes it
 * fall as "We make brands / harder to ignore." at desktop without ragging at
 * 390.
 */
export function ContactHero() {
  return (
    <header className="cp-hero" data-cp-block="">
      <p className="cp-hero__eyebrow" data-cp-reveal="">
        {CONTACT_PAGE_HERO.eyebrow}
      </p>

      <h1 className="cp-hero__statement">
        <span className="cp-hero__statement-inner" data-cp-reveal="">
          {CONTACT_COPY.statement}
        </span>
      </h1>

      <span className="cp-hero__rule" aria-hidden="true" data-cp-rule="" />

      <p className="cp-hero__invitation" data-cp-reveal="">
        {CONTACT_COPY.invitation}
      </p>
    </header>
  );
}
