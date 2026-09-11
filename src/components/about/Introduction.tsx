import { ABOUT_INTRODUCTION } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";
import { AboutFigure } from "./AboutFigure";

/**
 * 01 — OUR INTRODUCTION
 *
 * The client's approved "Who We Are" prose, which appears nowhere on the
 * homepage — that section introduces Rhubarb through the brand narrative, and
 * this is the longer, first-person version the same client wrote.
 *
 * No cards, no icons, no statistics: the client's own sub-line set large, their
 * three paragraphs in an offset editorial column, and their mission statement
 * as the section's closing declaration. The offset is what keeps a page of
 * prose from reading as a document — the lede sits under the heading and the
 * two paragraphs that follow step in from the left.
 *
 * The studio's own brand board sits beside the mission on wide screens, in the
 * columns the declaration leaves empty, and falls above it in the single
 * column. It is Rhubarb's own material — never a client's work, never stock.
 * Take `image` out of the content file and the section closes up around it.
 */
export function Introduction() {
  const [lede, ...rest] = ABOUT_INTRODUCTION.body;

  return (
    <section className="ab-section ab-intro" aria-labelledby="about-intro-heading">
      <div data-about-group="">
        <AboutMarker
          index={ABOUT_INTRODUCTION.index}
          label={ABOUT_INTRODUCTION.marker}
        />

        <h2 className="ab-intro__heading" id="about-intro-heading">
          <span className="ab-heading__inner" data-about-reveal="">
            {ABOUT_INTRODUCTION.heading}
          </span>
        </h2>
      </div>

      <div className="ab-intro__body" data-about-group="">
        <p className="ab-intro__lede" data-about-reveal="">
          {lede}
        </p>

        <div className="ab-intro__rest">
          {rest.map((paragraph) => (
            <p className="ab-intro__paragraph" key={paragraph} data-about-reveal="">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {ABOUT_INTRODUCTION.image && (
        <AboutFigure image={ABOUT_INTRODUCTION.image} className="ab-intro__figure" />
      )}

      {/* The deck sets this immediately after the "foothills of the Himalayas"
          line, so it closes the introduction rather than opening the section on
          vision. Display face, because it is a declaration. */}
      <div className="ab-intro__mission" data-about-group="">
        <span className="ab-intro__mission-rule" aria-hidden="true" data-about-rule="" />
        <p className="ab-intro__mission-text">
          <span className="ab-intro__mission-inner" data-about-reveal="">
            {ABOUT_INTRODUCTION.mission}
          </span>
        </p>
      </div>
    </section>
  );
}
