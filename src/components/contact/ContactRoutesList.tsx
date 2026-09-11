import { CONTACT_ROUTES } from "@/lib/contact/config";
import { CONTACT_PAGE_ROUTES } from "@/lib/contact/pageContent";

/**
 * 01 — THE ROUTES
 *
 * The page's primary functional section, and the reason it exists: four
 * destinations at the largest size they are set anywhere on the site.
 *
 * READ FROM `CONTACT_ROUTES`, never retyped. Both addresses, the number and the
 * place are the client's supplied values, and this component chooses only how
 * they are presented. The footer renders the same four from the same list.
 *
 * THE DESTINATION IS THE OBJECT. A label, a hairline, then the address or the
 * number itself at display weight — no card, no box, no fill, no icon, no
 * chevron, no button. An email address styled as a button is a worse email
 * address, and it is also a worse link: this one can be copied, middle-clicked
 * and read aloud as what it is.
 *
 * A route with an `href` is a real `<a>` and the whole destination is the hit
 * area, which is what makes it comfortable to tap on a phone rather than a
 * small glyph beside it. The location has no `href` and renders as plain type:
 * no map URL or coordinates were supplied, and a dead link or a click handler
 * pretending to be one would be worse than type. `mailto:` and `tel:` never
 * leave the browsing context, so neither takes `target="_blank"` and adding
 * `rel="noopener"` to them would be cargo cult.
 *
 * The list is an `<ol>` because it is presented in a deliberate order —
 * primary email first — and DOM order is the reading order a screen reader and
 * the tab sequence follow. The wide tiers place the four asymmetrically with
 * explicit grid rows rather than by reordering, so the visual order never
 * diverges from the reading order in a way that matters.
 */
export function ContactRoutesList() {
  return (
    <section className="cp-routes" aria-labelledby="cp-routes-title">
      <h2 className="visually-hidden" id="cp-routes-title">
        {CONTACT_PAGE_ROUTES.title}
      </h2>

      <ol className="cp-routes__list">
        {CONTACT_ROUTES.map((route) => {
          const destination = (
            <>
              {route.value}
              {route.detail && <span className="cp-route__detail">{route.detail}</span>}
            </>
          );

          return (
            <li
              className="cp-route"
              key={route.id}
              data-route={route.id}
              /* The client's own weighting, carried in `lib/contact/config` and
                 already used by the footer. Driving the type scale from it
                 rather than from a list of route ids here means the two
                 renderings cannot drift apart. */
              data-size={route.size}
              data-linked={route.href ? "" : undefined}
              data-cp-block=""
            >
              <span className="cp-route__rule" aria-hidden="true" data-cp-rule="" />

              <p className="cp-route__label" data-cp-reveal="">
                {route.label}
              </p>

              <p className="cp-route__value" data-cp-reveal="">
                {route.href ? (
                  <a className="cp-route__link" href={route.href}>
                    {/* The rule under the destination is drawn by this span, not
                        by the link, so the link's box can carry the tap target
                        without dragging the underline away from the words. */}
                    <span className="cp-route__underline">{destination}</span>
                  </a>
                ) : (
                  destination
                )}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
