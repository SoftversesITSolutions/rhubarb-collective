import Link from "next/link";
import { ABOUT_CLOSING } from "@/lib/about/content";
import { AboutFigure } from "./AboutFigure";

/**
 * THE CODA
 *
 * A resolution, not a second contact section. The Contact / Routes footer is
 * directly beneath and already carries both emails, the phone number, the
 * company, the GSTIN and the address — so nothing here repeats any of it, there
 * is no form, no new address and no claim that is not the client's own.
 *
 * One link, and it points at `/contact`. A real anchor underneath, so it works
 * with the keyboard, with a middle click and with JavaScript off; `next/link`
 * only saves the reader a full document load on the way there.
 *
 * The last picture is the studio's own social posters — the brand as it is
 * actually published, put where the page turns outward. It sits opposite the
 * closing lines on wide screens and above them in the single column.
 *
 * Unnumbered, like the hero: the counted sequence on this page is 01 to 06, and
 * the footer's own 07 closes it.
 */
export function AboutClosing() {
  return (
    <section className="ab-section ab-closing" aria-labelledby="about-closing-heading">
      <div data-about-group="">
        <p className="ab-closing__eyebrow" data-about-reveal="">
          {ABOUT_CLOSING.eyebrow}
        </p>

        <h2 className="ab-closing__statement" id="about-closing-heading">
          <span className="ab-heading__inner" data-about-reveal="">
            {ABOUT_CLOSING.statement}
          </span>
        </h2>
      </div>

      {ABOUT_CLOSING.image && (
        <AboutFigure image={ABOUT_CLOSING.image} className="ab-closing__figure" />
      )}

      <div className="ab-closing__tail" data-about-group="">
        <ul className="ab-closing__body">
          {ABOUT_CLOSING.body.map((line) => (
            <li className="ab-closing__body-line" key={line} data-about-reveal="">
              {line}
            </li>
          ))}
        </ul>

        <p className="ab-closing__cta" data-about-reveal="">
          <Link className="ab-closing__link" href={ABOUT_CLOSING.cta.href}>
            {ABOUT_CLOSING.cta.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
