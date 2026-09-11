import { ABOUT_APPROACH } from "@/lib/about/content";
import { AboutMarker } from "./AboutMarker";
import { AboutFigure } from "./AboutFigure";

/**
 * 04 — HOW WE WORK / OUR APPROACH
 *
 * The client's approved "Our Approach" block: the philosophy, immediately
 * before the methodology that carries it out. Their sub-line is two lines in
 * their document and stays two lines here.
 *
 * Set as a two-column editorial spread on wide screens — the standfirst and the
 * studio's own business cards hold the left, the prose runs down the right —
 * which is the one composition on this page that is genuinely a column
 * relationship rather than an offset. Below 1100px it collapses to a single
 * reading column with the hierarchy intact.
 *
 * The picture is what gives the left column its weight, which is why that
 * column does not need to be sticky to hold the spread together.
 */
export function Approach() {
  return (
    <section className="ab-section ab-approach" aria-labelledby="about-approach-heading">
      <div data-about-group="">
        <AboutMarker index={ABOUT_APPROACH.index} label={ABOUT_APPROACH.marker} />
      </div>

      <div className="ab-approach__spread">
        <div className="ab-approach__lead" data-about-group="">
          <h2 className="ab-approach__heading" id="about-approach-heading">
            <span className="ab-heading__inner" data-about-reveal="">
              {ABOUT_APPROACH.heading}
            </span>
          </h2>

          <p className="ab-approach__standfirst">
            {ABOUT_APPROACH.standfirst.map((line) => (
              <span className="ab-approach__standfirst-line" key={line} data-about-reveal="">
                {line}
              </span>
            ))}
          </p>

          {ABOUT_APPROACH.image && (
            <AboutFigure image={ABOUT_APPROACH.image} className="ab-approach__figure" />
          )}
        </div>

        <div className="ab-approach__body" data-about-group="">
          {ABOUT_APPROACH.body.map((paragraph) => (
            <p className="ab-approach__paragraph" key={paragraph} data-about-reveal="">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
