import type { ContactRoute as ContactRouteData } from "@/lib/contact/config";

interface ContactRouteProps {
  route: ContactRouteData;
}

/**
 * One route out of the ecosystem.
 *
 * THE DESTINATION IS THE VISUAL OBJECT. A label above a hairline, then the
 * address, the number or the place itself at display weight. There is no card,
 * no box, no fill, no icon, no chevron and no button — an email address that
 * looks like a button is a worse email address.
 *
 * A route with an `href` is a real `<a>`, so it is focusable, keyboard
 * operable and announced as a link, and the whole destination is the hit area
 * rather than a small glyph beside it. A route without one — the address, which
 * has no supplied map URL — renders as plain type rather than as a dead link or
 * a click handler pretending to be one.
 *
 * `mailto:` and `tel:` are handled by the platform and never leave the browsing
 * context, so neither takes `target="_blank"`; adding `rel="noopener"` to them
 * would be cargo cult.
 */
export function ContactRoute({ route }: ContactRouteProps) {
  const { href, value, detail } = route;

  const destination = (
    <>
      {value}
      {detail && <span className="contact-route__detail">{detail}</span>}
    </>
  );

  return (
    <div
      className="contact-route"
      data-contact-route=""
      data-slot={route.slot}
      data-size={route.size}
      data-linked={href ? "" : undefined}
    >
      <p className="contact-route__label" data-contact-meta="">
        {route.label}
      </p>

      <span className="contact-route__rule" data-contact-rule="" aria-hidden="true" />

      {href ? (
        <p className="contact-route__value" data-contact-reveal="">
          <a className="contact-route__link" href={href}>
            {destination}
          </a>
        </p>
      ) : (
        <p className="contact-route__value" data-contact-reveal="">
          {destination}
        </p>
      )}
    </div>
  );
}
