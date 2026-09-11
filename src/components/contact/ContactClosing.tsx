import { CONTACT_PAGE_CLOSING } from "@/lib/contact/pageContent";

/**
 * THE CLOSING
 *
 * The client's own sign-off from the last page of the brand guidelines, and
 * nothing else. Two lines: no second set of routes, no second form, no repeated
 * address, no newsletter, no social row, and no claim that is not theirs. The
 * enquiry form is the block above; this one closes the page rather than
 * restating it.
 *
 * It leans back on the phone route above it rather than introducing a new
 * destination, which is why it carries no link of its own — the number is
 * already the largest thing on the page a few lines up, and a second button
 * pointing at it would be furniture.
 *
 * Unnumbered, like the hero: the registered-entity block in the footer closes
 * the page.
 */
export function ContactClosing() {
  return (
    <section className="cp-closing" aria-labelledby="cp-closing-statement" data-cp-block="">
      <p className="cp-closing__eyebrow" data-cp-reveal="">
        {CONTACT_PAGE_CLOSING.eyebrow}
      </p>

      <h2 className="cp-closing__statement" id="cp-closing-statement">
        <span className="cp-closing__statement-inner" data-cp-reveal="">
          {CONTACT_PAGE_CLOSING.statement}
        </span>
      </h2>
    </section>
  );
}
