import Link from "next/link";
import { SERVICES_CLOSING } from "@/lib/services/pageContent";

/**
 * THE CLOSING
 *
 * A question, an answer and one link. No second index, no repeated service
 * list, no form, no newsletter, no social row and no claim.
 *
 * The link is the About page's closing CTA in every respect that matters — the
 * same destination, the same `next/link`, and a rule under display type that
 * comes up to full strength on hover and focus. No new button language is
 * introduced for this page, because the site already has one.
 */
export function ServicesClosing() {
  return (
    <section
      className="sv-closing"
      aria-labelledby="sv-closing-statement"
      data-sv-block=""
    >
      <p className="sv-closing__eyebrow" data-sv-reveal="">
        {SERVICES_CLOSING.eyebrow}
      </p>

      <h2 className="sv-closing__statement" id="sv-closing-statement">
        <span className="sv-closing__statement-inner" data-sv-reveal="">
          {SERVICES_CLOSING.statement}
        </span>
      </h2>

      <p className="sv-closing__cta" data-sv-reveal="">
        <Link className="sv-closing__link" href={SERVICES_CLOSING.cta.href}>
          {SERVICES_CLOSING.cta.label}
        </Link>
      </p>
    </section>
  );
}
